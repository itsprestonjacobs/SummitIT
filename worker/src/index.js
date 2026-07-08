/* ============================================================
   Summit IT — Cloudflare Worker (AI chat proxy)

   Why this exists: GitHub Pages is static and can't keep a secret,
   so the Anthropic API key would be exposed if the browser called
   Claude directly. This tiny Worker holds the key server-side and
   forwards chat messages to the Claude API.

   Deploy:  see ../../SETUP.md
     npm i -g wrangler
     wrangler login
     wrangler secret put ANTHROPIC_API_KEY   # paste your key
     wrangler deploy
   Then copy the printed *.workers.dev URL into js/config.js.
   ============================================================ */

// Support bots handle "simple problems", so this uses Haiku 4.5 — fast and
// ~5x cheaper than Opus ($1/$5 vs $5/$25 per 1M tokens). For higher-quality
// answers at higher cost, change this one line to "claude-opus-4-8".
const MODEL = "claude-haiku-4-5";

// Keep replies short to control cost. Bump this if answers get cut off.
const MAX_TOKENS = 500;

// Origins allowed to call this worker. Add your custom domain here later.
const ALLOWED = [
  "https://itsprestonjacobs.github.io",
];

const SYSTEM_PROMPT = [
  "You are the Summit IT support assistant. Summit IT is a friendly IT-support business",
  "(CEO Isaac Middleton, CTO Preston Jacobs) whose tagline is \"Reliable IT. Real Solutions.\"",
  "",
  "Your job is to help visitors with common, simple tech problems in plain, friendly language",
  "with no jargon: Wi-Fi and internet issues, slow or frozen computers, printers, passwords and",
  "logins, software installs and updates, email setup, phones/tablets, and basic troubleshooting.",
  "Give clear, step-by-step help and ask one clarifying question at a time when needed.",
  "",
  "When a problem is complex, involves broken or physical hardware, needs to be seen to be",
  "diagnosed, or the person is stuck after basic steps, warmly recommend booking a voice or video",
  "call with Summit IT — on a video call they can show the device on camera and the team fixes it",
  "live. Point them to the \"Book a call\" button / the scheduling form on the page.",
  "",
  "Keep replies very short — 2 to 4 sentences, no long lists — practical and encouraging. Stay on IT-support topics;",
  "if asked something unrelated, gently steer back. Never invent prices, guarantees, or personal data.",
].join("\n");

function corsHeaders(origin) {
  const allow = ALLOWED.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
  return {
    "Access-Control-Allow-Origin": allow ? origin : ALLOWED[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin);
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "Server not configured: missing ANTHROPIC_API_KEY secret." }, 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: "Invalid JSON" }, 400, origin);
    }

    // Sanitize the incoming conversation.
    let msgs = Array.isArray(body.messages) ? body.messages : [];
    msgs = msgs
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
      .slice(-10); // only send recent turns — cheaper input tokens

    // Anthropic requires the first message to be a user turn.
    while (msgs.length && msgs[0].role === "assistant") msgs.shift();
    if (!msgs.length) {
      return json({ reply: "Hi! Tell me what's going on with your device and I'll help." }, 200, origin);
    }

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          messages: msgs,
        }),
      });

      if (!resp.ok) {
        return json({ error: "Upstream error", status: resp.status }, 502, origin);
      }

      const data = await resp.json();
      const reply = Array.isArray(data.content)
        ? data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim()
        : "";

      return json({ reply: reply || "Sorry, I didn't catch that — could you rephrase?" }, 200, origin);
    } catch (e) {
      return json({ error: "Request failed" }, 502, origin);
    }
  },
};
