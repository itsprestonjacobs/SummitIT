# Summit IT — Website

Marketing site for **Summit IT** — *Reliable IT. Real Solutions.*
Static site hosted on GitHub Pages, with an AI chat assistant and a "book a call" scheduling form.

**Live site:** https://itsprestonjacobs.github.io/SummitIT/

- CEO: Isaac Middleton
- CTO: Preston Jacobs

---

## What's here

```
index.html          The whole site (single page)
css/styles.css      Styles (palette sampled from the logo)
js/
  config.js         ⚙️ The ONLY file you edit to go live (3 credentials + business details)
  main.js           Nav, header, contact details, year
  chat.js           AI chat widget
  schedule.js       Scheduling form (emails your team)
assets/             Logo mark, favicon, shield (SVG)
worker/             Cloudflare Worker that powers the AI chat (holds the API key)
SETUP.md            Step-by-step: get it fully live in ~15 minutes (all free)
```

## How it works

- **Text chat** for simple problems → answered by an AI assistant (Claude), proxied through a small
  Cloudflare Worker so the API key stays secret. If the worker isn't set up yet, the chat still works
  in a friendly "offline" mode that points people to book a call.
- **Book a call** → a custom form (voice or video, date/time) that emails Isaac & Preston via Web3Forms.
  On a video call, customers can show the device on camera so we can fix it live.

## Run it locally

```bash
# from the project folder
python -m http.server 8080
# then open http://localhost:8080
```

The site works immediately (chat runs in offline mode until you deploy the worker).

## Go fully live

Open **[SETUP.md](./SETUP.md)** — it walks through the three free accounts/keys and how to enable
GitHub Pages. Everything you configure lives in **`js/config.js`**.

## Using the exact logo PNG (optional)

The brand mark is a crisp SVG (`assets/mark.svg`) so the site is fast and self-contained.
If you'd rather use the original raster logo, drop the image into `assets/` (e.g.
`assets/summit-it-logo.png`) and point the hero `<img>` in `index.html` at it.
