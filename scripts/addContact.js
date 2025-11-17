let colors = ["red", "blue", "green", "yellow", "purple", "turquoise", "orange", "lime", "pink"];
let colorCode;

function showAddContactFormular(){
    document.getElementById("add-contactID").classList.remove("hide-add-contact")
}

function hideAddContactFormular(){
    document.getElementById("add-contactID").classList.add("hide-add-contact")
}


function addNewContact(){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || { friends: [] };
    contacts = getUserData.friends|| [];

    const usernameRef = document.getElementById("add-contact-usernameID").value;
    const usermailRef = document.getElementById("add-contact-mailID").value; 
    const phonenumberRef = document.getElementById("add-contact-phone-numberID").value;
    
    colorCode = getRandomInt(colors.length);

    const contactJson = {"username": usernameRef, "email": usermailRef, "PhoneNumber": phonenumberRef, "color": colors[colorCode]};

    contacts.push(contactJson);

    
    sortUserToAlphabeticalOrder(contacts);
    
    addContactToLocalStorageAndAPI(contacts);


    document.getElementById("add-contact-usernameID").value = "";
    document.getElementById("add-contact-mailID").value = "";
    document.getElementById("add-contact-phone-numberID").value = "";
    
    console.log(getUserData.friends);
    
    hideAddContactFormular();
    renderContactList();
    showContactToast("Contact successfully created");
}

async function addContactToLocalStorageAndAPI(inputContacts){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || { friends: {} };    
    let updatedContacts = inputContacts;


    getUserData.friends = updatedContacts;



    //set in LocalStorage
    localStorage.setItem("userData", JSON.stringify(getUserData));

    //set in API
    const userID = await getUserID(getUserData.name);
    if(userID){
        await updateUserFriendslist(userID, updatedContacts);
    }else {
        console.error("etwas funktioniert auf Zeile 67 nicht richtig!");
    }
}


function renderAddContact(){
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

                            </div>
    
    `
}

