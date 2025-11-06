contacts = [];

function showAddContactFormular(){
    document.getElementById("add-contactID").classList.remove("hide-add-contact")
}

function hideAddContactFormular(){
    document.getElementById("add-contactID").classList.add("hide-add-contact")
}

function showEditContactFormular(){
    document.getElementById("edit-contactID").classList.remove("hide-edit-contact")
}

function hideEditContactFormular(){
    document.getElementById("edit-contactID").classList.add("hide-edit-contact")
}

function addNewContact(){
    const usernameRef = document.getElementById("add-contact-usernameID").value;
    const usermailRef = document.getElementById("add-contact-mailID").value; 
    const phonenumberRef = document.getElementById("add-contact-phone-numberID").value;  

    const contactJson = {"username": usernameRef, "email": usermailRef, "Phone number": phonenumberRef}

    contacts.push(contactJson);

    console.log(contacts);

    document.getElementById("add-contact-usernameID").value = "";
    document.getElementById("add-contact-mailID").value = "";
    document.getElementById("add-contact-phone-numberID").value = "";


    hideAddContactFormular();
}

function makeFirstLetterBig(inputString){

    return String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1);

}

function renderContactList(){

    const contactContainerRef = document.getElementById("contactContainerID");
    contactContainerRef.innerHTML = "";

    contacts.forEach((contact) => {
    contactContainerRef +=  `
                    <contact class="single-contact display-flex-center-x padding-medium-up-down-contacts">

                        <div class="contacts-logo">
                            <a>${contacts.username.charAt(0).toUpperCase()}</a>
                        </div>
                        <div class="padding-left-contacts">
                            <div class="name-property padding-bottom-contacts padding-small-left-right-contacts">
                                <p>${makeFirstLetterBig(contacts.username)}</p>
                            </div>
                            <div class="mail-property padding-small-left-right-contacts">
                                <p>${contacts.usermailRef}</p>
                            </div>
                        </div>

                    </contact>
        `;
    });
}