/* === login.js | Handles user authentication, login guard and login logic === */

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

/* === Firebase Configuration === */
const BASE_URL = window.FIREBASE_DB_URL;
users = [];


/* === Fetch Users from Firebase === */
/**
 * Fetches all user records from Firebase at the specified path.
 * @param {string} path - The database path to query.
 * @returns {Promise<Object>} The JSON response containing all users.
 */
async function getAllUsers(path){
  let response = await fetch(BASE_URL + path + ".json");
  return responseToJson = await response.json();
}


/* === Initialize Users Array === */
/**
 * Fills the global users array with all users from Firebase,
 * mapping each entry to an object containing its ID and data.
 * @returns {Promise<void>}
 */
async function fillArray(){
   let userResponse = await getAllUsers("users");
   let UserKeysArray = Object.keys(userResponse);
   for (let index = 0; index < UserKeysArray.length; index++) {
      users.push(
         {
               id : UserKeysArray[index], 
               user : userResponse[UserKeysArray[index]],
         }
      ) 
   }
}


/* === Login Handling === */
/**
 * Processes a login attempt: validates email format, checks credentials,
 * displays error messages, and redirects on success.
 * @param {Event} event - The form submit event.
 */
async function login(event){
   if (event) event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorEl = document.getElementById("error_message");
      errorEl.textContent = "Bitte eine gültige E-Mail eingeben!";
      errorEl.classList.remove("visually-hidden");
      errorEl.style.color = "red";
      return;
    }
    const profile = checkUsernamePassword(email, password);
   if(profile){
      await window.signInAnonymously();
      await window.saveSessionUser(profile);
      window.location.href = "./summaryAll.html";
   } else {
      const errorEl = document.getElementById("error_message");
      errorEl.textContent = "E-Mail oder Passwort ist ungültig!";
      errorEl.classList.remove("visually-hidden");
      errorEl.style.color = "red";  
   }
}


/**
 * Logs the user in as a guest, stores guest data locally,
 * and redirects to the summary page.
 */
async function loginAsGuest() {
   const guest = {
      id: "guest",
      name: "Guest",
      email: "guest@guest.com",
      friends: (typeof exampleContacts !== "undefined" ? exampleContacts : [])
   };
   await window.signInAnonymously();
   await window.saveSessionUser(guest);
   window.location.href = "./summaryAll.html";
}


/* === Credential Verification === */
/**
 * Validates the user's email and password against the Firebase-loaded users array.
 * @param {string} inputMail - The email entered by the user.
 * @param {string} inputPassword - The password entered by the user.
 * @returns {boolean} True if credentials match, otherwise false.
 */
function checkUsernamePassword(inputMail, inputPassword){
   for (let index = 0; index < users.length; index++) {
      let actualName = users[index].user.name;
      let actualMail = users[index].user.email;
      let actualPassword = users[index].user.password;
      let actualID = users[index].id;
      let actualFriendlist = users[index].user.friends || [];
      let actualJson = {"id" : actualID, "name" : actualName, "email" : actualMail, "friends" : actualFriendlist}
   if(actualMail === inputMail && actualPassword === inputPassword){
            return actualJson;
      }
   }
   return null;
}


/* === Login Guard === */
/**
 * Guards protected pages by checking login state.
* Redirects to the login page if no authenticated user is available.
 */
function checkIfLogedIn() {
   window.sessionReady.then((session)=>{
      const loggedIn = Boolean(session || window.currentUser);
      if (!loggedIn) {
         window.location.href = "./index.html";
         return;
      }
      document.body.style.visibility = "visible";
   });
   return Boolean(window.sessionUser || window.currentUser);
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


 document.getElementById("password").addEventListener("blur", () => {
   const email = document.getElementById("email").value.trim();
   const password = document.getElementById("password").value.trim();
   const errorEl = document.getElementById("error_message");
 
   if (email && password && !checkUsernamePassword(email, password)) {
     errorEl.textContent = "E-Mail oder Passwort ist ungültig!";
     errorEl.classList.remove("visually-hidden");
   } else if (email && password && checkUsernamePassword(email, password)) {
     errorEl.textContent = "";
     errorEl.classList.add("visually-hidden");
   }
 });

