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
    const contacts = flattenContactBlockToArray() || [];
    const contact = contacts[inputIndex];
    const initials = getInitials(contact.username);
    const getColor =  contact.color;
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
    const login = checkIfLogedIn();

    let contacts = flattenContactBlockToArray() || [];
    let contact = contacts[remindIndex];
    

    contact.username = document.getElementById("edit-contact-usernameID").value;
    contact.email = document.getElementById("edit-contact-mailID").value;
    contact.PhoneNumber = document.getElementById("edit-contact-phone-numberID").value;


    if(login){
        updateFriendsInLocalStorage(contacts);
        const getUserData = JSON.parse(localStorage.getItem("userData"))|| [];
        const userID = await getUserID(getUserData.name);
        await updateUserFriendslist(userID, contact);
    }   else{ 
        contacts.splice((remindIndex, 1));
        contacts.push(contact);
    };
    
    renderSingleContact(contact.username);
    hideEditContactFormular();
    renderContactList();
}





