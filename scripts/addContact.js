let colors = ["red", "blue", "green", "yellow", "purple", "turquoise", "orange", "lime", "pink"];
let colorCode;

/**
 * Opens the Add Contact form by removing the hidden class.
 */
function showAddContactFormular() {
    document.getElementById("add-contactID").classList.remove("hide-add-contact");
}


/**
 * Closes the Add Contact form by adding the hidden class.
 */
function hideAddContactFormular() {
    document.getElementById("add-contactID").classList.add("hide-add-contact");
}


/**
 * Clears all input fields in the Add Contact form.
 */
function emptyTheAddContactFormular() {
    document.getElementById("add-contact-usernameID").value = "";
    document.getElementById("add-contact-mailID").value = "";
    document.getElementById("add-contact-phone-numberID").value = "";
}


/**
 * Creates a new contact, validates input fields, assigns a random color,
 * stores the contact locally or via API depending on login status,
 * updates the UI, and shows success or error messages.
 */
function addNewContact() {
    let contacts = flattenContactBlockToArray() || [];
    const usernameRef = document.getElementById("add-contact-usernameID").value;
    const usermailRef = document.getElementById("add-contact-mailID").value;
    const phonenumberRef = document.getElementById("add-contact-phone-numberID").value;
     const nameRegex = /^[A-Za-zÄÖÜäöüß\s'-]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|de)$/i;
     const phoneRegex = /^(?:\+49|01)\d+$/;

    if (!nameRegex.test(usernameRef)) {
        showContactToast("Please enter a valid name without numbers", { variant: "error" });
        return false;
    }

    if (!emailRegex.test(usermailRef)) {
       showContactToast("Please enter a valid email with @ and ending in .com or .de", { variant: "error" });
        return false;
    }
    if (!phoneRegex.test(phonenumberRef)) {
        showContactToast("Phone number must start with +49 or 01 and contain only numbers", { variant: "error" });
        return false;
    }
    const login = checkIfLogedIn();
    colorCode = getRandomInt(colors.length);
    const contactJson = {
        "username": usernameRef,
        "email": usermailRef,
        "PhoneNumber": phonenumberRef,
        "color": colors[colorCode]
    };
    contacts.push(contactJson);
    sortUserToAlphabeticalOrder(contacts);
    if (login) {
        addContactToLocalStorageAndAPI(contacts);
    } else {
        setContactsIntoContactblock(contacts);
    }
    emptyTheAddContactFormular();
    hideAddContactFormular();
    renderContactList();
    showContactToast("Contact successfully created");
        return true;
}

/**
 * Handles the Add Contact button click and only closes overlays when the
 * contact was created successfully.
 */
function handleAddContact() {
    const contactCreated = addNewContact();
    if (contactCreated) {
        closeWhiteScreen();
    }
}

/**
 * Saves updated contacts to localStorage and synchronizes them with the API.
 * @param {Array<Object>} inputContacts - The list of contacts to store.
 * @returns {Promise<void>}
 */
async function addContactToLocalStorageAndAPI(inputContacts) {
    let getUserData = JSON.parse(localStorage.getItem("userData")) || { friends: {} };
    let updatedContacts = inputContacts;

    getUserData.friends = updatedContacts;
    localStorage.setItem("userData", JSON.stringify(getUserData));

    const userID = await getUserID(getUserData.name);
    await updateUserFriendslist(userID, updatedContacts);
}