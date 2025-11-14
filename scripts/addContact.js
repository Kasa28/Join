let colors = ["red", "blue", "green", "yellow", "purple", "turquoise", "orange", "lime", "pink"];

let colorCode = 0;

function showAddContactFormular(){
    document.getElementById("add-contactID").classList.remove("hide-add-contact")
}

function hideAddContactFormular(){
    document.getElementById("add-contactID").classList.add("hide-add-contact")
}

function setColorCodeBackto0WhenItsToBig(inputColorCode){

    if(inputColorCode > 8){
        colorCode = 0;
        return;
    } return;

}

function addNewContact(){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || { friends: {} };
    contacts = getUserData.friends|| [];

    const usernameRef = document.getElementById("add-contact-usernameID").value;
    const usermailRef = document.getElementById("add-contact-mailID").value; 
    const phonenumberRef = document.getElementById("add-contact-phone-numberID").value;  

    const contactJson = {"username": usernameRef, "email": usermailRef, "PhoneNumber": phonenumberRef, "color": colors[colorCode]};

    colorCode++;
    setColorCodeBackto0WhenItsToBig(colorCode);

    contacts.push(contactJson);
    sortUserToAlphabeticalOrder(contacts);
    addContactToLocalStorage(contacts);


    document.getElementById("add-contact-usernameID").value = "";
    document.getElementById("add-contact-mailID").value = "";
    document.getElementById("add-contact-phone-numberID").value = "";


    hideAddContactFormular();
    renderContactList();
}

function addContactToLocalStorage(inputContacts){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || { friends: {} };
    let updatedContacts = sortUserToAlphabeticalOrder(inputContacts);

    getUserData.friends = updatedContacts;
    localStorage.setItem("userData", JSON.stringify(getUserData));
}

function makeFirstLetterBig(inputString){

    return String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1);

}




function renderAddContact(){
    let contentRef = document.getElementById("add-contactID");
    

    contentRef.innerHTML = `
        <div class="main-container-edit-contact left-side-rounded">

                                    <div class="edit-contact-headcard left-side-rounded">
                                        <img onclick="hideAddContactFormular()" class="close-icon-edit-contact" src="./assets/img/close.svg" alt="close icon">
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
                                                    <button onclick="hideAddContactFormular()" class="button-edit-contact button-edit-contact-grey">
                                                        Cancel 
                                                    </button>
                                                    <button onclick="addNewContact()" class="button-edit-contact button-edit-contact-blue">
                                                        Create Contact 
                                                        <img class="check-icon-edit-contact" src="./assets/img/check.svg" alt="check icon">
                                                    </button>
                                                </div>

                                        </div>
                                </div>

                            </div>
    
    `
}

