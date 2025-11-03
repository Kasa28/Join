const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";
users = [];

 
async function getAllUsers(path){
  let response = await fetch(BASE_URL + path + ".json");
  return responseToJson = await response.json();
}


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

function login(){
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

   checkUsernamePassword(email, password);



}




function checkUsernamePassword(inputMail, inputPassword){
   
   
   for (let index = 0; index < users.length; index++) {

      console.log(index);
      

      if(users[index].user.email === inputMail && users[index].user.password === inputPassword){
            console.log("Login erfolgreich!");
            return true;
      }
   }

   console.log("Login fehlgeschlagen: Benutzer nicht gefunden oder falsches Passwort.");
   
   return false;
}




 function checkLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const button = document.getElementById('login_button');

    button.disabled = !(email && password);

 }
