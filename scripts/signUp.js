/* === signUp.js | Handles user registration and validation === */

/* === Firebase Configuration === */
const BASE_URL =
  "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";


  /* === Fetch All Users === */
async function getAllUsers(path) {
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
}


/* === Save User Data to Firebase === */
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


/* === Signup Form Submission === */
function onclickFunction(event) {
  if (event) event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  createUser(name, password, email);
  showToast("You signed up successfully", { duration: 1000, dim: true });
  setTimeout(() => {
    jumpToLogin();
  }, 1200);
}


/* === Redirect to Login === */
function jumpToLogin() {
  window.location.href = "./index.html";
}


/* === UI: White Screen Overlay === */
function getWhiteScreen() {
  const contentRef = document.getElementById("white-screen");
  contentRef.classList.remove("d_none");
}


/* === Create New User === */
async function createUser(inputName, inputPassword, inputMail) {
  let userResponse = await getAllUsers("users");
  let UserKeysArray = Object.keys(userResponse);
  const user = { name: inputName, password: inputPassword, email: inputMail};
  postDataWithID("users", UserKeysArray.length, user);
}


/* === Form Validation and Policy Check === */
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
  const allFilled =
    name && email && password && confirmPassword && checkbox.checked;
  button.disabled = !allFilled || !passwordSame;
}


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


window.showToast = showToast;
