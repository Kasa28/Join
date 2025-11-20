/**
 * Firebase Realtime Database base URL.
 * @type {string}
 */
const BASE_URL =
  "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";


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
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
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
  const response = await fetch(`${BASE_URL}${path}/${id}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}


/**
 * Handles signup form submit:
 * validates inputs, creates user, shows toast, and redirects to login.
 * @param {Event} [event]
 * @returns {void}
 */
function onclickFunction(event) {
  if (event) event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const errorEl = document.getElementById("error_message");
    errorEl.textContent = "Bitte eine gültige E-Mail eingeben!";
    errorEl.classList.remove("visually-hidden");
    errorEl.style.color = "red";
    return;
  }
  if (!name || !password) {
    const errorEl = document.getElementById("error_message");
    errorEl.textContent = "Bitte alle Felder korrekt ausfüllen!";
    errorEl.classList.remove("visually-hidden");
    errorEl.style.color = "red";
    return;
  }
  const errorEl = document.getElementById("error_message");
  createUser(name, password, email);
  showToast("You signed up successfully", { duration: 1000, dim: true });
  setTimeout(() => {
    jumpToLogin();
  }, 1200);
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
  let userResponse = await getAllUsers("users");
  let UserKeysArray = Object.keys(userResponse);
  const user = { name: inputName, password: inputPassword, email: inputMail};
  postDataWithID("users", UserKeysArray.length, user);
}


/**
 * Validates form fields + policy checkbox and enables/disables submit button.
 * Shows inline error messages if invalid.
 * @returns {void}
 */
function checkPolicyandAnswers() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirm_password")
    .value.trim();
  const checkbox = document.getElementById("accept_terms");
  const button = document.querySelector(".primary_button");
  const passwordSame = password == confirmPassword;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const errorEl = document.getElementById("error_message");
  if (!emailValid && email.length > 0) {
    errorEl.textContent = "Bitte eine gültige E-Mail eingeben!";
    errorEl.classList.remove("visually-hidden");
    errorEl.style.color = "red";
  }
  // Name too short
  else if (name.length > 0 && name.length < 3) {
    errorEl.textContent = "Der Name muss mindestens 3 Zeichen lang sein!";
    errorEl.classList.remove("visually-hidden");
    errorEl.style.color = "red";
  }
  // Password mismatch
  else if (password.length > 0 && confirmPassword.length > 0 && !passwordSame) {
    errorEl.textContent = "Die Passwörter stimmen nicht überein!";
    errorEl.classList.remove("visually-hidden");
    errorEl.style.color = "red";
  }
  // Everything valid so far
  else {
    errorEl.textContent = "";
    errorEl.classList.add("visually-hidden");
  }
  const allFilled =
    name && email && password && confirmPassword && checkbox.checked;
    button.disabled = !allFilled || !passwordSame || !emailValid;
}

/**
 * @typedef {Object} ToastOptions
 * @property {number} [duration=3000]
 * @property {boolean} [dim=true]
 */


/**
 * Shows a toast message. Optionally dims background while visible.
 * @param {string} text
 * @param {ToastOptions} [options]
 * @returns {void}
 */


/* === Toast Notification Utility === */
function showToast(text, { duration = 3000, dim = true } = {}) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  const el = document.createElement("div");
  el.className = "toast toast--show";
  el.innerHTML = `<span>${text}</span>`;
  root.appendChild(el);
  const dimEl = document.getElementById("toast-dim");
  if (dim && dimEl) dimEl.classList.add("dim--show");
  setTimeout(() => {
    el.classList.remove("toast--show");
    el.classList.add("toast--hide");
    el.addEventListener("animationend", () => el.remove(), { once: true });
    if (dim && dimEl) dimEl.classList.remove("dim--show");
  }, duration);
}

/**
 * Exposes showToast globally.
 * @type {(text: string, options?: ToastOptions) => void}
 */
window.showToast = showToast;
