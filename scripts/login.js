/* === login.js | Handles user authentication, login guard and login logic === */

let exampleContacts = [
   {"username": "Peter", "email": "peter-lustig@hotmail.de", "PhoneNumber": "+491517866563", "color": "pink"},
   {"username": "Karsten", "email": "karsten-stahl@gmail.de", "PhoneNumber": "+49151478632475", "color": "orange"},
   {"username": "Thomas", "email": "thomas-gottschalck@live.de", "PhoneNumber": "+491517896455", "color": "green"},
   {"username": "Rainer", "email": "rainer-winkler@gmail.de", "PhoneNumber": "+491507489652", "color": "blue"},
   {"username": "Angela", "email": "angela-merkel@gmail.de", "PhoneNumber": "+491511462385", "color": "red"},
   {"username": "Kai", "email": "kai-pflaume@live.de", "PhoneNumber": "+491504896257", "color": "yellow"},
   {"username": "Til", "email": "til-schweiger@gmail.de", "PhoneNumber": "+491514563248", "color": "orange"},
   {"username": "Günther", "email": "günther-jauch@gmail.de", "PhoneNumber": "+4915157652244", "color": "blue"},
   {"username": "Simon", "email": "simon-krätschmer@gmail.de", "PhoneNumber": "+491504621354", "color": "red"}
];

/* === Firebase Configuration === */
const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";
users = [];

/* === Fetch Users from Firebase === */
async function getAllUsers(path){
  let response = await fetch(BASE_URL + path + ".json");
  return responseToJson = await response.json();
}


/* === Initialize Users Array === */
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
   console.log(users);
}


/* === Login Handling === */
function login(event){
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
    const loginSuccessful = checkUsernamePassword(email, password);
    checkUsernamePassword(email, password);
   if(loginSuccessful){
      console.log("Login erfolgreich! Weiterleitung...");
      window.location.href = "./summaryAll.html";  
   } else {
      console.log("Login fehlgeschlagen.");
      const errorEl = document.getElementById("error_message");
      errorEl.textContent = "E-Mail oder Passwort ist ungültig!";
      errorEl.classList.remove("visually-hidden");
      errorEl.style.color = "red";  
   }
}


function loginAsGuest() {
   const guest = {
      id: "guest",
      name: "Guest",
      email: "guest@guest.com",
      friends: (typeof exampleContacts !== "undefined" ? exampleContacts : [])
   };
   localStorage.setItem("userData", JSON.stringify(guest));
   window.location.href = "./summaryAll.html";
}


/* === Credential Verification === */
function checkUsernamePassword(inputMail, inputPassword){
   for (let index = 0; index < users.length; index++) {
      let actualName = users[index].user.name;
      let actualMail = users[index].user.email;
      let actualPassword = users[index].user.password;
      let actualID = users[index].id;
      let actualFriendlist = users[index].user.friends || [];
      let actualJson = {"id" : actualID, "name" : actualName, "email" : actualMail, "friends" : actualFriendlist}
   if(actualMail === inputMail && actualPassword === inputPassword){   
            putUserDataIntoLocalStorage(actualJson);
            return true;
      }
   }
   return false;
}


/* === Local Storage Handling === */
function putUserDataIntoLocalStorage(inputJson){
   localStorage.setItem("userData", JSON.stringify(inputJson));
}


/* === Login Guard === */
function checkIfLogedIn() {
   const user = localStorage.getItem("userData");
   if (!user) {
      window.location.href = "./index.html";
      return;
   }
   document.body.style.visibility = "visible";
}

/* === Form Validation === */
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

