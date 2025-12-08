let colors = ["red", "blue", "green", "brown", "purple", "turquoise", "orange", "black", "pink"];
let colorCode;

/**
 * Opens the Add Contact form by removing the hidden class.
 */
function showAddContactFormular() {
  document.getElementById("add-contactID").classList.remove("hide-add-contact");
}

/**
 * Closes the Add Contact form by adding the hidden class.
 */
function hideAddContactFormular() {
  document.getElementById("add-contactID").classList.add("hide-add-contact");
}

/**
 * Clears all input fields in the Add Contact form.
 */
function emptyTheAddContactFormular() {
  document.getElementById("add-contact-usernameID").value = "";
  document.getElementById("add-contact-mailID").value = "";
  document.getElementById("add-contact-phone-numberID").value = "";
}


function isValidName(name) {
  const trimmed = name.trim();
  return trimmed.length >= 2 && /^[\p{L}\p{M}\s'.-]+$/u.test(trimmed);
}

function isValidEmail(email) {
  return /^[A-Za-z0-9](\.?[A-Za-z0-9_\-+])*@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)+$/
    .test(email.trim());
}

function isValidPhoneNumber(phone) {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  return /^(\+49|0)[1-9]\d{6,14}$/.test(trimmed);
}

/**
 * Creates a new contact, validates input fields, assigns a random color,
 * stores the contact locally or via API depending on login status,
 * updates the UI, and shows success or error messages.
 */
async function addNewContact() {
  if (window.authReady) await window.authReady;
  let contacts = await loadContactsForActiveUser();

  const usernameRef = document
    .getElementById("add-contact-usernameID")
    .value
    .trim();
  const usermailRef = document
    .getElementById("add-contact-mailID")
    .value
    .trim();
  const phonenumberRef = document
    .getElementById("add-contact-phone-numberID")
    .value
    .trim();

  if (!isValidName(usernameRef)) {
    showContactToast(
      "Please enter a valid name containing letters and no numbers",
      { variant: "error" }
    );
    return false;
  }

  if (!isValidEmail(usermailRef)) {
    showContactToast("Please enter a valid email address!", {
      variant: "error",
    });
    return false;
  }

  if (!isValidPhoneNumber(phonenumberRef)) {
    showContactToast(
      "Phone number must start with +49 or 0 and contain only numbers",
      { variant: "error" }
    );
    return false;
  }

  colorCode = getRandomInt(colors.length);
  const contactJson = {
    username: usernameRef,
    email: usermailRef,
    PhoneNumber: phonenumberRef,
    color: colors[colorCode],
  };

  contacts.push(contactJson);
  sortUserToAlphabeticalOrder(contacts);
  await persistContacts(contacts);
  emptyTheAddContactFormular();
  hideAddContactFormular();
  renderContactList();
  showContactToast("Contact successfully created");
  return true;
}

/**
 * Handles the Add Contact button click and only closes overlays when the
 * contact was created successfully.
 */
async function handleAddContact() {
  const contactCreated = await addNewContact();
  if (contactCreated) {
    closeWhiteScreen();
  }
}
