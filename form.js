/**
 * form.js
 * -----------------------------------------------------------------
 * Multi-step consultation flow: state, validation, navigation,
 * and a configurable submission layer (server endpoint if
 * CONFIG.formEndpoint is set, otherwise WhatsApp/Email fallback).
 * -----------------------------------------------------------------
 */

const ConsultationForm = (() => {
  const state = {
    step: 1,
    totalSteps: 4,
    need: null,
    profile: null,
    name: "",
    email: "",
    phone: "",
    method: "email",
    message: ""
  };

  let root, stepsEl, progressEl, prevBtn, nextBtn, liveRegion;

  function init() {
    root = document.getElementById("consultation-form");
    if (!root) return;

    stepsEl = root.querySelectorAll("[data-step]");
    progressEl = root.querySelector(".form-progress-fill");
    prevBtn = root.querySelector("[data-form-prev]");
    nextBtn = root.querySelector("[data-form-next]");
    liveRegion = root.querySelector("[data-form-live]");

    bindSelectableCards();
    bindTextInputs();
    bindNav();

    render();
  }

  function bindSelectableCards() {
    root.querySelectorAll("[data-need-option]").forEach((card) => {
      card.addEventListener("click", () => {
        state.need = card.getAttribute("data-need-option");
        root.querySelectorAll("[data-need-option]").forEach((c) =>
          c.setAttribute("aria-pressed", c === card ? "true" : "false")
        );
        updateNextEnabled();
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

    root.querySelectorAll("[data-profile-option]").forEach((card) => {
      card.addEventListener("click", () => {
        state.profile = card.getAttribute("data-profile-option");
        root.querySelectorAll("[data-profile-option]").forEach((c) =>
          c.setAttribute("aria-pressed", c === card ? "true" : "false")
        );
        updateNextEnabled();
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  function bindTextInputs() {
    const nameInput = root.querySelector("#field-name");
    const emailInput = root.querySelector("#field-email");
    const phoneInput = root.querySelector("#field-phone");
    const messageInput = root.querySelector("#field-message");
    const methodInputs = root.querySelectorAll('input[name="consult-method"]');

    nameInput.addEventListener("input", (e) => {
      state.name = e.target.value;
      updateNextEnabled();
    });
    emailInput.addEventListener("input", (e) => {
      state.email = e.target.value;
      updateNextEnabled();
    });
    phoneInput.addEventListener("input", (e) => {
      state.phone = e.target.value;
      updateNextEnabled();
    });
    messageInput.addEventListener("input", (e) => {
      state.message = e.target.value;
    });
    methodInputs.forEach((el) =>
      el.addEventListener("change", (e) => {
        if (e.target.checked) state.method = e.target.value;
      })
    );
  }

  function bindNav() {
    prevBtn.addEventListener("click", () => {
      if (state.step > 1) {
        state.step -= 1;
        render();
      }
    });

    nextBtn.addEventListener("click", () => {
      if (state.step === 3 && !validateStep3()) return;

      if (state.step < state.totalSteps) {
        state.step += 1;
        if (state.step === state.totalSteps) renderSummary();
        render();
      } else {
        submit();
      }
    });

    root.querySelector("[data-form-close]")?.addEventListener("click", closeModal);
    root.querySelector("[data-form-backdrop]")?.addEventListener("click", closeModal);
  }

  function validateStep3() {
    const emailInput = root.querySelector("#field-email");
    const phoneInput = root.querySelector("#field-phone");
    let valid = true;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+]?[\d\s()-]{7,15}$/;

    clearFieldError(root.querySelector("#field-name"));
    clearFieldError(emailInput);
    clearFieldError(phoneInput);

    if (!state.name.trim()) {
      setFieldError(root.querySelector("#field-name"), "Please enter your name.");
      valid = false;
    }
    if (!emailPattern.test(state.email.trim())) {
      setFieldError(emailInput, "Please enter a valid email address.");
      valid = false;
    }
    if (!phonePattern.test(state.phone.trim())) {
      setFieldError(phoneInput, "Please enter a valid phone number.");
      valid = false;
    }
    return valid;
  }

  function setFieldError(input, msg) {
    input.setAttribute("aria-invalid", "true");
    const err = input.parentElement.querySelector(".field-error");
    if (err) {
      err.textContent = msg;
      err.hidden = false;
    }
  }

  function clearFieldError(input) {
    input.removeAttribute("aria-invalid");
    const err = input.parentElement.querySelector(".field-error");
    if (err) err.hidden = true;
  }

  function updateNextEnabled() {
    let enabled = true;
    if (state.step === 1) enabled = !!state.need;
    if (state.step === 2) enabled = !!state.profile;
    if (state.step === 3) {
      enabled = state.name.trim() && state.email.trim() && state.phone.trim();
    }
    nextBtn.disabled = !enabled;
  }

  function render() {
    stepsEl.forEach((el) => {
      const stepNum = Number(el.getAttribute("data-step"));
      el.hidden = stepNum !== state.step;
    });

    progressEl.style.width = `${(state.step / state.totalSteps) * 100}%`;
    root.querySelector("[data-step-counter]").textContent =
      `Step ${state.step} of ${state.totalSteps}`;

    prevBtn.hidden = state.step === 1;
    nextBtn.textContent =
      state.step === state.totalSteps ? "Request Consultation \u2192" : "Continue";

    updateNextEnabled();

    const activeHeading = root.querySelector(`[data-step="${state.step}"] h3`);
    if (activeHeading && liveRegion) liveRegion.textContent = activeHeading.textContent;

    const focusTarget = root.querySelector(`[data-step="${state.step}"]`);
    if (focusTarget) focusTarget.setAttribute("tabindex", "-1");
  }

  function renderSummary() {
    const summaryEl = root.querySelector("[data-summary]");
    const needLabels = {
      "income-tax": "Income Tax",
      "gst": "GST",
      "tax-planning": "Tax Planning",
      "business-tax": "Business Tax",
      "tax-notice": "Tax Notice",
      "stock-research": "Stock Research",
      "portfolio-analysis": "Portfolio Analysis",
      "market-analysis": "Market Analysis",
      "general": "General Consultation"
    };
    const profileLabels = {
      individual: "Individual",
      salaried: "Salaried Professional",
      freelancer: "Freelancer",
      business: "Business Owner",
      startup: "Startup",
      other: "Other"
    };

    summaryEl.innerHTML = `
      <div class="summary-row"><span>Need</span><span>${needLabels[state.need] || "\u2014"}</span></div>
      <div class="summary-row"><span>Profile</span><span>${profileLabels[state.profile] || "\u2014"}</span></div>
      <div class="summary-row"><span>Name</span><span>${escapeHtml(state.name)}</span></div>
      <div class="summary-row"><span>Email</span><span>${escapeHtml(state.email)}</span></div>
      <div class="summary-row"><span>Phone</span><span>${escapeHtml(state.phone)}</span></div>
      <div class="summary-row"><span>Preferred Contact</span><span>${state.method === "google-meet" ? "Google Meet" : state.method === "whatsapp" ? "WhatsApp" : "Email"}</span></div>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function submit() {
    const submitArea = root.querySelector("[data-submit-area]");
    const formBody = root.querySelector("[data-form-body]");
    const footer = root.querySelector(".form-nav");

    footer.hidden = true;
    formBody.hidden = true;
    submitArea.hidden = false;
    submitArea.innerHTML = renderLoadingState();

    const payload = {
      need: state.need,
      profile: state.profile,
      name: state.name,
      email: state.email,
      phone: state.phone,
      preferredMethod: state.method,
      message: state.message
    };

    if (CONFIG.formEndpoint) {
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Request failed");
        submitArea.innerHTML = renderSuccessState();
        bindSuccessActions();
      } catch (err) {
        submitArea.innerHTML = renderErrorState();
        bindErrorActions(footer, formBody, submitArea);
      }
    } else {
      // No backend configured: offer WhatsApp / Email as first-class paths.
      submitArea.innerHTML = renderFallbackState(payload);
      bindFallbackActions(payload);
    }
  }

  function renderLoadingState() {
    return `
      <div class="form-status" role="status" aria-live="polite">
        <div class="spinner" aria-hidden="true"></div>
        <p>Sending your request…</p>
      </div>`;
  }

  function renderSuccessState() {
    return `
      <div class="form-status form-status--success" role="status">
        <p class="form-status-title">Request received.</p>
        <p>We'll be in touch at ${escapeHtml(state.email)} shortly.</p>
        <button type="button" class="btn btn-ghost" data-form-close>Close</button>
      </div>`;
  }

  function renderErrorState() {
    return `
      <div class="form-status form-status--error" role="alert">
        <p class="form-status-title">Something went wrong.</p>
        <p>Your request wasn't sent. Please try again, or reach out directly.</p>
        <div class="form-status-actions">
          <button type="button" class="btn btn-primary" data-retry>Try Again</button>
        </div>
      </div>`;
  }

  function renderFallbackState(payload) {
    const summaryLine = `Need: ${payload.need || "\u2014"} | Profile: ${payload.profile || "\u2014"} | Name: ${payload.name}`;
    return `
      <div class="form-status" role="status">
        <p class="form-status-title">You're almost there.</p>
        <p>Send your details directly and we'll respond as soon as possible.</p>
        <div class="form-status-actions">
          <a class="btn btn-primary" data-fallback="whatsapp" href="#" target="_blank" rel="noopener">Continue on WhatsApp</a>
          <a class="btn btn-ghost" data-fallback="email" href="#">Continue by Email</a>
        </div>
      </div>`;
  }

  function bindSuccessActions() {
    root.querySelector("[data-form-close]")?.addEventListener("click", closeModal);
  }

  function bindErrorActions(footer, formBody, submitArea) {
    root.querySelector("[data-retry]")?.addEventListener("click", () => {
      submitArea.hidden = true;
      formBody.hidden = false;
      footer.hidden = false;
    });
  }

  function bindFallbackActions(payload) {
    const waLink = root.querySelector('[data-fallback="whatsapp"]');
    const emailLink = root.querySelector('[data-fallback="email"]');

    const bodyLines = [
      `Name: ${payload.name}`,
      `Phone: ${payload.phone}`,
      `Need: ${payload.need || "\u2014"}`,
      `Profile: ${payload.profile || "\u2014"}`,
      payload.message ? `Message: ${payload.message}` : null
    ].filter(Boolean);

    if (waLink) {
      const text = encodeURIComponent(
        `Hello, I would like to discuss my tax requirements.\n\n${bodyLines.join("\n")}`
      );
      waLink.href = `https://wa.me/${CONFIG.whatsapp}?text=${text}`;
    }
    if (emailLink) {
      const subject = encodeURIComponent("Consultation Request");
      const body = encodeURIComponent(bodyLines.join("\n"));
      emailLink.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    }
  }

  function openModal(prefill) {
    root.hidden = false;
    document.body.style.overflow = "hidden";
    reset();
    if (prefill?.need) state.need = prefill.need;
    render();
    root.querySelector(".form-panel")?.focus();
  }

  function closeModal() {
    root.hidden = true;
    document.body.style.overflow = "";
  }

  function reset() {
    state.step = 1;
    state.need = null;
    state.profile = null;
    state.name = "";
    state.email = "";
    state.phone = "";
    state.method = "email";
    state.message = "";

    root.querySelectorAll("[data-need-option], [data-profile-option]").forEach((c) =>
      c.setAttribute("aria-pressed", "false")
    );
    ["#field-name", "#field-email", "#field-phone", "#field-message"].forEach((sel) => {
      const el = root.querySelector(sel);
      if (el) el.value = "";
    });
    const footer = root.querySelector(".form-nav");
    const formBody = root.querySelector("[data-form-body]");
    const submitArea = root.querySelector("[data-submit-area]");
    if (footer) footer.hidden = false;
    if (formBody) formBody.hidden = false;
    if (submitArea) {
      submitArea.hidden = true;
      submitArea.innerHTML = "";
    }
  }

  return { init, openModal, closeModal };
})();
