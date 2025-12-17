/**
 * @param {string} usernameOrId - Username or unique identifier of the contact to delete.
 * @returns {Promise<void>}
 */
async function deleteContact(usernameOrId) {
  let contacts = flattenContactBlockToArray() || [];
  const rightIndex = findIndexFromUsername(contacts, usernameOrId);
  contacts.splice(rightIndex, 1);
  await persistContacts(contacts);
  let showContact = document.getElementById("singleContactID");
  showContact.innerHTML = "";
  renderContactList();
}

/**
 * @returns {Promise<void>}
 */
async function deleteContactInEditContactWindow() {
  let contacts = flattenContactBlockToArray() || [];
  let usernameOrId = document.getElementById("edit-contact-usernameID").value;
  let showContact = document.getElementById("singleContactID");
  const rightIndex = findIndexFromUsername(contacts, usernameOrId);
  contacts.splice(rightIndex, 1);
  await persistContacts(contacts);
  showContact.innerHTML = "";
  hideEditContactFormular();
  renderContactList();
}
