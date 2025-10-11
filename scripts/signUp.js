
function checkPolicyandAnswers() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const checkbox = document.getElementById('accept_terms'); 
  const button = document.querySelector('.primary_button'); 

  const allFilled = name && email && password &&checkbox.checked;
  button.disabled = !allFilled;
}