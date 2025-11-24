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
    const login = checkIfLogedIn();
    let contacts = flattenContactBlockToArray() || [];
    const contact = contacts[remindIndex];
    const username = document.getElementById("edit-contact-usernameID").value;
    const email = document.getElementById("edit-contact-mailID").value;
    const phoneNumber = document.getElementById("edit-contact-phone-numberID").value;
    const nameRegex = /^[A-Za-zÄÖÜäöüß\s'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|de)$/i;
    const phoneRegex = /^(?:\+49|01)\d+$/;

    if (!nameRegex.test(username)) {
        showContactToast("Please enter a valid name without numbers", { variant: "error" });
        return;
    }
    if (!emailRegex.test(email)) {
        showContactToast("Please enter a valid email with @ and ending in .com or .de", { variant: "error" });
        return;
    }
        if (!phoneRegex.test(phoneNumber)) {
        showContactToast("Phone number must start with +49 or 01 and contain only numbers", { variant: "error" });
        return;
    }
    if (login) {
        updateFriendsInLocalStorage(contacts);
        const getUserData = JSON.parse(localStorage.getItem("userData")) || [];
        const userID = await getUserID(getUserData.name);
        await updateUserFriendslist(userID, contacts);
    } else {
        contacts.splice(remindIndex, 1);
        contacts.push(contact);
    }
    renderSingleContact(contact.username);
    hideEditContactFormular();
    renderContactList();
}


/**
 * Deletes the currently selected contact, updates storage (local or API),
 * closes the edit window, and refreshes the contact list.
 * @returns {Promise<void>}
 */
async function deleteContactinEditContactWindow() {
    let contacts = flattenContactBlockToArray() || [];
    const login = checkIfLogedIn();
    contacts.splice(remindIndex, 1);
    if (login) {
        updateFriendsInLocalStorage(contacts);
        const getUserData = JSON.parse(localStorage.getItem("userData")) || [];
        const userID = await getUserID(getUserData.name);
        await updateUserFriendslist(userID, contacts);
    } else {
        setContactsIntoContactblock(contacts);
    }
    hideEditContactFormular();
    closeWhiteScreen();
    renderContactList();
}