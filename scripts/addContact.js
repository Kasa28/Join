let exampleContacts = [ {"username": "Peter", "email": "peter-lustig@hotmail.de", "PhoneNumber": "+491517866563"},
                        {"username": "Karsten", "email": "karsten-stahl@gmail.de", "PhoneNumber": "+49151478632475"},
                        {"username": "Thomas", "email": "thomas-gottschalck@live.de", "PhoneNumber": "+491517896455"}];

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
    let contacts = JSON.parse(localStorage.getItem("contacts"))|| [];
    
    const nameExist = contacts.some(contact =>
        contact.username === "Peter" || contact.username === "Karsten" || contact.username === "Thomas"
    );
        
    if(nameExist){

        return;

    } else{

        contacts.push(exampleContacts[0], exampleContacts[1], exampleContacts[2]);
        exampleContacts = [];
        addContactToLocalStorage(contacts);

    }
}

function renderContactList(){

    let contactContainerRef = document.getElementById("contactContainerID");
    contactContainerRef.innerHTML = "";

    pushExampleContactsOneTimeInLocalStorage();

    let getContacts = JSON.parse(localStorage.getItem("contacts"))|| [];


    getContacts.forEach((contact, index) => {
    contactContainerRef.innerHTML +=  `
                    <contact onclick=" renderSingleContact(${index})" class="single-contact display-flex-center-x padding-medium-up-down-contacts">

                        <div class="contacts-logo">
                            <a>${contact.username.charAt(0).toUpperCase()}</a>
                        </div>
                        <div class="padding-left-contacts">
                            <div class="name-property padding-bottom-contacts padding-small-left-right-contacts">
                                <p>${makeFirstLetterBig(contact.username)}</p>
                            </div>
                            <div class="mail-property padding-small-left-right-contacts">
                                <p>${contact.email}</p>
                            </div>
                        </div>

                    </contact>
        `;
    });
    console.clear();
    console.log(getContacts);
    
}



function renderSingleContact(inputIndex){
    const contacts = JSON.parse(localStorage.getItem("contacts"))|| [];
    const contact = contacts[inputIndex];
    let singleContactRef = document.getElementById("singleContactID");
      
    remindIndex = inputIndex;
    singleContactRef.innerHTML = `

    <show-contact>

            <div class="show-contact-container">
                <contact class="display-flex-center-x">
                    <div class="show-contact-logo">
                        <a>${contact.username.charAt(0).toUpperCase()}</a>
                    </div>
                    <div>
                        <div class="name-property">
                            <h2>${makeFirstLetterBig(contact.username)}</h2>
                        </div>
                        <div style="display: flex;">
                            <div onclick="showEditContactFormular(), setUserDataValue(${inputIndex})"  class="edit-delete-container">
                                <img class="edit-delete-icons" src="./assets/img/edit.svg" alt="edit icon">
                                Edit
                            </div>
                            <div onclick="deleteContact()" class="edit-delete-container">
                                <img class="edit-delete-icons" src="./assets/img/delete.svg" alt="delete icon">
                                Delete
                            </div>
                        </div>
                    </div>
                </contact>
                <h2>Contact Information</h2>
                <br>
                <h3>E-Mail</h3>
                <br>
                <p class="mail-property">${contact.email}</p>
                <br>
                <h3>Phone</h3>
                <br>
                <p>${contact.PhoneNumber}</p>

            </div>

        </show-contact>
    
    `
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

