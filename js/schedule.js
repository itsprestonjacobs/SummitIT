/* ============================================================
   Summit IT — schedule.js
   Scheduling form. Submits to Web3Forms (emails the team).
   Degrades gracefully to phone/email when no key is configured.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = window.SUMMIT_CONFIG || {};
  var KEY = (CONFIG.WEB3FORMS_KEY || "").trim();
  var biz = CONFIG.business || {};

  var form   = document.getElementById("scheduleForm");
  var status = document.getElementById("sf-status");
  var submit = document.getElementById("sf-submit");
  var tzField = document.getElementById("sf-timezone");

  if (!form) return;

  // Capture the visitor's timezone so the team knows what "2pm" means.
  try {
    if (tzField) tzField.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (e) { /* ignore */ }

  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.className = "form-status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot — a bot ticked the hidden box.
    if (form.botcheck && form.botcheck.checked) return;

    // Native validation first.
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // No Web3Forms key yet → guide them to call/email instead.
    if (!KEY) {
      var phone = biz.phone || "";
      var email = biz.email || "";
      setStatus(
        "Online booking isn't connected yet. Please call " + phone +
        (email ? " or email " + email : "") + " and we'll get you scheduled right away.",
        "error"
      );
      return;
    }

    var data = Object.fromEntries(new FormData(form).entries());
    var payload = {
      access_key: KEY,
      subject: "New Summit IT call request — " + (data.name || "website"),
      from_name: "Summit IT website",
      name: data.name,
      email: data.email,
      phone: data.phone || "—",
      device: data.device,
      issue: data.issue,
      call_type: data.call_type,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      timezone: data.timezone || ""
    };

    submit.disabled = true;
    setStatus("Sending your request…");

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.success) {
          form.reset();
          if (tzField) {
            try { tzField.value = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
          }
          setStatus("Thanks! Your request is in. We'll email you a link to join your " +
            "voice or video call at the time you chose.", "success");
        } else {
          throw new Error(res && res.message ? res.message : "submit failed");
        }
      })
      .catch(function () {
        var phone = biz.phone || "";
        var email = biz.email || "";
        setStatus("Something went wrong sending that. Please try again, or reach us at " +
          phone + (email ? " / " + email : "") + ".", "error");
      })
      .finally(function () { submit.disabled = false; });
  });
})();
