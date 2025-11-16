const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";



function removeContentfromAllContactBlocks(){
    contactBlock = {
        A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [],
        K: [], L: [], M: [], N: [], O: [], P: [], Q: [], R: [], S: [], T: [],
        U: [], V: [], W: [], X: [], Y: [], Z: [], other: []
    };

}

function makeFirstLetterBig(inputString){

    return String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1);

}




function getContactColorType(inputIndex){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || {};
    const contacts = Array.isArray(getUserData.friends) ? getUserData.friends : [];
    const contact = contacts[inputIndex];
    return contact.color;
}

function setColorCodeBackto0WhenItsToBig(inputColorCode){

    if(inputColorCode > 8){
        colorCode = 0;
        return;
    } return;

}


function checkIfBlockIsFilled(inputBlock){
    if(inputBlock.length < 1){
        return false;
    } else {
        return true;
    }
}

function getInitials(inputFullName){
    const nameParts = inputFullName.split(/\s+/);
    const firstNameInital = nameParts[0]?.charAt(0).toUpperCase() || "";
    const lastNameInitial = nameParts[1]?.charAt(0).toUpperCase() || "";
    return `${firstNameInital}${lastNameInitial}`
}

function sortUserToAlphabeticalOrder(inputArray){

    inputArray.sort((a, b) => {
        if (a.username.toLowerCase() < b.username.toLowerCase()) return -1;
        if (a.username.toLowerCase() > b.username.toLowerCase()) return 1;
        return 0;
    });
}

function findIndexFromUsername(inputContactArray, inputUsername){
for (let index = 0; index < inputContactArray.length; index++) {
        if (inputContactArray[index].username === inputUsername) {
            return index;
        }
    }

    return -1;
}


function setContactsIntoContactblock(inputContacts){

    removeContentfromAllContactBlocks();
    
    const contacts = Array.isArray(inputContacts) ? inputContacts : [];


    contacts.forEach((contact) => {
        const firstLetter = contact.username.charAt(0).toUpperCase();
        if(contactBlock[firstLetter]){
            contactBlock[firstLetter].unshift(contact);
        } else {
            contactBlock.other.unshift(contact);
        }
     });
}


function pushExampleContactsOneTimeInLocalStorage(){
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];


    // Überprüfen, ob einer der Namen bereits im Array vorhanden ist
    const nameExists = contacts.some(contact =>
        contact && (contact.username === "reset")
    );

    // Wenn einer der Namen existiert, Funktion abbrechen
    if (nameExists) {
        return;
    }

    // Namen hinzufügen, wenn sie nicht existieren
    if (exampleContacts.length > 0) {
        contacts.push(...exampleContacts);
        exampleContacts = []; // Leere das Array nach dem Hinzufügen
        addContactToLocalStorageAndAPI(contacts);
        console.log("Beispielkontakte wurden hinzugefügt:", contacts);
    } else {
        console.log("Keine Beispielkontakte vorhanden.");
    }
}

