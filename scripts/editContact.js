let remindIndex;

// Edit-Contact-Fenster bewegen
function showEditContactFormular(){
    document.getElementById("edit-contactID").classList.remove("hide-edit-contact")
}


function hideEditContactFormular(){
    document.getElementById("edit-contactID").classList.add("hide-edit-contact")
}


// Edit-Contact-Fenster fuellen
function setUserDataValue(inputIndex){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || {};
    const contacts = Array.isArray(getUserData.friends) ? getUserData.friends : [];
    const contact = contacts[inputIndex];
    const initials = getInitials(contact.username);
    const getColor =  getContactColorType(inputIndex);
    let initialsRef = document.getElementById("edit-contact-initialsID");

    initialsRef.innerHTML = initials;
    document.getElementById("edit-contact-usernameID").value = contact.username;
    document.getElementById("edit-contact-mailID").value = contact.email; 
    document.getElementById("edit-contact-phone-numberID").value = contact.PhoneNumber;
    document.getElementById("edit-contact-initialsID").classList.add(getColor);

    remindIndex = inputIndex;
}


// Change Name or change other things in Formualar
async function editContact(){
    const getUserData = JSON.parse(localStorage.getItem("userData")) || {};
    const contacts = Array.isArray(getUserData.friends) ? getUserData.friends : [];
    let contact = contacts[remindIndex];
    
    contact.username = document.getElementById("edit-contact-usernameID").value;
    contact.email = document.getElementById("edit-contact-mailID").value;
    contact.PhoneNumber = document.getElementById("edit-contact-phone-numberID").value;

    updateFriendsInLocalStorage(contacts);
    const userID = await getUserID(getUserData.name);
    await updateUserFriendslist(userID, contacts);
    renderSingleContact(contact.username);
    hideEditContactFormular();
    renderContactList();
}


function updateFriendsInLocalStorage(updatedFriends){
    let userData = JSON.parse(localStorage.getItem("userData") || {});
    userData.friends = updatedFriends;
    localStorage.setItem("userData", JSON.stringify(userData));
}


async function deleteContact(inputString){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || {};
    const contacts = Array.isArray(getUserData.friends) ? getUserData.friends : [];
    const rightIndex = findIndexFromUsername(contacts, inputString);

    contacts.splice(rightIndex, 1);

    updateFriendsInLocalStorage(contacts);
    const userID = await getUserID(getUserData.name);
    await updateUserFriendslist(userID, contacts);

    let showContact = document.getElementById("singleContactID");
    showContact.innerHTML = "";
    hideEditContactFormular();
    renderContactList();
}


// In Edit-Contact-Window is a other Deletefunktion because we dont have any arguments in the Template to give
async function deleteContactinEditContactWindow(){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || {};
    const contacts = Array.isArray(getUserData.friends) ? getUserData.friends : [];
    let usernameRef = document.getElementById("edit-contact-usernameID").value;
    let showContact =  document.getElementById("singleContactID");
    const rightIndex = findIndexFromUsername(contacts, usernameRef);

    contacts.splice(rightIndex, 1);
    updateFriendsInLocalStorage(contacts);
    const userID = await getUserID(getUserData.name);
    await updateUserFriendslist(userID, contacts);

    showContact.innerHTML = "";
    hideEditContactFormular();
    renderContactList();
}




function renderEditContact(){
    let contentRef = document.getElementById("edit-contactID");
    


    contentRef.innerHTML = `
                                <div class="main-container-edit-contact right-side-rounded">

                                    <div class="edit-contact-headcard right-side-rounded">
                                        <img onclick="hideEditContactFormular(), closeWhiteScreen()" class="close-icon-edit-contact" src="./assets/img/close.svg" alt="close icon">
                                        <img class="capa-logo-1-edit-contact" src="./assets/img/Capa 1.svg" alt="Capa 1">
                                        <h2 class="h2-edit-contact">Edit Contact</h2>
                                    </div>

                                    <div style="display: flex; justify-content: center; align-items: center;">

                                        <div class="edit-contact-content">

                                                <div class="user-letter-ball-edit-contact" id="edit-contact-initialsID">
                                                    <a>AM</a>
                                                </div>

                                                <div class="input-icon-container">
                                                    <input class="edit-contact-inputfield" placeholder="Name" type="text" name="" id="edit-contact-usernameID">
                                                    <img src="./assets/img/person.svg" class="input-icon-edit-contact" alt="Icon">
                                                </div>

                                                <div class="input-icon-container">
                                                    <input class="edit-contact-inputfield" placeholder="Email" type="email" name="" id="edit-contact-mailID">
                                                    <img src="./assets/img/mail.svg" class="input-icon-edit-contact" alt="Icon">
                                                </div>

                                                <div class="input-icon-container">
                                                    <input class="edit-contact-inputfield" placeholder="Phone" type="text" name="" id="edit-contact-phone-numberID">
                                                    <img src="./assets/img/call.svg" class="input-icon-edit-contact" alt="Icon">
                                                </div>

                                                <div class="button-edit-contact-order">
                                                    <button onclick="deleteContactinEditContactWindow(), closeWhiteScreen()" class="button-edit-contact button-edit-contact-grey">
                                                        Delete
                                                    </button>
                                                    <button onclick="editContact(), closeWhiteScreen()" class="button-edit-contact button-edit-contact-blue">
                                                        Save
                                                        <img class="check-icon-edit-contact" src="./assets/img/check.svg" alt="check icon">
                                                    </button>
                                                </div>
                                        </div>
                                    </div>
                                </div>
    `;
}