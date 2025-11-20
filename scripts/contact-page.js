/**
 * Currently selected contact DOM id (e.g. "Alice-contactID"), or null if none.
 * @type {string|null}
 */
let currentlySelectedContact = null;
/**
 * Alphabetical contact buckets (A–Z + other).
 * @type {ContactBlock}
 */
let contactBlock = {
    A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [],
    K: [], L: [], M: [], N: [], O: [], P: [], Q: [], R: [], S: [], T: [],
    U: [], V: [], W: [], X: [], Y: [], Z: [], other: []
};

/**
 * @typedef {Object} Contact
 * @property {string} username
 * @property {string} [email]
 * @property {string} [PhoneNumber]
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


/* ---------------------------------------------------------
   Nutzer einfügen, falls noch nicht in der eigenen Liste
--------------------------------------------------------- */
/**
 * Ensures the logged-in user is included in their own friends list.
 * If missing, adds the user with a random color, sorts list,
 * and persists via addContactToLocalStorageAndAPI if available.
 *
 * @async
 * @returns {Promise<Contact[]>} Updated friends list.
 */
async function putUsernameInContactList(){
    let getUserData = JSON.parse(localStorage.getItem("userData")) || [];
    let getUserFriends = Array.isArray(getUserData.friends) ? getUserData.friends : [];

    const nameExists = getUserFriends.some(contact =>
        contact && (contact.username === getUserData.name)
    );

    if (nameExists) return getUserFriends;

    let colorIndex = getRandomInt(9);
    let userJson = {
        "username": getUserData.name,
        "email": getUserData.email,
        "PhoneNumber": "4915135468484",
        "color": colors[colorIndex]
    };

    getUserFriends.push(userJson);
    sortUserToAlphabeticalOrder(getUserFriends);

    if (typeof addContactToLocalStorageAndAPI === "function") {
        await addContactToLocalStorageAndAPI(getUserFriends);
    }

    return getUserFriends;
}

/* ---------------------------------------------------------
   Kontaktliste rendern
--------------------------------------------------------- */
/**
 * Renders the full contact list grouped by first letter.
 * If logged in, syncs user into list first, otherwise loads example contacts.
 *
 * Side effects:
 * - Mutates global contactBlock
 * - Writes to #contactContainerID
 *
 * @async
 * @returns {Promise<void>}
 */
async function renderContactList(){
    const login = checkIfLogedIn();

    if (login) await putUsernameInContactList();

    let getUserData = JSON.parse(localStorage.getItem("userData")) || [];
    let getContactsFromUser = Array.isArray(getUserData.friends) ? getUserData.friends : [];
    let contactContainerRef = document.getElementById("contactContainerID");
    contactContainerRef.innerHTML = "";

    if (!login) {
        pushExampleContactsOneTimeInLocalStorage(exampleContacts);
    } else {
        setContactsIntoContactblock(getContactsFromUser);
    }

    Object.keys(contactBlock).forEach((key) => {
        let block = contactBlock[key];
        if (!checkIfBlockIsFilled(block)) return;

        contactContainerRef.innerHTML += `
            <div class="padding-small-contacts"><h2>${key}</h2></div>
            <separator class="separator"></separator>
        `;

        block.forEach((contact) => {
            contactContainerRef.innerHTML += `
                <contact 
                    onclick="handleContactClick('${contact.username}-contactID', '${contact.username}')"
                    class="single-contact single-contact-hover display-flex-center-x padding-medium-up-down-contacts" 
                    id="${contact.username}-contactID">

                    <div class="contacts-logo ${contact.color}">
                        <a>${getInitials(contact.username)}</a>
                    </div>

                    <div class="padding-left-contacts">
                        <div class="name-property padding-bottom-contacts padding-small-left-right-contacts" 
                             id="${contact.username}-usernameID">
                             <p>${makeFirstLetterBig(contact.username)}</p>
                        </div>
                        <div class="mail-property padding-small-left-right-contacts" 
                             id="${contact.username}-emailID">
                             <p>${contact.email}</p>
                        </div>
                    </div>
                </contact>`;
        });
    });
}

/* ---------------------------------------------------------
   Kontakt optisch markieren (blau + weiß)
--------------------------------------------------------- */
/**
 * Toggles highlight for a given contact.
 * Unhighlights previous selection, highlights the new one,
 * and updates currentlySelectedContact.
 *
 * @param {string} contactId - DOM id like "Alice-contactID".
 * @returns {boolean} True if contact is now selected, false if deselected.
 */
function toggleContactHighlight(contactId) {
    const same = currentlySelectedContact === contactId;

    if (currentlySelectedContact) {
        const oldBase = currentlySelectedContact.replace("-contactID", "");
        document.getElementById(currentlySelectedContact)?.classList.remove("backgroundcolor-blue");
        document.getElementById(oldBase + "-usernameID")?.classList.remove("font-color-white");
        document.getElementById(oldBase + "-emailID")?.classList.remove("font-color-white");
    }

    if (same) {
        currentlySelectedContact = null;
        return false;
    }

    const base = contactId.replace("-contactID", "");
    document.getElementById(contactId)?.classList.add("backgroundcolor-blue");
    document.getElementById(base + "-usernameID")?.classList.add("font-color-white");
    document.getElementById(base + "-emailID")?.classList.add("font-color-white");

    currentlySelectedContact = contactId;
    return true;
}

/* ---------------------------------------------------------
   Kontakt-Klick: Highlight + Render + Edit-Fenster öffnen
--------------------------------------------------------- */
/**
 * Handles click on a contact:
 * - toggles highlight
 * - if selected: renders single contact + sets user data
 * - if deselected: clears single contact view and closes overlay
 *
 * @param {string} contactId - DOM id like "Alice-contactID".
 * @param {string} username - Username of clicked contact.
 * @returns {void}
 */
function handleContactClick(contactId, username) {
    const becameSelected = toggleContactHighlight(contactId);

    if (!becameSelected) {

        // ➤ Datenbereich schließen
        const singleRef = document.getElementById("singleContactID");
        if (singleRef) singleRef.innerHTML = "";
    
        closeWhiteScreen();
        return;
    }

    renderSingleContact(username);

    const contacts = flattenContactBlockToArray() || [];
    const index = findIndexFromUsername(contacts, username);
    if (index >= 0) setUserDataValue(index);
}

/* ---------------------------------------------------------
   Einzelnen Kontakt anzeigen
--------------------------------------------------------- */
/**
 * Renders a single contact into the detail view using singleContactTemplate().
 *
 * @param {string} inputString - Username to render.
 * @returns {void}
 */
function renderSingleContact(inputString){
    const contacts = flattenContactBlockToArray() || [];
    const rightIndex = findIndexFromUsername(contacts, inputString);
    const contact = contacts[rightIndex];

    singleContactTemplate(contact.color, contact.username, rightIndex, contact.email, contact.PhoneNumber);
}