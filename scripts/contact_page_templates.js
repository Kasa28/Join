/**
 * Renders the detailed view of a single contact into the contact panel.
 * @param {string} inputColor - The CSS color class for the contact avatar.
 * @param {string} inputUsername - The full name of the contact.
 * @param {number} inputIndex - Index of the contact in the contacts list.
 * @param {string} inputEmail - The contact's email address.
 * @param {string} inputPhone - The contact's phone number.
 */
function singleContactTemplate(
  inputColor,
  inputUsername,
  inputIndex,
  inputEmail,
  inputPhone
) {
  let singleContactRef = document.getElementById("singleContactID");
  singleContactRef.innerHTML = `
    <show-contact>
            <div class="show-contact-container">
                <contact class="display-flex-center-x">
                    <div class="show-contact-logo ${inputColor}">
                        <a>${getInitials(inputUsername)}</a>
                    </div>
                    <div>
                        <div class="name-property">
                            <h2>${makeFirstLetterBig(inputUsername)}</h2>
                        </div>
                        <div style="display: flex;">
                            <div onclick="showEditContactFormular(), setUserDataValue(${inputIndex}), callWhiteScreen()"  class="edit-delete-container">
                                <img class="edit-delete-icons" src="./assets/img/edit.svg" alt="edit icon">
                                Edit
                            </div>
                            <div onclick="deleteContact('${inputUsername}')" class="edit-delete-container">
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
                <p class="mail-property">${inputEmail}</p>
                <br>
                <h3>Phone</h3>
                <br>
                <p>${inputPhone}</p>
            </div>
    </show-contact>`;
}


/**
 * Renders the Edit Contact form template into the UI, including input fields
 * and action buttons for saving or deleting the contact.
 */
function renderEditContact() {
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
                                </div>`;
}


/**
 * Renders the Add Contact form template into the UI, including input fields
 * and action buttons for creating a new contact.
 */
function renderAddContact() {
  let contentRef = document.getElementById("add-contactID");

  contentRef.innerHTML = `
        <div class="main-container-edit-contact left-side-rounded">

                                    <div class="edit-contact-headcard left-side-rounded">
                                        <img onclick="hideAddContactFormular(), closeWhiteScreen()" class="close-icon-edit-contact" src="./assets/img/close.svg" alt="close icon">
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
                                                    <button onclick="hideAddContactFormular(), closeWhiteScreen()" class="button-edit-contact button-edit-contact-grey">
                                                        Cancel 
                                                    </button>
                                                    <button onclick="addNewContact(), closeWhiteScreen()" class="button-edit-contact button-edit-contact-blue">
                                                        Create Contact 
                                                        <img class="check-icon-edit-contact" src="./assets/img/check.svg" alt="check icon">
                                                    </button>
                                                </div>

                                        </div>
                                </div>

                            </div>`;
}
