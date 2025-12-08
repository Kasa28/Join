/* === login.js | Handles user authentication, login guard and login logic === */

import {
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/* Demo-Kontakte (werden aktuell nicht aktiv genutzt, können bleiben) */
let exampleContacts = [
  { username: "Peter",   email: "peter-lustig@hotmail.de",       PhoneNumber: "+491517866563",     color: "pink" },
  { username: "Karsten", email: "karsten-stahl@gmail.de",        PhoneNumber: "+49151478632475",   color: "orange" },
  { username: "Thomas",  email: "thomas-gottschalck@live.de",    PhoneNumber: "+491517896455",     color: "green" },
  { username: "Rainer",  email: "rainer-winkler@gmail.de",       PhoneNumber: "+491507489652",     color: "blue" },
  { username: "Angela",  email: "angela-merkel@gmail.de",        PhoneNumber: "+491511462385",     color: "red" },
  { username: "Kai",     email: "kai-pflaume@live.de",           PhoneNumber: "+491504896257",     color: "brown" },
  { username: "Til",     email: "til-schweiger@gmail.de",        PhoneNumber: "+491514563248",     color: "orange" },
  { username: "Günther", email: "günther-jauch@gmail.de",        PhoneNumber: "+4915157652244",    color: "blue" },
  { username: "Simon",   email: "simon-krätschmer@gmail.de",     PhoneNumber: "+491504621354",     color: "red" },
];

/* === Auth-Persistenz: Nur für aktuelle Browser-Sitzung merken === */
/* Wird auf jeder Seite gesetzt, auf der login.js eingebunden ist */
if (window.auth) {
  setPersistence(window.auth, browserSessionPersistence).catch((err) =>
    console.warn("Could not set auth persistence:", err)
  );
}

/* === Login Handling === */
/**
 * Processes a login attempt: validates email format, checks credentials,
 * displays error messages, and redirects on success.
 * @param {Event} event - The form submit event.
 */
async function login(event) {
  if (event) event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("error_message");

  try {
    if (window.authReady) await window.authReady;
    const cred = await signInWithEmailAndPassword(window.auth, email, password);
    const idToken = await cred.user.getIdToken();
    window.idToken = idToken;
    window.location.href = "./summaryAll.html";
  } catch (err) {
    errorEl.textContent = "Invalid email or password!";
    errorEl.classList.remove("visually-hidden");
    errorEl.style.color = "red";
  }
}

async function loginAsGuest() {
  if (window.authReady) await window.authReady;
  const cred = await window.signInAnonymously();
  const idToken = await cred.user.getIdToken();
  window.idToken = idToken;
  window.location.href = "./summaryAll.html";
}


async function checkIfLogedInOnProtectedPage() {
  if (window.authReady) await window.authReady;
  if (!window.currentUser) {
    window.location.href = "./index.html";
    return;
  }
  document.body.style.visibility = "visible";
}

async function logout() {
  try {
    if (window.authReady) {
      await window.authReady;
    }
    if (window.signOut) {
      await window.signOut();
    }
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    window.currentUser = null;
    window.idToken = null;
    window.location.href = "./index.html";
  }
}

/**
 * Enables or disables the login button based on email and password input fields.
 */
function checkLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const button = document.getElementById("login_button");
  button.disabled = !(email && password);
}

const emailInput = document.getElementById("email");
if (emailInput) {
  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const errorEl = document.getElementById("error_message");

    if (email && !emailValid) {
      errorEl.textContent = "Please enter a valid email address!";
      errorEl.classList.remove("visually-hidden");
    } else {
      errorEl.textContent = "";
      errorEl.classList.add("visually-hidden");
    }
  });
}

window.login = login;
window.loginAsGuest = loginAsGuest;
window.checkLogin = checkLogin;
window.checkIfLogedInOnProtectedPage = checkIfLogedInOnProtectedPage;
window.logout = logout;