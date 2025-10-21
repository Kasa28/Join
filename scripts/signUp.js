const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";



async function postData(path="", data={}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  return responseToJson = await response.json();
}



function checkPolicyandAnswers() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const checkbox = document.getElementById('accept_terms'); 
  const button = document.querySelector('.primary_button'); 

  
  const allFilled = name && email && password &&checkbox.checked;
  button.disabled = !allFilled;

  if(allFilled){
    postData("users", {username: name, adress: email, key: password});
  }

}


async function loadData(path="", data={}){
  let response = await fetch(BASE_URL + path + ".json");
  let responseToJson = await response.json();
  console.log(responseToJson);
}