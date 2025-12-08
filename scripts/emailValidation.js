// Optional: Liste von geblockten Providern, z.B. ["trashmail", "10minutemail"]
if (!window.blockedEmailProviders) {
  window.blockedEmailProviders = [];
}
if (!window.isAllowedEmailProvider) {
  /**
   * Checks if the email provider is NOT blocked.
   * Everything is allowed unless explicitly listed in window.blockedEmailProviders.
   * Example: window.blockedEmailProviders = ["trashmail", "10minutemail"]
   * @param {string} email
   * @returns {boolean}
   */
  window.isAllowedEmailProvider = function isAllowedEmailProvider(email) {
    const trimmed = String(email || "").toLowerCase().trim();
    if (!trimmed) return false;
    const parts = trimmed.split("@");
    if (parts.length !== 2) return false;
    const domain = parts[1];
    const providerParts = domain.split(".");
    const provider = providerParts[0];
    if (!provider) return false;

    if (!Array.isArray(window.blockedEmailProviders) ||
        window.blockedEmailProviders.length === 0) {
      return true;
    }
    return !window.blockedEmailProviders.includes(provider);
  };
}

function isValidEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return false;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return false;
  }
  if (!/^[A-Za-z0-9._%+-]+$/.test(local)) {
    return false;
  }
  if (!/[A-Za-z]/.test(local)) {
    return false;
  }
  if (!/^[A-Za-z0-9.-]+$/.test(domain)) {
    return false;
  }
  const domainParts = domain.split(".");
  if (domainParts.length < 2) return false;
  if (domainParts.some((p) => !p || p.startsWith("-") || p.endsWith("-"))) {
    return false;
  }
  const tld = domainParts[domainParts.length - 1];
  if (!/^[A-Za-z]{2,}$/.test(tld)) {
    return false;
  }
  const mainDomain = domainParts[domainParts.length - 2];
  if (!/[A-Za-z]/.test(mainDomain)) {
    return false;
  }
  return true;
}

/**
 * Full email validation for submit:
 * - structural check
 * - optional provider blocklist
 */
function validateEmailOnSubmit(email, errorEl) {
  if (!isValidEmail(email)) {
    if (errorEl) showError(errorEl, "Please enter a valid email address!");
    return false;
  }

  if (!window.isAllowedEmailProvider(email)) {
    if (errorEl) showError(errorEl, "Please enter a valid email address!");
    return false;
  }

  if (errorEl) resetError(errorEl);
  return true;
}

/**
 * Used e.g. in blur/inline validation – only structural check.
 */
function validateEmailInForm(email) {
  return isValidEmail(email);
}

function showError(errorEl, text) {
  if (!errorEl) return;

  errorEl.textContent = text;
  errorEl.classList.remove("visually-hidden");
  errorEl.style.color = "red";
}

function resetError(errorEl) {
  if (!errorEl) return;
  errorEl.textContent = "";
  errorEl.classList.add("visually-hidden");
}
