if (!window.blockedEmailProviders) {
  /** @type {string[]} */
  window.blockedEmailProviders = [];
}

if (!window.isAllowedEmailProvider) {
  /**
   * Checks if the email provider is allowed (based on an optional blocklist).
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

/**
 * Validates email structure (local part + domain) with basic rules.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email) return false;
  const [local, domain] = String(email).trim().split("@");
  if (!local || !domain) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (!/^[A-Za-z0-9._%+-]+$/.test(local) || !/[A-Za-z]/.test(local)) return false;
  if (!/^[A-Za-z0-9.-]+$/.test(domain)) return false;
  const parts = domain.split(".");
  if (parts.length < 2 || parts.some((p) => !p || p.startsWith("-") || p.endsWith("-"))) return false;
  const tld = parts[parts.length - 1], mainDomain = parts[parts.length - 2];
  if (!/^[A-Za-z]{2,}$/.test(tld) || !/[A-Za-z]/.test(mainDomain)) return false;
  return true;
}

/**
 * Full email validation for submit:
 * - structural check
 * - optional provider blocklist
 * @param {string} email
 * @param {HTMLElement} [errorEl]
 * @returns {boolean}
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
 * @param {string} email
 * @returns {boolean}
 */
function validateEmailInForm(email) {
  return isValidEmail(email);
}

/**
 * Shows an error message element with text and makes it visible.
 * @param {HTMLElement} errorEl
 * @param {string} text
 * @returns {void}
 */
function showError(errorEl, text) {
  if (!errorEl) return;

  errorEl.textContent = text;
  errorEl.classList.remove("visually-hidden");
  errorEl.style.color = "red";
}

/**
 * Resets an error message element and hides it.
 * @param {HTMLElement} errorEl
 * @returns {void}
 */
function resetError(errorEl) {
  if (!errorEl) return;
  errorEl.textContent = "";
  errorEl.classList.add("visually-hidden");
}
