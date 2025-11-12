let exampleContacts = [ {"username": "Peter", "email": "peter-lustig@hotmail.de", "PhoneNumber": "+491517866563"},
                        {"username": "Karsten", "email": "karsten-stahl@gmail.de", "PhoneNumber": "+49151478632475"},
                        {"username": "Thomas", "email": "thomas-gottschalck@live.de", "PhoneNumber": "+491517896455"},
                        {"username": "Rainer", "email": "rainer-winkler@gmail.de", "PhoneNumber": "+491507489652"},
                        {"username": "Angela", "email": "angela-merkel@gmail.de", "PhoneNumber": "+491511462385"},
                        {"username": "Kai", "email": "kai-pflaume@live.de", "PhoneNumber": "+491504896257"},
                        {"username": "Til", "email": "til-schweiger@gmail.de", "PhoneNumber": "+491514563248"},
                        {"username": "Günther", "email": "günther-jauch@gmail.de", "PhoneNumber": "+4915157652244"},
                        {"username": "Simon", "email": "simon-krätschmer@gmail.de", "PhoneNumber": "+491504621354"}];

function showAddContactFormular(){
    document.getElementById("add-contactID").classList.remove("hide-add-contact")
}

function hideAddContactFormular(){
    document.getElementById("add-contactID").classList.add("hide-add-contact")
}

function addNewContact(){
    let contacts = JSON.parse(localStorage.getItem("contacts"))|| [];

    const usernameRef = document.getElementById("add-contact-usernameID").value;
    const usermailRef = document.getElementById("add-contact-mailID").value; 
    const phonenumberRef = document.getElementById("add-contact-phone-numberID").value;  

    const contactJson = {"username": usernameRef, "email": usermailRef, "PhoneNumber": phonenumberRef}

    contacts.push(contactJson);
    sortUserToAlphabeticalOrder(contacts);
    addContactToLocalStorage(contacts);

    console.log(contacts);

    document.getElementById("add-contact-usernameID").value = "";
    document.getElementById("add-contact-mailID").value = "";
    document.getElementById("add-contact-phone-numberID").value = "";


    hideAddContactFormular();
    renderContactList(contacts);
}

function addContactToLocalStorage(inputContacts){
    
    localStorage.setItem("contacts", JSON.stringify(inputContacts));
}

function makeFirstLetterBig(inputString){

    return String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1);

}

function pushExampleContactsOneTimeInLocalStorage(){
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

    // Überprüfen, ob einer der Namen bereits im Array vorhanden ist
    const nameExists = contacts.some(contact =>
        contact && (contact.username === "Peter" || contact.username === "Karsten" || contact.username === "Thomas")
    );

    // Wenn einer der Namen existiert, Funktion abbrechen
    if (nameExists) {
        console.log("Einer der Namen existiert bereits. Funktion wird abgebrochen.");
        return;
    }

    // Namen hinzufügen, wenn sie nicht existieren
    if (exampleContacts.length > 0) {
        contacts.push(...exampleContacts);
        exampleContacts = []; // Leere das Array nach dem Hinzufügen
        addContactToLocalStorage(contacts);
        console.log("Beispielkontakte wurden hinzugefügt:", contacts);
    } else {
        console.log("Keine Beispielkontakte vorhanden.");
    }
}

function sortUserToAlphabeticalOrder(inputArray){

    inputArray.sort((a, b) => {
        if (a.username.toLowerCase() < b.username.toLowerCase()) return -1;
        if (a.username.toLowerCase() > b.username.toLowerCase()) return 1;
        return 0;
    });
}











function renderAddContact(){
    let contentRef = document.getElementById("add-contactID");
    

    contentRef.innerHTML = `
        <div class="main-container-edit-contact left-side-rounded">

                                    <div class="edit-contact-headcard left-side-rounded">
                                        <img onclick="hideAddContactFormular()" class="close-icon-edit-contact" src="./assets/img/close.svg" alt="close icon">
                                        <img class="capa-logo-1-edit-contact" src="./assets/img/Capa 1.svg" alt="Capa 1">
                                        <h2 class="h2-edit-contact">Add Contact</h2>
                                        <a class="a-font-edit-contact">Tasks are better in a Team</a>
                                    </div>

                                <div style="display: flex; justify-content: center; align-items: center;">

                                        <div class="edit-contact-content">
                                            
                                                <div class="empty-user-ball-edit-contact">
                                                    <img src="./assets/img/person.svg" class="empty-user-ball-icon-edit-contact" alt="Icon">
                                                </div>

                                                <div class="input-icon-container">
                                                    <input class="edit-contact-inputfield" placeholder="Name" type="text" name="" id="add-contact-usernameID">
                                                    <img src="./assets/img/person.svg" class="input-icon-edit-contact" alt="Icon">
                                                </div>

                                                <div class="input-icon-container">
                                                    <input class="edit-contact-inputfield" placeholder="Email" type="email" name="" id="add-contact-mailID">
                                                    <img src="./assets/img/mail.svg" class="input-icon-edit-contact" alt="Icon">
                                                </div>

                                                <div class="input-icon-container">
                                                    <input class="edit-contact-inputfield" placeholder="Phone" type="text" name="" id="add-contact-phone-numberID">
                                                    <img src="./assets/img/call.svg" class="input-icon-edit-contact" alt="Icon">
                                                </div>

                                                <div class="button-edit-contact-order">
                                                    <button onclick="hideAddContactFormular()" class="button-edit-contact button-edit-contact-grey">
                                                        Cancel 
                                                    </button>
                                                    <button onclick="addNewContact()" class="button-edit-contact button-edit-contact-blue">
                                                        Create Contact 
                                                        <img class="check-icon-edit-contact" src="./assets/img/check.svg" alt="check icon">
                                                    </button>
                                                </div>

                                        </div>
                                </div>

                            </div>
    
    `
}

