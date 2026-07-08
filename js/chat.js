/* ============================================================
   Summit IT — chat.js
   Floating AI chat widget. Talks to the Cloudflare Worker
   (which holds the Anthropic API key). Degrades gracefully to
   an "offline" mode when no worker URL is configured.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = window.SUMMIT_CONFIG || {};
  var WORKER_URL = (CONFIG.WORKER_URL || "").trim();

  var root      = document.getElementById("chat");
  var launcher  = document.getElementById("chatLauncher");
  var panel     = document.getElementById("chatPanel");
  var closeBtn  = document.getElementById("chatClose");
  var messages  = document.getElementById("chatMessages");
  var form      = document.getElementById("chatForm");
  var input     = document.getElementById("chatText");
  var humanBtn  = document.getElementById("chatHuman");

  if (!root || !panel) return;

  var history = [];        // [{role:'user'|'assistant', content:string}]
  var started = false;
  var sending = false;
  var userMsgCount = 0;    // per-session cap to keep API costs predictable
  var MSG_LIMIT = 20;

  var GREETING = "Hi! I'm the Summit IT assistant. Tell me what's going on with your device or " +
    "network and I'll help with the quick fixes. If it needs a closer look, I'll help you book a call.";

  var OFFLINE_REPLY = "Thanks for the message! Our live assistant isn't connected just yet, but we don't " +
    "want to leave you hanging — the fastest way to get help is to book a quick voice or video call. " +
    "Tap “Book a call” below and pick a time that works for you.";

  /* ---------- open / close ---------- */
  function openChat() {
    root.classList.add("is-open");
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (!started) { started = true; addBot(GREETING); }
    setTimeout(function () { if (input) input.focus(); }, 50);
  }
  function closeChat() {
    root.classList.remove("is-open");
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  launcher.addEventListener("click", openChat);
  if (closeBtn) closeBtn.addEventListener("click", closeChat);

  // buttons anywhere on the page can open/close the chat
  document.querySelectorAll("[data-open-chat]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); openChat(); });
  });
  document.querySelectorAll("[data-close-chat]").forEach(function (el) {
    el.addEventListener("click", closeChat);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("is-open")) closeChat();
  });

  /* ---------- rendering ---------- */
  function scrollDown() { messages.scrollTop = messages.scrollHeight; }

  function bubble(text, who) {
    var el = document.createElement("div");
    el.className = "msg msg--" + who;
    el.textContent = text;
    messages.appendChild(el);
    scrollDown();
    return el;
  }
  function addUser(text) { bubble(text, "user"); history.push({ role: "user", content: text }); }
  function addBot(text)  { bubble(text, "bot");  history.push({ role: "assistant", content: text }); }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "msg msg--bot msg--typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    el.setAttribute("aria-label", "Assistant is typing");
    messages.appendChild(el);
    scrollDown();
    return el;
  }

  /* ---------- talk to a human ---------- */
  if (humanBtn) {
    humanBtn.addEventListener("click", function () {
      addBot("No problem — the best way to reach a real person is a quick call. Tap “Book a call” " +
             "and choose a time; we'll email you a link to join.");
      var contact = document.getElementById("contact");
      if (contact) contact.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- sending ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = (input.value || "").trim();
    if (!text || sending) return;
    if (userMsgCount >= MSG_LIMIT) {
      addBot("We've covered a lot here! The best next step is a quick call — tap “Book a call” below and we'll pick it up from there.");
      return;
    }
    userMsgCount++;
    input.value = "";
    addUser(text);
    respond();
  });

  function respond() {
    sending = true;
    var typing = showTyping();

    // Offline mode — no worker configured yet.
    if (!WORKER_URL) {
      setTimeout(function () {
        typing.remove();
        addBot(OFFLINE_REPLY);
        sending = false;
      }, 600);
      return;
    }

    fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        typing.remove();
        var reply = (data && data.reply) ? String(data.reply) :
          "Sorry — I couldn't come up with a reply just then. Could you rephrase, or book a call and we'll help directly?";
        addBot(reply);
      })
      .catch(function () {
        typing.remove();
        addBot("Hmm, I'm having trouble connecting right now. For anything urgent, please book a call " +
               "using the button below and we'll reach out with a link.");
      })
      .finally(function () { sending = false; });
  }
})();
