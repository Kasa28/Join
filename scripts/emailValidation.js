if (!window.blockedEmailProviders) {
  window.blockedEmailProviders = [];
}
/* -------------------------------------------------------------------------- */
/* 2. Provider-Validierung (.com / .de + echter Anbieter)                     */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* 3. Vollständige Syntaxprüfung einer E-Mail                                 */
/* -------------------------------------------------------------------------- */
function isValidEmail(email) {
  if (!email) return false;

  return /^[A-Za-z0-9](\.?[A-Za-z0-9_\-+])*@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)+$/
    .test(email.trim());
}

/* -------------------------------------------------------------------------- */
/* 4. Formularvalidierung (Syntax + Provider + Fehlermeldung)                 */
/* -------------------------------------------------------------------------- */
function validateEmailOnSubmit(email, errorEl) {
  if (!isValidEmail(email)) {
    if (errorEl) showError(errorEl, "Bitte eine gültige E-Mail eingeben!");
    return false; // ← ganz wichtig!
  }
  if (!window.isAllowedEmailProvider(email)) {
    if (errorEl) showError(errorEl, "Bitte eine gültige E-Mail eingeben!");
    return false; // ← ganz wichtig!
  }
  if (errorEl) resetError(errorEl);
  return true;
}

/* -------------------------------------------------------------------------- */
/* 5. Live-Formularvalidierung (nur Syntaxcheck)                              */
/* -------------------------------------------------------------------------- */
function validateEmailInForm(email) {
  return isValidEmail(email);
}


/* -------------------------------------------------------------------------- */
/* 6. Fehleranzeige                                                           */
/* -------------------------------------------------------------------------- */
function showError(errorEl, text) {
  if (!errorEl) return;

  errorEl.textContent = text;
  errorEl.classList.remove("visually-hidden");
  errorEl.style.color = "red";
}


/* -------------------------------------------------------------------------- */
/* 7. Fehler zurücksetzen                                                     */
/* -------------------------------------------------------------------------- */
function resetError(errorEl) {
  if (!errorEl) return;
  errorEl.textContent = "";
  errorEl.classList.add("visually-hidden");
}