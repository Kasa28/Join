let colors = ["red", "blue", "green", "yellow", "purple", "turquoise", "orange", "lime", "pink"];
let colorCode;


// Edit-Contact-Fenster bewegen
function showAddContactFormular(){
    document.getElementById("add-contactID").classList.remove("hide-add-contact")
}

function hideAddContactFormular(){
    document.getElementById("add-contactID").classList.add("hide-add-contact")
}


// After a confrirmed Formular, the Formular gets empty again
function emptyTheAddContactFormular(){
    document.getElementById("add-contact-usernameID").value = "";
    document.getElementById("add-contact-mailID").value = "";
    document.getElementById("add-contact-phone-numberID").value = "";
}


function addNewContact(){
    let contacts = flattenContactBlockToArray() || [];
    const usernameRef = document.getElementById("add-contact-usernameID").value;
    const usermailRef = document.getElementById("add-contact-mailID").value; 
    const phonenumberRef = document.getElementById("add-contact-phone-numberID").value;
    const login = checkIfLogedIn();
    colorCode = getRandomInt(colors.length);
    const contactJson = {"username": usernameRef, "email": usermailRef, "PhoneNumber": phonenumberRef, "color": colors[colorCode]};
    contacts.push(contactJson);
    sortUserToAlphabeticalOrder(contacts);

    if(login){
        addContactToLocalStorageAndAPI(contacts);
    } else {
        setContactsIntoContactblock(contacts);
    }
    
    emptyTheAddContactFormular();
    hideAddContactFormular();
    renderContactList();
    showContactToast("Contact successfully created");
}


async function addContactToLocalStorageAndAPI(inputContacts){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || { friends: {} };    
    let updatedContacts = inputContacts;
    getUserData.friends = updatedContacts;

    localStorage.setItem("userData", JSON.stringify(getUserData));

    const userID = await getUserID(getUserData.name);
    await updateUserFriendslist(userID, updatedContacts);
}


