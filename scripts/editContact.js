let remindIndex = null;

/**
 * Opens the Edit Contact form by removing the hidden class.
 */
function showEditContactFormular() {
    document.getElementById("edit-contactID").classList.remove("hide-edit-contact");
}


/**
 * Closes the Edit Contact form by adding the hidden class.
 */
function hideEditContactFormular() {
    document.getElementById("edit-contactID").classList.add("hide-edit-contact");
}


/**
 * Loads the selected contact's data into the Edit Contact form fields.
 * @param {number} inputIndex - Index of the contact to load into the form.
 */
function setUserDataValue(inputIndex) {
    const contacts = flattenContactBlockToArray() || [];
    const contact = contacts[inputIndex];
    remindIndex = inputIndex;
    const initials = getInitials(contact.username);
    const color = contact.color;
    const initialsRef = document.getElementById("edit-contact-initialsID");
    initialsRef.innerHTML = initials;
    initialsRef.className = "";
    initialsRef.classList.add("user-letter-ball-edit-contact");
    initialsRef.classList.add(color);
    document.getElementById("edit-contact-usernameID").value = contact.username;
    document.getElementById("edit-contact-mailID").value = contact.email;
    document.getElementById("edit-contact-phone-numberID").value = contact.PhoneNumber;
}


/**
 * Saves edited contact data, validates input fields, updates storage (local or API),
 * re-renders the contact list, and closes the edit window.
 * @returns {Promise<void>}
 */
async function editContact() {
    let contacts = flattenContactBlockToArray() || [];
    if (remindIndex === null || !contacts[remindIndex]) {
        showContactToast("No contact selected to edit", { variant: "error" });
        return false;
    }
    const username = document.getElementById("edit-contact-usernameID").value.trim();;
    const email = document.getElementById("edit-contact-mailID").value;
    const phoneNumber = document.getElementById("edit-contact-phone-numberID").value;
    const nameRegex = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]{1,}$/u;
    const phoneRegex = /^(\+49|0)[1-9]\d{6,14}$/;

    if (!nameRegex.test(username)) {
        showContactToast("Please enter a valid name containing letters and no numbers", { variant: "error" });
        return false;
    }
    if (!validateEmailOnSubmit(email, null)) {
        showContactToast("Bitte eine gültige E-Mail eingeben!", { variant: "error" });
        return false;
    }
    if (!phoneRegex.test(phoneNumber)) {
        showContactToast("Phone number must start with +49 or 01 and contain only numbers", { variant: "error" });
        return false;
    }
    const contact = contacts[remindIndex];
    const updatedContact = {
        ...contact,
        username,
        email,
        PhoneNumber: phoneNumber,
    };
    contacts[remindIndex] = updatedContact;
    sortUserToAlphabeticalOrder(contacts);
    setContactsIntoContactblock(contacts);
    await persistContacts(contacts);
    renderSingleContact(updatedContact.username);
    renderContactList();
    closeWhiteScreen();
    showContactToast("Contact successfully saved");
    return true;
}


/**
 * Deletes the currently selected contact, updates storage (local or API),
 * closes the edit window, and refreshes the contact list.
 * @returns {Promise<void>}
 */
async function deleteContactinEditContactWindow() {
    let contacts = flattenContactBlockToArray() || [];
    contacts.splice(remindIndex, 1);
    await persistContacts(contacts);
    hideEditContactFormular();
    closeWhiteScreen();
    renderContactList();
}