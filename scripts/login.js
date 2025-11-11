/* === login.js | Handles user authentication and login logic === */

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
    const loginSuccessful = checkUsernamePassword(email, password);
   checkUsernamePassword(email, password);
   if(loginSuccessful){
      console.log("Login erfolgreich! Weiterleitung...");
      window.location.href = "./summaryAll.html";  
   } else {
       console.log("Login fehlgeschlagen.");
      let errorRef = document.getElementById("errorMessageID");

      errorRef = `
        <span class="span_login">Login Fehlgeschlagen!</span>
      `

   }
}

/* === Credential Verification === */
function checkUsernamePassword(inputMail, inputPassword){
   for (let index = 0; index < users.length; index++) {
      let actualName = users[index].user.name;
      let actualMail = users[index].user.email;
      let actualPassword = users[index].user.password;
      let actualID = users[index].id;
      let actualJson = {"id" : actualID, "name" : actualName, "email" : actualMail}
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

/* === Form Validation === */
 function checkLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const button = document.getElementById('login_button');
    button.disabled = !(email && password);
 }
