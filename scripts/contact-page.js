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
  A: [],
  B: [],
  C: [],
  D: [],
  E: [],
  F: [],
  G: [],
  H: [],
  I: [],
  J: [],
  K: [],
  L: [],
  M: [],
  N: [],
  O: [],
  P: [],
  Q: [],
  R: [],
  S: [],
  T: [],
  U: [],
  V: [],
  W: [],
  X: [],
  Y: [],
  Z: [],
  other: [],
};

/**
 * @typedef {Object} Contact
 * @property {string} username
 * @property {string} [email]
 * @property {string} [PhoneNumber]
 * @property {string} [color}
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
 * Ensures the logged-in user is included in their own friends list.
 * If missing, adds the user with a random color, sorts list,
 * and persists via addContactToLocalStorageAndAPI if available.
 *
 * @async
 * @returns {Promise<Contact[]>} Updated friends list.
 */
async function putUsernameInContactList() {
  const profile = await loadCurrentUserProfile();
  let getUserFriends = await loadContactsForActiveUser();
  const nameExists = getUserFriends.some(
    (contact) => contact && profile && contact.username === profile.name
  );
  if (nameExists || !profile) return getUserFriends;
  let colorIndex = getRandomInt(9);
  let userJson = {
    username: profile.name,
    email: profile.email,
    PhoneNumber: " ",
    color: colors[colorIndex],
  };
  getUserFriends.push(userJson);
  sortUserToAlphabeticalOrder(getUserFriends);
  await persistContacts(getUserFriends);
  return getUserFriends;
}

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
async function renderContactList() {
  if (window.authReady) await window.authReady;
  const contacts = await getContactsForRendering();
  const container = document.getElementById("contactContainerID");
  container.innerHTML = "";
  setContactsIntoContactblock(contacts);
  Object.keys(contactBlock).forEach((key) =>
    renderContactBlock(container, key, contactBlock[key])
  );
}

/**
 * Resolves the contacts that should be rendered for the current session.
 * For guests, returns example contacts; for anonymous users, returns saved contacts;
 * for logged-in users, also ensures their own profile is included.
 *
 * @async
 * @returns {Promise<Contact[]>} Contacts to render.
 */
async function getContactsForRendering() {
  if (window.authReady) await window.authReady;
  if (!window.currentUser) return window.GUEST_EXAMPLE_CONTACTS || [];
  const userContacts = await loadContactsForActiveUser();
  if (window.currentUser?.isAnonymous) return userContacts;
  return putUsernameInContactList();
}

/**
 * Renders a single alphabetical contact block (letter + separator + items).
 *
 * @param {HTMLElement} container - Container element for the contact list.
 * @param {string} letter - Alphabet letter key for this block.
 * @param {Contact[]} block - Contacts belonging to this letter.
 * @returns {void}
 */
function renderContactBlock(container, letter, block) {
  if (!checkIfBlockIsFilled(block)) return;
  container.innerHTML += `
    <div class="padding-small-contacts"><h2>${letter}</h2></div>
    <separator class="separator"></separator>
  `;
  block.forEach((contact) => renderContactListItem(container, contact));
}

/**
 * Appends a single contact list item into the container.
 *
 * @param {HTMLElement} container - Container element for the contact list.
 * @param {Contact} contact - Contact to render as a list item.
 * @returns {void}
 */
function renderContactListItem(container, contact) {
  container.innerHTML += `
    <contact onclick="handleContactClick('${contact.username}-contactID', '${contact.username}')"
      class="single-contact single-contact-hover display-flex-center-x padding-medium-up-down-contacts"
      id="${contact.username}-contactID">
      <div class="contacts-logo ${contact.color}"><a>${getInitials(contact.username)}</a></div>
      <div class="padding-left-contacts">
        <div class="name-property padding-bottom-contacts padding-small-left-right-contacts" id="${contact.username}-usernameID"><p>${makeFirstLetterBig(contact.username)}</p></div>
        <div class="mail-property padding-small-left-right-contacts" id="${contact.username}-emailID"><p>${contact.email}</p></div>
      </div>
    </contact>`;
}

/**
 * Toggles highlight for a given contact.
 * Unhighlights previous selection, highlights the new one,
 * and updates currentlySelectedContact.
 *
 * @param {string} contactId - DOM id like "Alice-contactID".
 * @returns {boolean} True if contact is now selected, false if deselected.
 */
function toggleContactHighlight(contactId) {
  const isSameContact = currentlySelectedContact === contactId;
  clearCurrentHighlight();
  if (isSameContact) return false;
  applyHighlight(contactId);
  currentlySelectedContact = contactId;
  return true;
}

/**
 * Clears the highlight from the currently selected contact, if any.
 *
 * @returns {void}
 */
function clearCurrentHighlight() {
  if (!currentlySelectedContact) return;
  const oldBase = currentlySelectedContact.replace("-contactID", "");
  document
    .getElementById(currentlySelectedContact)
    ?.classList.remove("backgroundcolor-blue");
  removeFontHighlight(oldBase);
  currentlySelectedContact = null;
}

/**
 * Applies highlight styles to the contact with the given id.
 *
 * @param {string} contactId - DOM id like "Alice-contactID".
 * @returns {void}
 */
function applyHighlight(contactId) {
  const base = contactId.replace("-contactID", "");
  document.getElementById(contactId)?.classList.add("backgroundcolor-blue");
  document
    .getElementById(base + "-usernameID")
    ?.classList.add("font-color-white");
  document
    .getElementById(base + "-emailID")
    ?.classList.add("font-color-white");
}

/**
 * Removes font highlight classes from the given contact base id.
 *
 * @param {string} base - Base id of the contact (without suffix).
 * @returns {void}
 */
function removeFontHighlight(base) {
  document
    .getElementById(base + "-usernameID")
    ?.classList.remove("font-color-white");
  document
    .getElementById(base + "-emailID")
    ?.classList.remove("font-color-white");
}

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
    const singleRef = document.getElementById("singleContactID");
    if (singleRef) singleRef.innerHTML = "";
    closeWhiteScreen();
    return;
  }
  renderSingleContact(username);
  const contacts = flattenContactBlockToArray() || [];
  const index = findIndexFromUsername(contacts, username);
  if (index >= 0) {
    window.currentContactIndex = index;
    setUserDataValue(index);
  }
}

/**
 * Renders a single contact into the detail view using singleContactTemplate().
 *
 * @param {string} inputString - Username to render.
 * @returns {void}
 */
function renderSingleContact(inputString) {
  const contacts = flattenContactBlockToArray() || [];
  const rightIndex = findIndexFromUsername(contacts, inputString);
  const contact = contacts[rightIndex];

  singleContactTemplate(
    contact.color,
    contact.username,
    rightIndex,
    contact.email,
    contact.PhoneNumber
  );
}
