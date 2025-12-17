/**
 * @file Handles user authentication, login guard and login logic.
 */

import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/**
 * Expose auth functions globally (for inline HTML handlers).
 * @type {(event?: Event) => Promise<void>}
 */
window.login = login;

/**
 * Expose guest login globally (for inline HTML handlers).
 * @type {() => Promise<void>}
 */
window.loginAsGuest = loginAsGuest;

/**
 * Expose login button state check globally.
 * @type {() => void}
 */
window.checkLogin = checkLogin;

/**
 * Expose protected-page guard globally.
 * @type {() => Promise<void>}
 */
window.checkIfLogedInOnProtectedPage = checkIfLogedInOnProtectedPage;

/**
 * Expose logout globally.
 * @type {() => Promise<void>}
 */
window.logout = logout;

/**
 * Validates the email format.
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
 * Example contacts used for demo purposes.
 * @type {{username:string,email:string,PhoneNumber:string,color:string}[]}
 */
let exampleContacts = [
  { username: "Peter",   email: "peter-lustig@hotmail.de",    PhoneNumber: "+491517866563",   color: "pink" },
  { username: "Karsten", email: "karsten-stahl@gmail.de",     PhoneNumber: "+49151478632475", color: "orange" },
  { username: "Thomas",  email: "thomas-gottschalck@live.de", PhoneNumber: "+491517896455",   color: "green" },
  { username: "Rainer",  email: "rainer-winkler@gmail.de",    PhoneNumber: "+491507489652",   color: "blue" },
  { username: "Angela",  email: "angela-merkel@gmail.de",     PhoneNumber: "+491511462385",   color: "red" },
  { username: "Kai",     email: "kai-pflaume@live.de",        PhoneNumber: "+491504896257",   color: "brown" },
  { username: "Til",     email: "til-schweiger@gmail.de",     PhoneNumber: "+491514563248",   color: "orange" },
  { username: "Günther", email: "günther-jauch@gmail.de",     PhoneNumber: "+4915157652244",  color: "blue" },
  { username: "Simon",   email: "simon-krätschmer@gmail.de",  PhoneNumber: "+491504621354",   color: "red" },
];

if (window.auth) {
  setPersistence(window.auth, browserSessionPersistence).catch((err) =>
    console.warn("Could not set auth persistence:", err)
  );
}

/**
 * Shows a login error message.
 * @param {HTMLElement|null} el
 * @param {string} message
 * @returns {void}
 */
function showLoginError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("visually-hidden");
  el.style.color = "red";
}

/**
 * Hides the login error message.
 * @param {HTMLElement|null} el
 * @returns {void}
 */
function hideLoginError(el) {
  if (!el) return;
  el.textContent = "";
  el.classList.add("visually-hidden");
}

/**
 * Handles email/password login.
 * @param {Event} [event]
 * @returns {Promise<void>}
 */
async function login(event) {
  if (event) event.preventDefault();
  const emailEl = document.getElementById("email"), passEl = document.getElementById("password"), errorEl = document.getElementById("error_message");
  const email = emailEl?.value.trim() || "", password = passEl?.value.trim() || "";
  if (!isValidEmail(email)) return showLoginError(errorEl, "Please enter a valid email address!");
  if (!password) return showLoginError(errorEl, "Please enter a password!");
  hideLoginError(errorEl);
  try {
    if (window.authReady) await window.authReady;
    const cred = await signInWithEmailAndPassword(window.auth, email, password);
    window.idToken = await cred.user.getIdToken(); window.location.href = "./summaryAll.html";
  } catch (err) { console.error("Login failed:", err); showLoginError(errorEl, "Invalid email or password!"); }
}

/**
 * Logs in as an anonymous guest user.
 * @returns {Promise<void>}
 */
async function loginAsGuest() {
  if (window.authReady) await window.authReady;
  const cred = await window.signInAnonymously();
  window.idToken = await cred.user.getIdToken();
  window.location.href = "./summaryAll.html";
}

/**
 * Guards protected pages and redirects if user is not logged in.
 * @returns {Promise<void>}
 */
async function checkIfLogedInOnProtectedPage() {
  if (window.authReady) await window.authReady;
  if (!window.currentUser) { window.location.href = "./index.html"; return; }
  document.body.style.visibility = "visible";
}

/**
 * Logs out the current user and clears auth state.
 * @returns {Promise<void>}
 */
async function logout() {
  try {
    if (window.authReady) await window.authReady;
    if (window.signOut) await window.signOut();
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    window.currentUser = null; window.idToken = null; window.location.href = "./index.html";
  }
}

/**
 * Enables or disables the login button based on input values.
 * @returns {void}
 */
function checkLogin() {
  const emailEl = document.getElementById("email"), passEl = document.getElementById("password"), button = document.getElementById("login_button");
  const email = emailEl?.value.trim() || "", password = passEl?.value.trim() || "";
  button.disabled = !(isValidEmail(email) && password);
}

const emailInput = document.getElementById("email");
if (emailInput) {
  emailInput.addEventListener("blur", function () {
    const email = emailInput.value.trim();
    const errorEl = document.getElementById("error_message");
    if (email && !isValidEmail(email)) {
      showLoginError(errorEl, "Please enter a valid email address!");
    } else {
      hideLoginError(errorEl);
    }
    checkLogin();
  });
}
