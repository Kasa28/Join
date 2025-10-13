 
 function checkLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const button = document.getElementById('login_button');

    button.disabled = !(email && password);
 }