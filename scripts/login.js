/* === login.js | Handles user authentication, login guard and login logic === */

import { signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

let exampleContacts = [
   {"username": "Peter", "email": "peter-lustig@hotmail.de", "PhoneNumber": "+491517866563", "color": "pink"},
   {"username": "Karsten", "email": "karsten-stahl@gmail.de", "PhoneNumber": "+49151478632475", "color": "orange"},
   {"username": "Thomas", "email": "thomas-gottschalck@live.de", "PhoneNumber": "+491517896455", "color": "green"},
   {"username": "Rainer", "email": "rainer-winkler@gmail.de", "PhoneNumber": "+491507489652", "color": "blue"},
   {"username": "Angela", "email": "angela-merkel@gmail.de", "PhoneNumber": "+491511462385", "color": "red"},
   {"username": "Kai", "email": "kai-pflaume@live.de", "PhoneNumber": "+491504896257", "color": "brown"},
   {"username": "Til", "email": "til-schweiger@gmail.de", "PhoneNumber": "+491514563248", "color": "orange"},
   {"username": "Günther", "email": "günther-jauch@gmail.de", "PhoneNumber": "+4915157652244", "color": "blue"},
   {"username": "Simon", "email": "simon-krätschmer@gmail.de", "PhoneNumber": "+491504621354", "color": "red"}
];


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
    await signInWithEmailAndPassword(window.auth, email, password);
    window.location.href = "./summaryAll.html";
  } catch (err) {
    errorEl.textContent = "Invalid email or password!";
    errorEl.classList.remove("visually-hidden");
    errorEl.style.color = "red";
  }
}


async function loginAsGuest() {
  if (window.authReady) await window.authReady;
  await window.signInAnonymously();
  window.location.href = "./summaryAll.html";
}


async function checkIfLogedIn() {
  if (window.authReady) await window.authReady;
  if (!window.currentUser) {
  window.location.href = "./index.html";
  return;
}
  document.body.style.visibility = "visible";
}


/* === Form Validation === */
/**
 * Enables or disables the login button based on email and password input fields.
 */
function checkLogin() {
   const email = document.getElementById('email').value.trim();
   const password = document.getElementById('password').value.trim();
   const button = document.getElementById('login_button');
   button.disabled = !(email && password);
 }


 document.getElementById("email").addEventListener("blur", () => {
   const email = document.getElementById("email").value.trim();
   const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   const errorEl = document.getElementById("error_message");
 
   if (email && !emailValid) {
     errorEl.textContent = "Bitte eine gültige E-Mail eingeben!";
     errorEl.classList.remove("visually-hidden");
   } else {
     errorEl.textContent = "";
     errorEl.classList.add("visually-hidden");
   }
 });


window.login = login;
window.loginAsGuest = loginAsGuest;
window.checkLogin = checkLogin;
window.checkIfLogedIn = checkIfLogedIn;