# Summit IT — Setup Guide

The site is already live and usable. This guide turns on the two features that need a free account,
and fills in your real business details. Budget ~15 minutes. **Everything you change is in one file:
`js/config.js`.**

---

## 0. Fill in your business details (2 min)

Open `js/config.js` and edit the `business` block:

```js
business: {
  phone:       "(555) 123-4567",
  email:       "hello@summitit.com",
  hours:       "Mon–Sat, 8am–8pm",
  serviceArea: "Remote support anywhere · on-site in [your area]"
}
```

Commit and push — these show up in the Contact section and footer.

---

## 1. Turn on the "Book a call" form — Web3Forms (5 min)

The scheduling form emails you when someone requests a call. No server needed.

1. Go to **https://web3forms.com** and enter the email address where you want requests to land
   (e.g. Isaac's inbox). They email you an **Access Key**.
2. Paste it into `js/config.js`:
   ```js
   WEB3FORMS_KEY: "your-access-key-here",
   ```
3. Push. Submit a test request on the site — you should get an email within a minute.

> Until this is set, the form politely tells visitors to call/email you instead.

---

## 2. Turn on the AI chat — Cloudflare Worker + Anthropic key (8 min)

The chatbot uses Claude. The key must stay secret, so it lives in a tiny Cloudflare Worker
(free tier is plenty). You deploy the worker once and paste its URL into `config.js`.

**a) Get an Anthropic API key**
- Sign up at **https://console.anthropic.com**, add a little credit, and create an API key
  (starts with `sk-ant-...`). Keep it private.

**b) Deploy the worker**
```bash
npm install -g wrangler          # one-time
cd worker
wrangler login                   # opens your browser (free Cloudflare account)
wrangler secret put ANTHROPIC_API_KEY   # paste your sk-ant-... key when prompted
wrangler deploy
```
Wrangler prints a URL like `https://summit-it-chat.your-name.workers.dev`.

**c) Connect it**
- Paste that URL into `js/config.js`:
  ```js
  WORKER_URL: "https://summit-it-chat.your-name.workers.dev",
  ```
- In `worker/src/index.js`, the `ALLOWED` list already includes
  `https://itsprestonjacobs.github.io`. If you add a custom domain later, add it there and
  `wrangler deploy` again.
- Push. Open the chat and ask something like "my wifi keeps dropping" — you'll get a real answer.

**Cost tip:** the worker uses `claude-opus-4-8` by default. For a simple support bot you can switch
`MODEL` in `worker/src/index.js` to `claude-haiku-4-5` — about **5× cheaper** ($1/$5 vs $5/$25 per
million tokens) and plenty smart for common questions. Change the one line and `wrangler deploy`.

### Local testing of the worker (optional)
```bash
cd worker
echo "ANTHROPIC_API_KEY=sk-ant-..." > .dev.vars   # git-ignored
wrangler dev
```
Point `WORKER_URL` at the local dev URL to test before deploying.

---

## 3. The actual video calls

When someone books, you get an email with their preferred time, whether they want **voice or video**,
and their timezone. Reply with a link to join. Free options:

- **Jitsi Meet** — https://meet.jit.si/SummitIT-<name> — no accounts, opens in the browser, camera
  works so the customer can show you the device. Just make up a room name and send the link.
- Google Meet or Zoom links also work.

---

## Publishing changes

This site auto-deploys from the `main` branch via GitHub Pages. To publish an edit:

```bash
git add -A
git commit -m "Update site"
git push
```

Changes are live at https://itsprestonjacobs.github.io/SummitIT/ within a minute or two.

## Custom domain (later, optional)

Add a `CNAME` file containing your domain (e.g. `summitit.com`), point your domain's DNS at GitHub
Pages, and add the domain to the worker's `ALLOWED` list. Ask if you want a hand with this.
