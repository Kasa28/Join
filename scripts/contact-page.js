let contactBlock = {
    A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [],
    K: [], L: [], M: [], N: [], O: [], P: [], Q: [], R: [], S: [], T: [],
    U: [], V: [], W: [], X: [], Y: [], Z: [], other: []
};

string = "Peter Griffin";


function setContactsIntoContactblock(){
     let contacts = JSON.parse(localStorage.getItem("contacts"))|| [];

     contacts.forEach((contact) => {

        let actualChar = contact.username.charAt(0).toUpperCase();

        if(contactBlock[actualChar]){
        contactBlock[actualChar].unshift(contact);
        } else {
        contactBlock.other.unshift(contact);
        }
        
     });
}

function checkIfBlockIsFilled(inputBlock){
    if(inputBlock.length < 1){
        return false;
    } else {
        return true;
    }
}

function renderContactList(){

    let contactContainerRef = document.getElementById("contactContainerID");
    contactContainerRef.innerHTML = "";

    pushExampleContactsOneTimeInLocalStorage();
    
    let getContacts = JSON.parse(localStorage.getItem("contacts"))|| [];
    setContactsIntoContactblock();
    

    Object.keys(contactBlock).forEach((key) => {
        let block = contactBlock[key];

        if(!checkIfBlockIsFilled(block)){
            return;
        }

        contactContainerRef.innerHTML += `

            <div class="padding-small-contacts">
                    <h2>${key}</h2>
            </div>

            <separator class="separator">
            </separator>

        `
         block.forEach((contact) => {
        contactContainerRef.innerHTML +=  `
                    <contact onclick="renderSingleContact('${contact.username}')" class="single-contact display-flex-center-x padding-medium-up-down-contacts">

                        <div class="contacts-logo">
                            <a>${getInitials(contact.username)}</a>
                        </div>
                        <div class="padding-left-contacts">
                            <div class="name-property padding-bottom-contacts padding-small-left-right-contacts">
                                <p>${makeFirstLetterBig(contact.username)}</p>
                            </div>
                            <div class="mail-property padding-small-left-right-contacts">
                                <p>${contact.email}</p>
                            </div>
                        </div>

                    </contact>
            `;
        }); 
    });

    console.clear();
    console.log(getContacts);
    console.log(contactBlock);
    
}

function findIndexFromUsername(inputContactArray, inputUsername, inputIndex){
for (let index = 0; index < inputContactArray.length; index++) {
        if (inputContactArray[index].username === inputUsername) {
            return index;
        }
    }

    console.log("Kontakt nicht gefunden");
    return -1;
}

function renderSingleContact(inputString){
    const contacts = JSON.parse(localStorage.getItem("contacts"))|| [];
    let singleContactRef = document.getElementById("singleContactID");

    const rightIndex = findIndexFromUsername(contacts, inputString);

    if(rightIndex === -1){
        console.log("nicht gefunden, irgendetwas stimmt bei Zeile 97 nicht");
        return;
    }

    const contact = contacts[rightIndex];
    
    singleContactRef.innerHTML = `
    <show-contact>

            <div class="show-contact-container">
                <contact class="display-flex-center-x">
                    <div class="show-contact-logo">
                        <a>${getInitials(contact.username)}</a>
                    </div>
                    <div>
                        <div class="name-property">
                            <h2>${makeFirstLetterBig(contact.username)}</h2>
                        </div>
                        <div style="display: flex;">
                            <div onclick="showEditContactFormular(), setUserDataValue(${rightIndex})"  class="edit-delete-container">
                                <img class="edit-delete-icons" src="./assets/img/edit.svg" alt="edit icon">
                                Edit
                            </div>
                            <div onclick="deleteContact()" class="edit-delete-container">
                                <img class="edit-delete-icons" src="./assets/img/delete.svg" alt="delete icon">
                                Delete
                            </div>
                        </div>
                    </div>
                </contact>
                <h2>Contact Information</h2>
                <br>
                <h3>E-Mail</h3>
                <br>
                <p class="mail-property">${contact.email}</p>
                <br>
                <h3>Phone</h3>
                <br>
                <p>${contact.PhoneNumber}</p>

            </div>

        </show-contact>
    
    `
}

function getInitials(inputFullName){
    const nameParts = inputFullName.split(/\s+/);
    const firstNameInital = nameParts[0]?.charAt(0).toUpperCase() || "";
    const lastNameInitial = nameParts[1]?.charAt(0).toUpperCase() || "";
    return `${firstNameInital}${lastNameInitial}`
}