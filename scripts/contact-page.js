let contactBlock = {
    A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [],
    K: [], L: [], M: [], N: [], O: [], P: [], Q: [], R: [], S: [], T: [],
    U: [], V: [], W: [], X: [], Y: [], Z: [], other: []
};

let exampleContacts = [ {"username": "Peter", "email": "peter-lustig@hotmail.de", "PhoneNumber": "+491517866563"},
                        {"username": "Karsten", "email": "karsten-stahl@gmail.de", "PhoneNumber": "+49151478632475"},
                        {"username": "Thomas", "email": "thomas-gottschalck@live.de", "PhoneNumber": "+491517896455"},
                        {"username": "Rainer", "email": "rainer-winkler@gmail.de", "PhoneNumber": "+491507489652"},
                        {"username": "Angela", "email": "angela-merkel@gmail.de", "PhoneNumber": "+491511462385"},
                        {"username": "Kai", "email": "kai-pflaume@live.de", "PhoneNumber": "+491504896257"},
                        {"username": "Til", "email": "til-schweiger@gmail.de", "PhoneNumber": "+491514563248"},
                        {"username": "Günther", "email": "günther-jauch@gmail.de", "PhoneNumber": "+4915157652244"},
                        {"username": "Simon", "email": "simon-krätschmer@gmail.de", "PhoneNumber": "+491504621354"},
                        {"username": "reset", "email": "reset@gmail.de", "PhoneNumber": "0000000000000"}];


   function renderContactList(){
    let getUserData = JSON.parse(localStorage.getItem("userData"))|| [];

    
    let getContactsFromUser = Array.isArray(getUserData.friends) ? getUserData.friends : [];
    let contactContainerRef = document.getElementById("contactContainerID");
    contactContainerRef.innerHTML = "";

    //pushExampleContactsOneTimeInLocalStorage();
    setContactsIntoContactblock(getContactsFromUser);


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

                        <div class="contacts-logo ${contact.color}">
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

    consoleLogArray();
    
    
}  

async function consoleLogArray(){
    const result = await getAllUsers("users"); 
}




function renderSingleContact(inputString){
    
    const getUserData = JSON.parse(localStorage.getItem("userData"))|| [];
    const contacts = getUserData.friends;
    
    const rightIndex = findIndexFromUsername(contacts, inputString);
    const contact = contacts[rightIndex];
    
    let singleContactRef = document.getElementById("singleContactID");
    singleContactRef.innerHTML = `
    <show-contact>

            <div class="show-contact-container">
                <contact class="display-flex-center-x">
                    <div class="show-contact-logo ${contact.color}">
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
                            <div onclick="deleteContact('${contact.username}')" class="edit-delete-container">
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

