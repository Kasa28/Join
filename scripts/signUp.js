function checkPolicy() {
  const checkbox = document.getElementById('accept_terms'); //greift auf checkbox zu,holts raus 
  const button = document.querySelector('.primary_button'); //greift auf button zu
  button.disabled = !checkbox.checked; //schaut ob checkbox angeklickt ist, wenn ja dann button aktivieren,in html  schon deaktiviert deswegen wird aktiviert
}
