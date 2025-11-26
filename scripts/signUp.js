/**
 * Firebase Realtime Database base URL.
 * @type {string}
 */
const BASE_URL =
  "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Checks if a name is valid:
 * at least 3 chars, only letters and hyphens (no spaces, no numbers).
 * @param {string} name
 * @returns {boolean}
 */
/**
 * Name muss Vorname + Nachname mit Leerzeichen haben,
 * nur Buchstaben (optional Bindestrich im Nachnamen), mind. 3 Zeichen.
 * @param {string} name
 * @returns {boolean}
 */
/**
 * Name: nur Buchstaben/Bindestriche,
 * Leerzeichen erlaubt, aber nicht Pflicht.
 * Mindestens 3 Zeichen.
 * @param {string} name
 * @returns {boolean}
 */
function isValidName(name) {
  const trimmed = name.trim();
  return trimmed.length >= 2 && /^[\p{L}\p{M}\s'.-]+$/u.test(trimmed);
}


function isValidEmail(email) {
  return /^[A-Za-z0-9](\.?[A-Za-z0-9_\-+])*@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)+$/.test(email.trim());
}


/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} password
 * @property {string} email
 */

/**
 * Fetches JSON data from Firebase for a given path.
 * @async
 * @param {string} path - Firebase collection/path (without .json).
 * @returns {Promise<any>} Parsed JSON response.
 */
async function getAllUsers(path) {
  const url = BASE_URL + path + ".json";
  const response = await fetch(url);
  const data = await response.json();
  // wie im Original: globale Hilfe-Variable
  // eslint-disable-next-line no-undef
  responseToJson = data;
  return data;
}

/**
 * Saves/overwrites data to Firebase at path/id (PUT).
 * @async
 * @param {string} [path=""] - Firebase collection/path.
 * @param {string|number} [id=""] - Firebase node id/key.
 * @param {Object} [data={}] - Payload to store.
 * @returns {Promise<any>} Firebase response JSON.
 */
async function postDataWithID(path = "", id = "", data = {}) {
  const url = BASE_URL + path + "/" + id + ".json";
  const options = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  const response = await fetch(url, options);
  const result = await response.json();
  return result;
}

/**
 * Handles signup form submit:
 * validates inputs, creates user, shows toast, and redirects to login.
 * @param {Event} [event]
 * @returns {void}
 */
function onclickFunction(event) {
  if (event) {
    event.preventDefault();
  }
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (isValidEmail(email)) {
    const errorEl = document.getElementById("error_message");
    errorEl.textContent =
      "Please use a real provider (e.g. gmail, outlook) with .com or .de";
    errorEl.classList.remove("visually-hidden");
    errorEl.style.color = "red";
    if (!validateEmailOnSubmit(email, errorEl)) {
      return;
    }
    if (!validateNameAndPasswordOnSubmit(name, password, errorEl)) {
      return;
    }
    resetError(errorEl);
    createUser(name, password, email);
    showToast("You signed up successfully", { duration: 1000, dim: true });
    setTimeout(jumpToLogin, 1200);
  }
}

/**
 * Validates email on submit and shows an error if needed.
 * @param {string} email
 * @param {HTMLElement} errorEl
 * @returns {boolean}
 */
function validateEmailOnSubmit(email, errorEl) {
  if (isValidEmail(email)) {
    return true;
  }
  showError(
    errorEl,
    "Bitte eine gültige E-Mail eingeben!"
  );
  return false;
}

/**
 * Validates name and password on submit and shows an error if needed.
 * @param {string} name
 * @param {string} password
 * @param {HTMLElement} errorEl
 * @returns {boolean}
 */
function validateNameAndPasswordOnSubmit(name, password, errorEl) {
  if (isValidName(name) && password) {
    return true;
  }
  showError(
    errorEl,
    "Bitte einen gültigen Namen ohne Zahlen oder Leerzeichen eingeben (mind. 3 Buchstaben)!"
  );
  return false;
}

/**
 * Redirects to login page.
 * @returns {void}
 */
function jumpToLogin() {
  window.location.href = "./index.html";
}

/**
 * Shows the white-screen overlay.
 * @returns {void}
 */
function getWhiteScreen() {
  const contentRef = document.getElementById("white-screen");
  contentRef.classList.remove("d_none");
}

/**
 * Creates a new user entry in Firebase.
 * @async
 * @param {string} inputName
 * @param {string} inputPassword
 * @param {string} inputMail
 * @returns {Promise<void>}
 */
async function createUser(inputName, inputPassword, inputMail) {
  const userResponse = await getAllUsers("users");
  const userKeysArray = Object.keys(userResponse);
  const user = {
    name: inputName,
    password: inputPassword,
    email: inputMail,
  };
  postDataWithID("users", userKeysArray.length, user);
}

/**
 * Validates form fields + policy checkbox and enables/disables submit button.
 * Shows inline error messages if invalid.
 * @returns {void}
 */
function checkPolicyandAnswers() {
  const values = getSignupValues();
  const state = getValidationState(values);
  updateErrorForSignup(values, state);
  updateButtonState(values, state);
}

/**
 * Collects all signup form values and related elements.
 * @returns {{name:string,email:string,password:string,confirmPassword:string,checkbox:HTMLElement,button:HTMLButtonElement,errorEl:HTMLElement}}
 */
function getSignupValues() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirm_password")
    .value.trim();
  const checkbox = document.getElementById("accept_terms");
  const button = document.querySelector(".primary_button");
  const errorEl = document.getElementById("error_message");
  return { name, email, password, confirmPassword, checkbox, button, errorEl };
}

/**
 * Calculates validation flags for the current form values.
 * @param {ReturnType<typeof getSignupValues>} values
 * @returns {{passwordSame:boolean,emailValid:boolean,nameValid:boolean}}
 */
function getValidationState(values) {
  const passwordSame = values.password === values.confirmPassword;
  const emailValid = isValidEmail(values.email);
  const nameValid = isValidName(values.name);
  return { passwordSame, emailValid, nameValid };
}

/**
 * Updates the inline error message depending on invalid field.
 * @param {ReturnType<typeof getSignupValues>} values
 * @param {{passwordSame:boolean,emailValid:boolean,nameValid:boolean}} state
 * @returns {void}
 */
function updateErrorForSignup(values, state) {
  const errorEl = values.errorEl;
  if (!state.emailValid && values.email.length > 0) {
    showError(
      errorEl,
      "Bitte eine gültige E-Mail eingeben!"
    );
  } else if (values.name.length > 0 && !state.nameValid) {
    showError(
      errorEl,
      "Bitte einen korrekten Namen mit mind. 3 Buchstaben eingeben!"
    );
  } else if (
    values.password.length > 0 &&
    values.confirmPassword.length > 0 &&
    !state.passwordSame
  ) {
    showError(errorEl, "Die Passwörter stimmen nicht überein!");
  } else {
    resetError(errorEl);
  }
}

/**
 * Enables/disables the submit button based on validation state.
 * @param {ReturnType<typeof getSignupValues>} values
 * @param {{passwordSame:boolean,emailValid:boolean,nameValid:boolean}} state
 * @returns {void}
 */
function updateButtonState(values, state) {
  const allFilled =
    values.name &&
    values.email &&
    values.password &&
    values.confirmPassword &&
    values.checkbox.checked;
  const enabled =
    allFilled && state.passwordSame && state.emailValid && state.nameValid;
  values.button.disabled = !enabled;
}

/**
 * Shows an error message element in red.
 * @param {HTMLElement} errorEl
 * @param {string} text
 * @returns {void}
 */
function showError(errorEl, text) {
  errorEl.textContent = text;
  errorEl.classList.remove("visually-hidden");
  errorEl.style.color = "red";
}

/**
 * Resets the error message element.
 * @param {HTMLElement} errorEl
 * @returns {void}
 */
function resetError(errorEl) {
  errorEl.textContent = "";
  errorEl.classList.add("visually-hidden");
}

/**
 * @typedef {Object} ToastOptions
 * @property {number} [duration=3000]
 * @property {boolean} [dim=true]
 */

/**
 * Shows a toast message. Optionally dims background while visible.
 * Kein addEventListener, nur onanimationend.
 * @param {string} text
 * @param {ToastOptions} [options]
 * @returns {void}
 */
function showToast(text, options) {
  if (!options) {
    options = {};
  }
  const duration = options.duration || 3000;
  const dim = options.dim === undefined ? true : options.dim;
  const root = ensureToastRoot();
  const el = document.createElement("div");
  el.className = "toast toast--show";
  el.innerHTML = "<span>" + text + "</span>";
  root.appendChild(el);
  const dimEl = document.getElementById("toast-dim");
  if (dim && dimEl) {
    dimEl.classList.add("dim--show");
  }
  hideToastLater(el, dimEl, dim, duration);
}

/**
 * Makes sure the toast root element exists.
 * @returns {HTMLElement}
 */
function ensureToastRoot() {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  return root;
}

/**
 * Hides the toast after a delay.
 * Uses onanimationend instead of addEventListener.
 * @param {HTMLElement} el
 * @param {HTMLElement|null} dimEl
 * @param {boolean} dim
 * @param {number} duration
 * @returns {void}
 */
function hideToastLater(el, dimEl, dim, duration) {
  setTimeout(function () {
    el.classList.remove("toast--show");
    el.classList.add("toast--hide");
    el.onanimationend = function () {
      el.remove();
    };
    if (dim && dimEl) {
      dimEl.classList.remove("dim--show");
    }
  }, duration);
}

/**
 * Exposes showToast globally.
 * @type {(text: string, options?: ToastOptions) => void}
 */
window.showToast = showToast;
