/* ============================================================
   Summit IT — config.js
   THIS IS THE ONLY FILE YOU NEED TO EDIT to go fully live.
   Fill in the three credentials and your real business details.
   See SETUP.md for step-by-step instructions (all free, ~15 min).
   ============================================================ */

window.SUMMIT_CONFIG = {

  /* 1) AI CHAT ---------------------------------------------------------------
     URL of your deployed Cloudflare Worker (it holds your Anthropic API key).
     Leave blank until you deploy the worker — the chat still works in a
     friendly "offline" mode that points people to book a call.            */
  WORKER_URL: "", // e.g. "https://summit-it-chat.your-name.workers.dev"

  /* 2) SCHEDULING FORM -------------------------------------------------------
     Your free Web3Forms access key (emails the form to your team).
     Get one at https://web3forms.com — paste the key here.
     Leave blank until you have it — the form will show your phone/email
     as a fallback instead.                                                */
  WEB3FORMS_KEY: "", // e.g. "abcd1234-5678-90ab-cdef-1234567890ab"

  /* 3) BUSINESS DETAILS ------------------------------------------------------
     Shown in the Contact section and footer. Fill in the real values.     */
  business: {
    phone:       "(000) 000-0000",
    email:       "hello@summitit.example",
    hours:       "Mon–Sat, 8am–8pm",
    serviceArea: "Remote support anywhere · on-site locally"
  }
};
