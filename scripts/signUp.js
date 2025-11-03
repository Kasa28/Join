let users = [];
let id = 0;

const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";


async function getAllUsers(path){
  let response = await fetch(BASE_URL + path + ".json");
  return responseToJson = await response.json();
}


async function postDataWithID(path = "", id = "", data = {}){
  const response = await fetch(`${BASE_URL}${path}/${id}.json`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}


async function onclickFunction(){

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  createUser(name , password, email);

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

  //console.log(users);

}

async function createUser(inputName, inputPassword, inputMail){
  
  let userResponse = await getAllUsers("users");  
  let UserKeysArray = Object.keys(userResponse);


  const user = {name: inputName, password: inputPassword, email: inputMail};

  postDataWithID("users", UserKeysArray.length, user);


}







function checkPolicyandAnswers() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm_password').value.trim();
  const checkbox = document.getElementById('accept_terms'); 
  const button = document.querySelector('.primary_button'); 

  
  
  const allFilled = name && email && password && confirmPassword && checkbox.checked;
  button.disabled = !allFilled;
}

