contacts = [];

function showAddContactFormular(){
    document.getElementById("add-contactID").classList.remove("hide-add-contact")
}

function hideAddContactFormular(){
    document.getElementById("add-contactID").classList.add("hide-add-contact")
}

function showEditContactFormular(){
    document.getElementById("edit-contactID").classList.remove("hide-edit-contact")
}

function hideEditContactFormular(){
    document.getElementById("edit-contactID").classList.add("hide-edit-contact")
}

function addNewContact(){
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



function renderContactList(){

    let contactContainerRef = document.getElementById("contactContainerID");
    contactContainerRef.innerHTML = "";

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
}



function renderSingleContact(inputIndex){
    const contacts = JSON.parse(localStorage.getItem("contacts"))|| [];
    const contact = contacts[inputIndex];
    const singleContactRef = document.getElementById("singleContactID");
    singleContactRef.innerHTML = "";
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
                            <div onclick="showEditContactFormular()"  class="edit-delete-container">
                                <img class="edit-delete-icons" src="./assets/img/edit.svg" alt="edit icon">
                                Edit
                            </div>
                            <div class="edit-delete-container">
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

function editContact(){
    const contacts = JSON.parse(localStorage.getItem("contacts"))|| [];
    const contact = contacts[inputIndex];

    const editedUsernameRef = document.getElementById("edit-contact-usernameID").value;
    const editedUsermailRef = document.getElementById("edit-contact-mailID").value; 
    const editedPhonenumberRef = document.getElementById("edit-contact-phone-numberID").value;

}