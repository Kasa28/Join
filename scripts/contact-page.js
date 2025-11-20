let remindString;

let contactBlock = {
    A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [],
    K: [], L: [], M: [], N: [], O: [], P: [], Q: [], R: [], S: [], T: [],
    U: [], V: [], W: [], X: [], Y: [], Z: [], other: []
};

let exampleContacts = [ {"username": "Peter", "email": "peter-lustig@hotmail.de", "PhoneNumber": "+491517866563", "color": "pink"},
                        {"username": "Karsten", "email": "karsten-stahl@gmail.de", "PhoneNumber": "+49151478632475", "color": "orange"},
                        {"username": "Thomas", "email": "thomas-gottschalck@live.de", "PhoneNumber": "+491517896455", "color": "green"},
                        {"username": "Rainer", "email": "rainer-winkler@gmail.de", "PhoneNumber": "+491507489652", "color": "blue"},
                        {"username": "Angela", "email": "angela-merkel@gmail.de", "PhoneNumber": "+491511462385", "color": "red"},
                        {"username": "Kai", "email": "kai-pflaume@live.de", "PhoneNumber": "+491504896257", "color": "yellow"},
                        {"username": "Til", "email": "til-schweiger@gmail.de", "PhoneNumber": "+491514563248", "color": "orange"},
                        {"username": "Günther", "email": "günther-jauch@gmail.de", "PhoneNumber": "+4915157652244", "color": "blue"},
                        {"username": "Simon", "email": "simon-krätschmer@gmail.de", "PhoneNumber": "+491504621354", "color": "red"}];


async function putUsernameInContactList(){
    let getUserData = JSON.parse(localStorage.getItem("userData"))|| [];
    let getUserFriends = Array.isArray(getUserData.friends) ? getUserData.friends : [];

    colorCode = getRandomInt(colors.length);
    const nameExists = getUserFriends.some(contact =>
        contact && (contact.username === getUserData.name)
    );

    if (nameExists) {
        return getUserFriends;
    }
        
    let userJson = {"username": getUserData.name, "email": getUserData.email, "PhoneNumber": "4915135468484", "color": colors[colorCode]};
        getUserFriends.push(userJson);
        sortUserToAlphabeticalOrder(getUserFriends);
        // falls die Funktion async ist: warten bis API-Update fertig ist
    if (typeof addContactToLocalStorageAndAPI === "function") {
        await addContactToLocalStorageAndAPI(getUserFriends);
    }

    return getUserFriends;
}

async function renderContactList(){
    const login = checkIfLogedIn();

    if(login){
        await putUsernameInContactList();
    }

    let getUserData = JSON.parse(localStorage.getItem("userData"))|| [];
    let getContactsFromUser = Array.isArray(getUserData.friends) ? getUserData.friends : [];
    let contactContainerRef = document.getElementById("contactContainerID");
    contactContainerRef.innerHTML = "";

    if(!login){
        pushExampleContactsOneTimeInLocalStorage(exampleContacts);
    }else {
        setContactsIntoContactblock(getContactsFromUser);
    }


    
      

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
                    <contact onclick="renderSingleContact('${contact.username}')" class="single-contact single-contact-hover display-flex-center-x padding-medium-up-down-contacts" id="${contact.username}-contactID">

                        <div class="contacts-logo ${contact.color}">
                            <a>${getInitials(contact.username)}</a>
                        </div>
                        <div class="padding-left-contacts">
                            <div class="name-property padding-bottom-contacts padding-small-left-right-contacts" id="${contact.username}-usernameID">
                                <p>${makeFirstLetterBig(contact.username)}</p>
                            </div>
                            <div class="mail-property padding-small-left-right-contacts" id="${contact.username}-emailID">
                                <p>${contact.email}</p>
                            </div>
                        </div>

                    </contact>
            `;
        }); 
    }); 
};  


function makeContactBlue(inputName){

    if(remindString != null){
        document.getElementById(remindString + "-contactID").classList.add("single-contact-hover");
        document.getElementById(remindString + "-contactID").classList.remove("cursor-pointer");
        document.getElementById(remindString + "-contactID").classList.remove("backgroundcolor-blue");
        document.getElementById(remindString + "-usernameID").classList.remove("font-color-white");
        document.getElementById(remindString + "-emailID").classList.remove("font-color-white");
    } else {}
        document.getElementById(inputName + "-contactID").classList.remove("single-contact-hover");
        document.getElementById(inputName + "-contactID").classList.add("cursor-pointer");
        document.getElementById(inputName + "-contactID").classList.add("backgroundcolor-blue");
        document.getElementById(inputName + "-usernameID").classList.add("font-color-white");
        document.getElementById(inputName + "-emailID").classList.add("font-color-white");
        remindString = inputName;
}

function renderSingleContact(inputString){
    const contacts = flattenContactBlockToArray() || [];
    const rightIndex = findIndexFromUsername(contacts, inputString);
    const contact = contacts[rightIndex];




    if(contact.username == remindString){
        document.getElementById(contact.username + "-contactID").classList.add("single-contact-hover");
        document.getElementById(contact.username + "-contactID").classList.remove("backgroundcolor-blue");
        document.getElementById(remindString + "-usernameID").classList.remove("font-color-white");
        document.getElementById(contact.username + "-emailID").classList.remove("font-color-white");
        let singleContactRef = document.getElementById("singleContactID");
        singleContactRef.innerHTML = ""; 
        remindString = null;  
        }  else{
                    singleContactTemplate(contact.color, contact.username, rightIndex,  contact.email, contact.PhoneNumber);
                    //makeContactBlue(contact.username);
                }
}



function singleContactTemplate(inputColor, inputUsername, inputIndex,  inputEmail, inputPhone){
    let singleContactRef = document.getElementById("singleContactID");
    singleContactRef.innerHTML = `
    <show-contact>

            <div class="show-contact-container">
                <contact class="display-flex-center-x">
                    <div class="show-contact-logo ${inputColor}">
                        <a>${getInitials(inputUsername)}</a>
                    </div>
                    <div>
                        <div class="name-property">
                            <h2>${makeFirstLetterBig(inputUsername)}</h2>
                        </div>
                        <div style="display: flex;">
                            <div onclick="showEditContactFormular(), setUserDataValue(${inputIndex}), callWhiteScreen()"  class="edit-delete-container">
                                <img class="edit-delete-icons" src="./assets/img/edit.svg" alt="edit icon">
                                Edit
                            </div>
                            <div onclick="deleteContact('${inputUsername}')" class="edit-delete-container">
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
                <p class="mail-property">${inputEmail}</p>
                <br>
                <h3>Phone</h3>
                <br>
                <p>${inputPhone}</p>

            </div>

        </show-contact>
    
    `
}