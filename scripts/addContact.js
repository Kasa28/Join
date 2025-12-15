/**
 * @type {string[]}
 */
let colors = ["red", "blue", "green", "brown", "purple", "turquoise", "orange", "black", "pink"];

/**
 * @type {string|undefined}
 */
let colorCode;

/**
 * @typedef {Object} Contact
 * @property {string} username
 * @property {string} email
 * @property {string} PhoneNumber
 * @property {string} color
 */

/**
 * Shows the Add Contact form.
 * @param {string} [elementId="add-contactID"]
 * @returns {void}
 */
function showAddContactFormular(elementId = "add-contactID") {
  document.getElementById(elementId).classList.remove("hide-add-contact");
}

/**
 * Hides the Add Contact form.
 * @param {string} [elementId="add-contactID"]
 * @returns {void}
 */
function hideAddContactFormular(elementId = "add-contactID") {
  document.getElementById(elementId).classList.add("hide-add-contact");
}

/**
 * Clears all input fields in the Add Contact form.
 * @param {string} [nameId="add-contact-usernameID"]
 * @param {string} [mailId="add-contact-mailID"]
 * @param {string} [phoneId="add-contact-phone-numberID"]
 * @returns {void}
 */
function emptyTheAddContactFormular(
  nameId = "add-contact-usernameID",
  mailId = "add-contact-mailID",
  phoneId = "add-contact-phone-numberID"
) {
  document.getElementById(nameId).value = "";
  document.getElementById(mailId).value = "";
  document.getElementById(phoneId).value = "";
}

/**
 * Validates a name string.
 * @param {string} name
 * @returns {boolean}
 */
function isValidName(name) {
  const trimmed = name.trim();
  return trimmed.length >= 2 && /^[\p{L}\p{M}\s'.-]+$/u.test(trimmed);
}

/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email) return false;
  const [local, domain] = String(email).trim().split("@");
  if (!local || !domain) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  if (!/^[A-Za-z0-9._%+-]+$/.test(local) || !/[A-Za-z]/.test(local)) return false;
  if (!/^[A-Za-z0-9.-]+$/.test(domain)) return false;
  const parts = domain.split(".");
  if (parts.length < 2 || parts.some((p) => !p || p.startsWith("-") || p.endsWith("-"))) return false;
  const tld = parts[parts.length - 1];
  const mainDomain = parts[parts.length - 2];
  if (!/^[A-Za-z]{2,}$/.test(tld) || !/[A-Za-z]/.test(mainDomain)) return false;
  return true;
}

/**
 * Validates a German phone number.
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhoneNumber(phone) {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  return /^(\+49|0)[1-9]\d{6,14}$/.test(trimmed);
}

/**
 * Reads values from Add Contact form inputs.
 * @param {string} [nameId="add-contact-usernameID"]
 * @param {string} [mailId="add-contact-mailID"]
 * @param {string} [phoneId="add-contact-phone-numberID"]
 * @returns {{usernameRef: string, usermailRef: string, phonenumberRef: string}}
 */
function getAddContactFormValues(
  nameId = "add-contact-usernameID",
  mailId = "add-contact-mailID",
  phoneId = "add-contact-phone-numberID"
) {
  const usernameRef = document.getElementById(nameId).value.trim();
  const usermailRef = document.getElementById(mailId).value.trim();
  const phonenumberRef = document.getElementById(phoneId).value.trim();
  return { usernameRef, usermailRef, phonenumberRef };
}

/**
 * @callback ToastFn
 * @param {string} message
 * @param {{variant?: string}} [options]
 * @returns {void}
 */

/**
 * Validates contact input values.
 * @param {string} usernameRef
 * @param {string} usermailRef
 * @param {string} phonenumberRef
 * @param {ToastFn} [toastFn=showContactToast]
 * @returns {boolean}
 */
function validateContactInputs(usernameRef, usermailRef, phonenumberRef, toastFn = showContactToast) {
  if (!isValidName(usernameRef)) {
    toastFn("Please enter a valid name containing letters and no numbers", { variant: "error" });
    return false;
  }
  if (!isValidEmail(usermailRef)) {
    toastFn("Please enter a valid email address!", { variant: "error" });
    return false;
  }
  if (!isValidPhoneNumber(phonenumberRef)) {
    toastFn("Phone number must start with +49 or 0 and contain only numbers", { variant: "error" });
    return false;
  }
  return true;
}

/**
 * Builds a contact object from values.
 * @param {string} usernameRef
 * @param {string} usermailRef
 * @param {string} phonenumberRef
 * @returns {Contact}
 */
function buildContactJson(usernameRef, usermailRef, phonenumberRef) {
  colorCode = getRandomInt(colors.length);
  return {
    username: usernameRef,
    email: usermailRef,
    PhoneNumber: phonenumberRef,
    color: colors[colorCode]
  };
}

/**
 * Saves contacts and updates UI.
 * @param {Contact[]} contacts
 * @param {Contact} contactJson
 * @returns {Promise<void>}
 */
async function saveAndRenderContacts(contacts, contactJson) {
  contacts.push(contactJson);
  sortUserToAlphabeticalOrder(contacts);
  await persistContacts(contacts);
  emptyTheAddContactFormular();
  hideAddContactFormular();
  renderContactList();
}

/**
 * Creates a new contact and persists it.
 * @param {() => Promise<Contact[]>} [loadFn=loadContactsForActiveUser]
 * @param {ToastFn} [toastFn=showContactToast]
 * @returns {Promise<boolean>}
 */
async function addNewContact(loadFn = loadContactsForActiveUser, toastFn = showContactToast) {
  if (window.authReady) await window.authReady;
  const contacts = await loadFn();
  const { usernameRef, usermailRef, phonenumberRef } = getAddContactFormValues();
  if (!validateContactInputs(usernameRef, usermailRef, phonenumberRef, toastFn)) return false;
  const contactJson = buildContactJson(usernameRef, usermailRef, phonenumberRef);
  await saveAndRenderContacts(contacts, contactJson);
  toastFn("Contact successfully created");
  return true;
}

/**
 * Handles Add Contact action and closes overlay if successful.
 * @param {() => Promise<boolean>} [addFn=addNewContact]
 * @param {() => void} [closeFn=closeWhiteScreen]
 * @returns {Promise<void>}
 */
async function handleAddContact(addFn = addNewContact, closeFn = closeWhiteScreen) {
  const contactCreated = await addFn();
  if (contactCreated) {
    closeFn();
  }
}
