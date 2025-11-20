async function deleteContact(inputString){
    let contacts = flattenContactBlockToArray() || [];
    const login = checkIfLogedIn();
    const rightIndex = findIndexFromUsername(contacts, inputString);
    

    contacts.splice(rightIndex, 1);

    console.log(contacts);
    

    if(login){
        let getUserData = JSON.parse(localStorage.getItem("userData"))|| [];
        updateFriendsInLocalStorage(contacts);
        const userID = await getUserID(getUserData.name);
        await updateUserFriendslist(userID, contacts);
    } 

    let showContact = document.getElementById("singleContactID");
    showContact.innerHTML = "";
    renderContactList();
}


// In Edit-Contact-Window is a other Deletefunktion because we dont have any arguments in the Template to give
async function deleteContactinEditContactWindow(){
    let contacts = flattenContactBlockToArray() || [];
    const login = checkIfLogedIn();

    let getUserData = JSON.parse(localStorage.getItem("userData")) || {};

    let usernameRef = document.getElementById("edit-contact-usernameID").value;
    let showContact =  document.getElementById("singleContactID");
    const rightIndex = findIndexFromUsername(contacts, usernameRef);

    contacts.splice(rightIndex, 1);

    if(login){
        updateFriendsInLocalStorage(contacts);
        const userID = await getUserID(getUserData.name);
        await updateUserFriendslist(userID, contacts);
    }else {
        setContactsIntoContactblock(contacts);
    }
    
    showContact.innerHTML = "";
    hideEditContactFormular();
    renderContactList();
}


