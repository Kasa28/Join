/** @type {number|null} Index of the contact currently being edited (null = none selected). */
let remindIndex = null;

/**
 * Opens the Edit Contact form by removing the hidden class.
 * @returns {void}
 */
function showEditContactFormular() {
  document
    .getElementById("edit-contactID")
    .classList.remove("hide-edit-contact");
}

/**
 * Validates a person's name (min length + allowed characters).
 * @param {string} name - Name input value.
 * @returns {boolean} True if valid.
 */
function isValidName(name) {
  const trimmed = name.trim();
  return trimmed.length >= 2 && /^[\p{L}\p{M}\s'.-]+$/u.test(trimmed);
}

/**
 * Validates an email address.
 * @param {string} email - Email input value.
 * @returns {boolean} True if valid.
 */
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
  if (
    parts.length < 2 ||
    parts.some((p) => !p || p.startsWith("-") || p.endsWith("-"))
  )
    return false;
  const tld = parts[parts.length - 1];
  const mainDomain = parts[parts.length - 2];
  if (!/^[A-Za-z]{2,}$/.test(tld) || !/[A-Za-z]/.test(mainDomain)) return false;
  return true;
}

/**
 * Validates a German phone number (starts with +49 or 0, then digits).
 * @param {string} phone - Phone input value.
 * @returns {boolean} True if valid.
 */
function isValidPhoneNumber(phone) {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  return /^(\+49|0)[1-9]\d{6,14}$/.test(trimmed);
}

/**
 * Closes the Edit Contact form by adding the hidden class.
 * @returns {void}
 */
function hideEditContactFormular() {
  document
    .getElementById("edit-contactID")
    .classList.add("hide-edit-contact");
}

/**
 * Loads the selected contact's data into the Edit Contact form fields.
 * @param {number} inputIndex - Index in the flattened contacts array.
 * @returns {void}
 */
function setUserDataValue(inputIndex) {
  const contacts = flattenContactBlockToArray() || [];
  const contact = contacts[inputIndex];
  remindIndex = inputIndex;
  updateEditContactInitials(contact);
  updateEditContactFields(contact);
}

/**
 * Updates the avatar initials + color in the edit form.
 * @param {{username:string,color?:string}} contact - Contact data.
 * @returns {void}
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
 * Fills edit form inputs with contact data.
 * @param {{username:string,email?:string,PhoneNumber?:string}} contact - Contact data.
 * @returns {void}
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
 * Returns the currently selected contact for editing (or null if none selected).
 * @param {any[]} contacts - Flat contacts array.
 * @returns {any|null} The selected contact or null.
 */
function getSelectedContact(contacts) {
  if (remindIndex === null || !contacts[remindIndex]) {
    showContactToast("No contact selected to edit", { variant: "error" });
    return null;
  }
  return contacts[remindIndex];
}

/**
 * Reads trimmed values from the edit form inputs.
 * @returns {{username:string,email:string,phoneNumber:string}} Collected form values.
 */
function getEditFormValues() {
  const username = document
    .getElementById("edit-contact-usernameID")
    .value.trim();
  const email = document.getElementById("edit-contact-mailID").value.trim();
  const phoneNumber = document
    .getElementById("edit-contact-phone-numberID")
    .value.trim();
  return { username, email, phoneNumber };
}

/**
 * Runs all edit-form validations.
 * @param {{username:string,email:string,phoneNumber:string}} values - Form values.
 * @returns {boolean} True if all values are valid.
 */
function validateEditValues(values) {
  return (
    validateNameValue(values.username) &&
    validateEmailValue(values.email) &&
    validatePhoneValue(values.phoneNumber)
  );
}

/**
 * Validates username and shows a toast on error.
 * @param {string} username - Username input.
 * @returns {boolean} True if valid.
 */
function validateNameValue(username) {
  if (isValidName(username)) return true;
  showContactToast("Please enter a valid name containing letters and no numbers", {
    variant: "error",
  });
  return false;
}

/**
 * Validates email and shows a toast on error.
 * @param {string} email - Email input.
 * @returns {boolean} True if valid.
 */
function validateEmailValue(email) {
  if (isValidEmail(email)) return true;
  showContactToast("Please enter a valid email address!", {
    variant: "error",
  });
  return false;
}

/**
 * Validates phone number and shows a toast on error.
 * @param {string} phoneNumber - Phone input.
 * @returns {boolean} True if valid.
 */
function validatePhoneValue(phoneNumber) {
  if (isValidPhoneNumber(phoneNumber)) return true;
  showContactToast("Phone number must start with +49 or 0 and contain only numbers", {
    variant: "error",
  });
  return false;
}

/**
 * Creates an updated contact object from the existing one + form values.
 * @param {any} contact - Existing contact object.
 * @param {{username:string,email:string,phoneNumber:string}} values - Form values.
 * @returns {any} Updated contact object.
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
 * Persists contacts, refreshes UI, closes overlay, and shows success toast.
 * @param {any[]} contacts - Contacts array to persist.
 * @param {string} username - Username to re-render in single view.
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
 * @returns {Promise<boolean>} True if saved successfully.
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
 * Deletes the currently selected contact from within the edit form.
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
