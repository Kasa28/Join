/**
 * Firebase base URL for all database requests.
 * @type {string}
 */
const BASE_URL =
  "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app";
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
function removeContentfromAllContactBlocks() {
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
function makeFirstLetterBig(inputString) {
  const value = String(inputString);
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  if (contentRef) contentRef.classList.remove("d_none");
}

/**
 * Hides the white-screen overlay and closes edit/add contact forms.
 * @returns {void}
 */
function closeWhiteScreen() {
  const contentRef = document.getElementById("white-screen");
  if (contentRef) contentRef.classList.add("d_none");
  hideEditContactFormular();
  hideAddContactFormular();
}

/**
 * Gets the color of a contact by index from the current user's friends.
 * @param {number} inputIndex
 * @returns {string|undefined}
 */
function getContactColorType(inputIndex) {
  const contacts = flattenContactBlockToArray();
  const contact = contacts[inputIndex];
  return contact ? contact.color : undefined;
}

/**
 * Checks if a contact block has at least one entry.
 * @param {any[]} inputBlock
 * @returns {boolean}
 */
function checkIfBlockIsFilled(inputBlock) {
  return Array.isArray(inputBlock) && inputBlock.length > 0;
}

/**
 * Builds initials from a full name (first + last).
 * @param {string} inputFullName
 * @returns {string}
 */
function getInitials(inputFullName) {
  const nameParts = String(inputFullName).trim().split(/\s+/);
  const first = nameParts[0]?.charAt(0).toUpperCase() || "";
  const last = nameParts[1]?.charAt(0).toUpperCase() || "";
  return first + last;
}

/**
 * Persists the current contacts for the active user (API or guest localStorage)
 * @param {Contact[]} updatedFriends
 * @returns {Promise<void>}
 */
async function persistContacts(updatedFriends) {
  await window.persistContactsForActiveUser(updatedFriends);
  setContactsIntoContactblock(updatedFriends);
}

/**
 * Sorts contacts in-place by username (case-insensitive).
 * @param {Contact[]} inputArray
 * @returns {void}
 */
function sortUserToAlphabeticalOrder(inputArray) {
  inputArray.sort((a, b) => {
    const aName = (a.username || "").toLowerCase();
    const bName = (b.username || "").toLowerCase();
    if (aName < bName) return -1;
    if (aName > bName) return 1;
    return 0;
  });
}

/**
 * Finds the index of a contact by username.
 * @param {Contact[]} inputContactArray
 * @param {string} inputUsername
 * @returns {number} Index or -1 if not found.
 */
function findIndexFromUsername(inputContactArray, inputUsername) {
  for (let index = 0; index < inputContactArray.length; index++) {
    if (inputContactArray[index].username === inputUsername) return index;
  }
  return -1;
}

/**
 * Normalizes incoming contacts (array or object) into an array.
 * @param {Contact[]|Record<string, Contact>} inputContacts
 * @returns {Contact[]}
 */
function normalizeContacts(inputContacts) {
  if (Array.isArray(inputContacts)) return inputContacts;
  if (inputContacts && typeof inputContacts === "object") {
    return Object.values(inputContacts);
  }
  return [];
}

/**
 * Adds a single contact into the correct contactBlock bucket.
 * @param {Contact} contact
 * @returns {void}
 */
function addContactToBlock(contact) {
  if (!contact || typeof contact.username !== "string" || !contact.username.length) return;
  const firstLetter = contact.username.charAt(0).toUpperCase();
  if (contactBlock[firstLetter]) {
    contactBlock[firstLetter].push(contact);
  } else {
    contactBlock.other.push(contact);
  }
}

/**
 * Sorts all buckets inside global contactBlock.
 * @returns {void}
 */
function sortAllContactBuckets() {
  Object.keys(contactBlock).forEach((key) => {
    if (Array.isArray(contactBlock[key])) {
      sortUserToAlphabeticalOrder(contactBlock[key]);
    }
  });
}

/**
 * Splits contacts into alphabetical blocks in global `contactBlock`.
 * Accepts either an array of contacts or an object of contacts.
 * @param {Contact[]|Record<string, Contact>} inputContacts
 * @returns {void}
 */
function setContactsIntoContactblock(inputContacts) {
  removeContentfromAllContactBlocks();
  const contacts = normalizeContacts(inputContacts);
  contacts.forEach(addContactToBlock);
  sortAllContactBuckets();
}

/**
 * Returns all alphabetical keys (A–Z) from contactBlock.
 * @returns {string[]}
 */
function getAlphaContactKeys() {
  return Object.keys(contactBlock)
    .filter((k) => k !== "other")
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Pushes valid contacts from a list into the result array.
 * @param {Contact[]} list
 * @param {Contact[]} result
 * @returns {void}
 */
function pushValidContacts(list, result) {
  list.forEach((contact) => {
    if (contact && typeof contact.username === "string") result.push(contact);
  });
}

/**
 * Flattens contactBlock into a single, alphabetically ordered array.
 * Buckets A–Z first, then "other".
 * @returns {Contact[]}
 */
function flattenContactBlockToArray() {
  const result = [];
  if (!contactBlock || typeof contactBlock !== "object") return result;
  const alphaKeys = getAlphaContactKeys();
  alphaKeys.forEach((key) => {
    const list = Array.isArray(contactBlock[key]) ? contactBlock[key] : [];
    pushValidContacts(list, result);
  });
  if (Array.isArray(contactBlock.other)) {
    pushValidContacts(contactBlock.other, result);
  }
  return result;
}

/**
 * @typedef {Object} ToastOptions
 * @property {"ok"|"error"} [variant="ok"]
 * @property {number} [duration=1500]
 */

/**
 * Ensures the toast root element exists in the DOM.
 * @returns {HTMLDivElement}
 */
function ensureToastRoot() {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  return /** @type {HTMLDivElement} */ (root);
}

/**
 * Creates a toast element with the given text and variant.
 * @param {string} text
 * @param {"ok"|"error"} variant
 * @returns {HTMLDivElement}
 */
function createToastElement(text, variant) {
  const toast = document.createElement("div");
  toast.className = "toast toast--show" + (variant === "error" ? " toast--error" : "");
  toast.textContent = text;
  return /** @type {HTMLDivElement} */ (toast);
}

/**
 * Schedules removal of a toast element after given duration.
 * @param {HTMLDivElement} toast
 * @param {number} duration
 * @returns {void}
 */
function scheduleToastRemoval(toast, duration) {
  setTimeout(() => {
    toast.classList.remove("toast--show");
    toast.classList.add("toast--hide");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, duration);
}

/**
 * Shows a toast message in the contacts UI.
 * @param {string} text
 * @param {ToastOptions} [options]
 * @returns {void}
 */
function showContactToast(text, { variant = "ok", duration = 1500 } = {}) {
  const root = ensureToastRoot();
  const toast = createToastElement(text, variant);
  root.appendChild(toast);
  scheduleToastRemoval(toast, duration);
}

/**
 * Exposes showContactToast globally.
 * @type {(text: string, options?: ToastOptions) => void}
 */
window.showContactToast = showContactToast;
