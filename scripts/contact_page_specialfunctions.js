/**
 * Firebase base URL for all database requests.
 * @type {string}
 */
const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";
/**
 * @typedef {Object} Contact
 * @property {string} username
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [color]
 */

/**
 * @typedef {Object} ContactBlock
 * @property {Contact[]} A
 * @property {Contact[]} B
 * @property {Contact[]} C
 * @property {Contact[]} D
 * @property {Contact[]} E
 * @property {Contact[]} F
 * @property {Contact[]} G
 * @property {Contact[]} H
 * @property {Contact[]} I
 * @property {Contact[]} J
 * @property {Contact[]} K
 * @property {Contact[]} L
 * @property {Contact[]} M
 * @property {Contact[]} N
 * @property {Contact[]} O
 * @property {Contact[]} P
 * @property {Contact[]} Q
 * @property {Contact[]} R
 * @property {Contact[]} S
 * @property {Contact[]} T
 * @property {Contact[]} U
 * @property {Contact[]} V
 * @property {Contact[]} W
 * @property {Contact[]} X
 * @property {Contact[]} Y
 * @property {Contact[]} Z
 * @property {Contact[]} other
 */

/**
 * Resets all contact blocks (A–Z + other) to empty arrays.
 * Side effect: overwrites global `contactBlock`.
 * @returns {void}
 */

function removeContentfromAllContactBlocks(){
    contactBlock = {
        A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [],
        K: [], L: [], M: [], N: [], O: [], P: [], Q: [], R: [], S: [], T: [],
        U: [], V: [], W: [], X: [], Y: [], Z: [], other: []
    };

}

/**
 * Capitalizes the first character of a string.
 * @param {string} inputString
 * @returns {string}
 */
function makeFirstLetterBig(inputString){

    return String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1);
}

/**
 * Returns a random integer in the range [0, max).
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Shows the white-screen overlay.
 * @returns {void}
 */
function callWhiteScreen() {
    const contentRef = document.getElementById("white-screen");
    contentRef.classList.remove("d_none");
}

/**
 * Hides the white-screen overlay and closes edit/add contact forms.
 * @returns {void}
 */
function closeWhiteScreen(){
    const contentRef = document.getElementById("white-screen");
    contentRef.classList.add("d_none");
    hideEditContactFormular();
    hideAddContactFormular();
}

/**
 * Gets the color of a contact by index from the current user's friends.
 * @param {number} inputIndex
 * @returns {string|undefined}
 */
function getContactColorType(inputIndex){
    const contacts = flattenContactBlockToArray();
    const contact = contacts[inputIndex];
    return contact.color;
}

/**
 * Checks if a contact block has at least one entry.
 * @param {any[]} inputBlock
 * @returns {boolean}
 */
function checkIfBlockIsFilled(inputBlock){
    if(inputBlock.length < 1){
        return false;
    } else {
        return true;
    }
}
/**
 * Builds initials from a full name (first + last).
 * @param {string} inputFullName
 * @returns {string}
 */
function getInitials(inputFullName){
    const nameParts = inputFullName.split(/\s+/);
    const firstNameInital = nameParts[0]?.charAt(0).toUpperCase() || "";
    const lastNameInitial = nameParts[1]?.charAt(0).toUpperCase() || "";
    return `${firstNameInital}${lastNameInitial}`
}

/**
 * Persists the current contacts for the active user (API or guest localStorage)
 * @param {Contact[]} updatedFriends
 * @returns {void}
 */
async function persistContacts(updatedFriends){
    await window.persistContactsForActiveUser(updatedFriends);
    setContactsIntoContactblock(updatedFriends);
}
/**
 * Sorts contacts in-place by username (case-insensitive).
 * @param {Contact[]} inputArray
 * @returns {void}
 */
function sortUserToAlphabeticalOrder(inputArray){

    inputArray.sort((a, b) => {
        if (a.username.toLowerCase() < b.username.toLowerCase()) return -1;
        if (a.username.toLowerCase() > b.username.toLowerCase()) return 1;
        return 0;
    });
}
/**
 * Finds the index of a contact by username.
 * @param {Contact[]} inputContactArray
 * @param {string} inputUsername
 * @returns {number} Index or -1 if not found.
 */
function findIndexFromUsername(inputContactArray, inputUsername){
for (let index = 0; index < inputContactArray.length; index++) {
        if (inputContactArray[index].username === inputUsername) {
            return index;
        }
    }

    return -1;
}

/**
 * Splits contacts into alphabetical blocks in global `contactBlock`.
 * Accepts either an array of contacts or an object of contacts.
 * @param {Contact[]|Record<string, Contact>} inputContacts
 * @returns {void}
 */
function setContactsIntoContactblock(inputContacts){

    removeContentfromAllContactBlocks();
    
    let contacts = [];
    if (Array.isArray(inputContacts)) {
        contacts = inputContacts;
    } else if (inputContacts && typeof inputContacts === "object") {
        contacts = Object.values(inputContacts);
    } else {
        contacts = [];
    }


    contacts.forEach((contact) => {
        // Safeguard: skippe ungültige Einträge
        if (!contact || typeof contact.username !== "string" || contact.username.length === 0) {
            return;
        }
        const firstLetter = contact.username.charAt(0).toUpperCase();
        if(contactBlock[firstLetter]){
         contactBlock[firstLetter].push(contact);
        } else {
        contactBlock.other.push(contact);
        }
     });
      Object.keys(contactBlock).forEach((key) => {
        sortUserToAlphabeticalOrder(contactBlock[key]);
    });
}

function flattenContactBlockToArray() {
    const result = [];
    if (!contactBlock || typeof contactBlock !== "object") return result;

    // keys A..Z in natural order if present
    const alphaKeys = Object.keys(contactBlock)
        .filter(k => k !== "other")
        .sort((a,b) => a.localeCompare(b));

    alphaKeys.forEach(key => {
        const list = Array.isArray(contactBlock[key]) ? contactBlock[key] : [];
        list.forEach(contact => {
            if (contact && typeof contact.username === "string") result.push(contact);
        });
    });

    // append 'other' block last
    if (Array.isArray(contactBlock.other)) {
        contactBlock.other.forEach(contact => {
            if (contact && typeof contact.username === "string") result.push(contact);
        });
    }

    return result;
}


/**
 * @typedef {Object} ToastOptions
 * @property {"ok"|"error"} [variant="ok"]
 * @property {number} [duration=1500]
 */
/**
 * Shows a toast message in the contacts UI.
 * @param {string} text
 * @param {ToastOptions} [options]
 * @returns {void}
 */


function showContactToast(text, { variant = "ok", duration = 1500 } = {}) {
    let root = document.getElementById("toast-root");
    if (!root) {
        root = document.createElement("div");
        root.id = "toast-root";
        document.body.appendChild(root);
    }

    const toast = document.createElement("div");
    toast.className = "toast toast--show" + (variant === "error" ? " toast--error" : "");
    toast.textContent = text;
    root.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("toast--show");
        toast.classList.add("toast--hide");
        toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, duration);
}
/**
 * Exposes showContactToast globally.
 * @type {(text: string, options?: ToastOptions) => void}
 */
window.showContactToast = showContactToast;
