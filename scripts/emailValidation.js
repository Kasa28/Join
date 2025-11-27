if (!window.blockedEmailProviders) {
  window.blockedEmailProviders = [];
}

if (!window.isAllowedEmailProvider) {
  /**
   * Prüft, ob eine Mail einen bekannten Provider hat + richtige Endung (.com / .de)
   * Beispiel: max@gmail.com → gültig
   * @param {string} email
   * @returns {boolean}
   */
  window.isAllowedEmailProvider = function isAllowedEmailProvider(email) {
    if (!email) return false;

    const match = String(email)
      .toLowerCase()
      .match(/^[^\s@]+@([^\.\s@]+)\.(com|de)$/);

    if (!match) return false;

    const provider = match[1];
    if (!window.blockedEmailProviders) return true;
    return !window.blockedEmailProviders.includes(provider);
  };
}


function isValidEmail(email) {
  if (!email) return false;

  return /^[A-Za-z0-9](\.?[A-Za-z0-9_\-+])*@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)+$/
    .test(email.trim());
}


function validateEmailOnSubmit(email, errorEl) {
  if (!isValidEmail(email)) {
    if (errorEl) showError(errorEl, "Bitte eine gültige E-Mail eingeben!");
    return false; 
  }
  if (!window.isAllowedEmailProvider(email)) {
    if (errorEl) showError(errorEl, "Bitte eine gültige E-Mail eingeben!");
    return false; 
  }
  if (errorEl) resetError(errorEl);
  return true;
}


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