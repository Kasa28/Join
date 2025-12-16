let remindIndex = null;

/**
 * Opens the Edit Contact form by removing the hidden class.
 */
function showEditContactFormular() {
  document
    .getElementById("edit-contactID")
    .classList.remove("hide-edit-contact");
}

function isValidName(name) {
  const trimmed = name.trim();
  return trimmed.length >= 2 && /^[\p{L}\p{M}\s'.-]+$/u.test(trimmed);
}

function isValidEmail(email) {
  if (!email) return false;
  const [local, domain] = String(email).trim().split("@");
  if (!local || !domain) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes(".."))
    return false;
  if (!/^[A-Za-z0-9._%+-]+$/.test(local) || !/[A-Za-z]/.test(local))
    return false;
  if (!/^[A-Za-z0-9.-]+$/.test(domain)) return false;
  const parts = domain.split(".");
  if (parts.length < 2 || parts.some((p) => !p || p.startsWith("-") || p.endsWith("-")))
    return false;
  const tld = parts[parts.length - 1];
  const mainDomain = parts[parts.length - 2];
  if (!/^[A-Za-z]{2,}$/.test(tld) || !/[A-Za-z]/.test(mainDomain)) return false;
  return true;
}

function isValidPhoneNumber(phone) {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  return /^(\+49|0)[1-9]\d{6,14}$/.test(trimmed);
}

/**
 * Closes the Edit Contact form by adding the hidden class.
 */
function hideEditContactFormular() {
  document
    .getElementById("edit-contactID")
    .classList.add("hide-edit-contact");
}

/**
 * Loads the selected contact's data into the Edit Contact form fields.
 * @param {number} inputIndex
 */
function setUserDataValue(inputIndex) {
  const contacts = flattenContactBlockToArray() || [];
  const contact = contacts[inputIndex];
  remindIndex = inputIndex;
  updateEditContactInitials(contact);
  updateEditContactFields(contact);
}

/**
 * @param {{username:string,color?:string}} contact
 */
function updateEditContactInitials(contact) {
  const initials = getInitials(contact.username);
  const color = contact.color;
  const initialsRef = document.getElementById("edit-contact-initialsID");
  if (!initialsRef) return;
  initialsRef.innerHTML = initials;
  initialsRef.className = "";
  initialsRef.classList.add("user-letter-ball-edit-contact");
  if (color) initialsRef.classList.add(color);
}

/**
 * @param {{username:string,email?:string,PhoneNumber?:string}} contact
 */
function updateEditContactFields(contact) {
  const usernameInput = document.getElementById("edit-contact-usernameID");
  const mailInput = document.getElementById("edit-contact-mailID");
  const phoneInput = document.getElementById("edit-contact-phone-numberID");
  if (!usernameInput || !mailInput || !phoneInput) return;
  usernameInput.value = contact.username || "";
  mailInput.value = contact.email || "";
  phoneInput.value = contact.PhoneNumber || "";
}

/**
 * @param {any[]} contacts
 * @returns {any|null}
 */
function getSelectedContact(contacts) {
  if (remindIndex === null || !contacts[remindIndex]) {
    showContactToast("No contact selected to edit", { variant: "error" });
    return null;
  }
  return contacts[remindIndex];
}

/**
 * @returns {{username:string,email:string,phoneNumber:string}}
 */
function getEditFormValues() {
  const username =
    document.getElementById("edit-contact-usernameID").value.trim();
  const email =
    document.getElementById("edit-contact-mailID").value.trim();
  const phoneNumber =
    document.getElementById("edit-contact-phone-numberID").value.trim();
  return { username, email, phoneNumber };
}

/**
 * @param {{username:string,email:string,phoneNumber:string}} values
 * @returns {boolean}
 */
function validateEditValues(values) {
  return (
    validateNameValue(values.username) &&
    validateEmailValue(values.email) &&
    validatePhoneValue(values.phoneNumber)
  );
}

/**
 * @param {string} username
 * @returns {boolean}
 */
function validateNameValue(username) {
  if (isValidName(username)) return true;
  showContactToast(
    "Please enter a valid name containing letters and no numbers",
    { variant: "error" }
  );
  return false;
}

/**
 * @param {string} email
 * @returns {boolean}
 */
function validateEmailValue(email) {
  if (isValidEmail(email)) return true;
  showContactToast("Please enter a valid email address!", {
    variant: "error",
  });
  return false;
}

/**
 * @param {string} phoneNumber
 * @returns {boolean}
 */
function validatePhoneValue(phoneNumber) {
  if (isValidPhoneNumber(phoneNumber)) return true;
  showContactToast(
    "Phone number must start with +49 or 0 and contain only numbers",
    { variant: "error" }
  );
  return false;
}

/**
 * @param {any} contact
 * @param {{username:string,email:string,phoneNumber:string}} values
 * @returns {any}
 */
function buildUpdatedContact(contact, values) {
  return {
    ...contact,
    username: values.username,
    email: values.email,
    PhoneNumber: values.phoneNumber,
  };
}

/**
 * @param {any[]} contacts
 * @param {string} username
 * @returns {Promise<void>}
 */
async function saveContactsAndRefresh(contacts, username) {
  sortUserToAlphabeticalOrder(contacts);
  await persistContacts(contacts);
  renderSingleContact(username);
  renderContactList();
  closeWhiteScreen();
  showContactToast("Contact successfully saved");
}

/**
 * Saves edited contact data.
 * @returns {Promise<boolean>}
 */
async function editContact() {
  const contacts = flattenContactBlockToArray() || [];
  const contact = getSelectedContact(contacts);
  if (!contact) return false;
  const values = getEditFormValues();
  if (!validateEditValues(values)) return false;
  const updated = buildUpdatedContact(contact, values);
  contacts[remindIndex] = updated;
  await saveContactsAndRefresh(contacts, updated.username);
  return true;
}

/**
 * Deletes the currently selected contact.
 * @returns {Promise<void>}
 */
async function deleteContactinEditContactWindow() {
  let contacts = flattenContactBlockToArray() || [];
  contacts.splice(remindIndex, 1);
  await persistContacts(contacts);
  hideEditContactFormular();
  closeWhiteScreen();
  renderContactList();
}
