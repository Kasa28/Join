/**
 * Deletes a contact by username/reference string.
 * Updates local state, optional backend sync for logged-in users,
 * clears single-contact view, and re-renders the contact list.
 *
 * @async
 * @param {string} inputString - Username or unique identifier of the contact to delete.
 * @returns {Promise<void>}
 */
async function deleteContact(inputString){
    let contacts = flattenContactBlockToArray() || [];
    const rightIndex = findIndexFromUsername(contacts, inputString);
    contacts.splice(rightIndex, 1);
    await persistContacts(contacts);
    let showContact = document.getElementById("singleContactID");
    showContact.innerHTML = "";
    renderContactList();
}


// In Edit-Contact-Window is a other Deletefunktion because we dont have any arguments in the Template to give
/**
 * Deletes a contact from within the edit-contact window.
 * Reads the username from the edit form, removes it from contacts,
 * syncs to backend or guest storage depending on login state,
 * clears UI, closes edit form, and re-renders the list.
 *
 * @async
 * @returns {Promise<void>}
 */
async function deleteContactinEditContactWindow(){
    let contacts = flattenContactBlockToArray() || [];
    let usernameRef = document.getElementById("edit-contact-usernameID").value;
    let showContact =  document.getElementById("singleContactID");
    const rightIndex = findIndexFromUsername(contacts, usernameRef);
    contacts.splice(rightIndex, 1);
    await persistContacts(contacts);
    showContact.innerHTML = "";
    hideEditContactFormular();
    renderContactList();
}

