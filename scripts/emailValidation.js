if (!window.allowedEmailProviders) {
  window.allowedEmailProviders = [
    "gmail",
    "outlook",
    "hotmail",
    "live",
    "gmx",
    "web",
    "yahoo",
    "icloud",
    "protonmail",
  ];
}

if (!window.isAllowedEmailProvider) {
  /**
   * Validates that an email uses a real provider and ends with .com or .de.
   * @param {string} email
   * @returns {boolean}
   */
  window.isAllowedEmailProvider = function isAllowedEmailProvider(email) {
    const match = email
      .toLowerCase()
      .match(/^[^\s@]+@([^\.\s@]+)\.(com|de)$/);
    if (!match) return false;
    const domain = match[1];
    return window.allowedEmailProviders.includes(domain);
  };
}