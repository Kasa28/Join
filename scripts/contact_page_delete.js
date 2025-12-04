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
    const login = checkIfLogedIn();
    const rightIndex = findIndexFromUsername(contacts, inputString);
    

    contacts.splice(rightIndex, 1);
    
    if(login){
        await window.sessionReady;
        let getUserData = window.getSessionSnapshot();
        await updateFriendsInLocalStorage(contacts);
        const userID = await getUserID(getUserData.name);
        await updateUserFriendslist(userID, contacts);
    } 

    let showContact = document.getElementById("singleContactID");
    showContact.innerHTML = "";
    renderContactList();
}


// In Edit-Contact-Window is a other Deletefunktion because we dont have any arguments in the Template to give
/**
 * Deletes a contact from within the edit-contact window.
 * Reads the username from the edit form, removes it from contacts,
 * syncs to backend/session storage depending on login state,
 * clears UI, closes edit form, and re-renders the list.
 *
 * @async
 * @returns {Promise<void>}
 */
async function deleteContactinEditContactWindow(){
    let contacts = flattenContactBlockToArray() || [];
    const login = checkIfLogedIn();
    await window.sessionReady;
    let getUserData = window.getSessionSnapshot();
    let usernameRef = document.getElementById("edit-contact-usernameID").value;
    let showContact =  document.getElementById("singleContactID");
    const rightIndex = findIndexFromUsername(contacts, usernameRef);

    contacts.splice(rightIndex, 1);

    if(login){
        await updateFriendsInLocalStorage(contacts);
        const userID = await getUserID(getUserData.name);
        await updateUserFriendslist(userID, contacts);
    }else {
        setContactsIntoContactblock(contacts);
    }
    
    showContact.innerHTML = "";
    hideEditContactFormular();
    renderContactList();
}
