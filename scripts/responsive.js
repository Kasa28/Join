/**
 * Shows a toast message on the page.
 * Creates the #toast-root container if it does not exist.
 *
 * @param {string} text - Text to show in the toast.
 * @param {"ok"|"error"} [variant="ok"] - Visual variant of the toast.
 * @param {number} [duration=1000] - Time in ms until the toast is removed.
 * @returns {void}
 */
function showToast(text, variant = "ok", duration = 1000) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  const box = document.createElement("div");
  box.className = variant === "error" ?
    "toast toast--show toast--error" : "toast toast--show";
  box.innerHTML =
    "<span>" + text + "</span><span class=\"toast-icon\" aria-hidden=\"true\"></span>";
  root.appendChild(box);
  setTimeout(function () { box.remove(); }, duration);
}

/**
 * Updates the contact detail layout for desktop and mobile.
 * Copies content to the mobile container when viewport is small.
 *
 * @returns {void}
 */
function updateContactLayout() {
  const legacy = document.getElementById("singleContactID");
  const content = document.getElementById("singleContactContent");
  if (!legacy || !content) return;
  if (window.innerWidth <= 1000) {
    content.innerHTML = legacy.innerHTML;
    legacy.style.display = "none";
    content.style.display = "";
  } else {
    legacy.style.display = "";
    content.style.display = "none";
  }
}

/**
 * Returns the wrapper for the mobile contact actions menu.
 *
 * @returns {Element|null} The menu wrapper element or null.
 */
function getMenuWrapper() {
  return document.querySelector(".contact-actions-mobile");
}

/**
 * Returns the checkbox toggle for the contact menu.
 *
 * @returns {HTMLInputElement|null} The toggle input element or null.
 */
function getToggle() {
  return document.getElementById("contact-menu-toggle");
}

/**
 * Hides the mobile contact menu by unchecking its toggle.
 *
 * @returns {void}
 */
function hideMenu() {
  const toggle = getToggle();
  if (!toggle) return;
  toggle.checked = false;
}

/**
 * Shows the mobile contact menu and resets the toggle state.
 *
 * @returns {void}
 */
function showMenu() {
  const menuWrapper = getMenuWrapper();
  const toggle = getToggle();
  if (!toggle) return;
  if (menuWrapper && menuWrapper.style.display === "none") {
    menuWrapper.style.display = "";
  }
  toggle.checked = false;
}

/**
 * Checks if an overlay element is currently visible.
 *
 * @param {Element|null} el - Overlay element to check.
 * @returns {boolean} True if the overlay is visible, otherwise false.
 */
function overlayVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none") return false;
  if (style.visibility === "hidden") return false;
  if (el.classList.contains("d-none")) return false;
  return true;
}

/**
 * Syncs the Add-FAB visibility and body scroll state
 * based on open overlays and viewport width.
 *
 * @returns {void}
 */
function syncAddFab() {
  const addFab = document.querySelector(".button-contacts-position");
  const addOverlay = document.querySelector(".add-contact");
  const editOverlay = document.querySelector(".edit-contact");
  const open = overlayVisible(addOverlay) || overlayVisible(editOverlay);
  if (addFab) {
    if (window.innerWidth > 1000) addFab.style.display = "";
    else addFab.style.display = open ? "none" : "";
  }
  if (open) document.body.classList.add("no-scroll");
  else document.body.classList.remove("no-scroll");
}

/**
 * Reads the currently shown contact name from mobile or desktop view.
 *
 * @returns {string|null} The contact name or null if none found.
 */
function getCurrentContactName() {
  const m = document.querySelector("#singleContactContent h2");
  if (m && m.textContent.trim()) return m.textContent.trim();
  const d = document.querySelector("#singleContactID h2");
  if (d) return d.textContent.trim();
  return null;
}

/**
 * Loads the contacts array from localStorage (userData.friends).
 *
 * @returns {Object[]} Array of contact objects, or empty array.
 */
function getContactsFromStorage() {
  const data = JSON.parse(localStorage.getItem("userData")) || {};
  if (!Array.isArray(data.friends)) return [];
  return data.friends;
}

/**
 * Finds the index of a contact by its username.
 *
 * @param {Object[]} contacts - List of contact objects.
 * @param {string} name - Displayed contact name to match.
 * @returns {number} Index of the contact or -1 if not found.
 */
function findContactIndex(contacts, name) {
  const target = name.trim().toLowerCase();
  return contacts.findIndex(function (c) {
    const user = (c.username || "").trim().toLowerCase();
    return user === target;
  });
}

/**
 * Handles starting the edit flow for a contact.
 *
 * @param {number} idx - Index of the contact in the array.
 * @param {Object[]} contacts - List of contacts (unused but kept for clarity).
 * @param {MouseEvent} [event] - Original click event.
 * @returns {void}
 */
function handleEditContact(idx, contacts, event) {
  if (typeof setUserDataValue === "function") setUserDataValue(idx);
  if (typeof showEditContactFormular === "function") showEditContactFormular();
  if (typeof callWhiteScreen === "function") callWhiteScreen();
  hideMenu();
  if (event) event.preventDefault();
}

/**
 * Handles deleting a contact and closing the menu.
 *
 * @param {number} idx - Index of the contact in the array.
 * @param {Object[]} contacts - List of contacts.
 * @param {MouseEvent} [event] - Original click event.
 * @returns {void}
 */
function handleDeleteContact(idx, contacts, event) {
  const username = contacts[idx].username;
  if (typeof deleteContact === "function") deleteContact(username);
  hideMenu();
  if (event) event.preventDefault();
}

/**
 * Handles generic clicks that may close or reopen the mobile menu.
 *
 * @param {MouseEvent} event - Click event on the document.
 * @returns {void}
 */
function handleMenuClick(event) {
  const menuWrapper = getMenuWrapper();
  const toggle = getToggle();
  if (!menuWrapper || !toggle) return;
  const target = event.target;
  if (!menuWrapper.contains(target)) toggle.checked = false;
  const fabItem =
    target.closest(".contact-actions-mobile .contact-fab-item");
  if (fabItem) hideMenu();
  const closeBtn = target.closest(
    ".close-icon-edit-contact, .button-edit-contact, #white-screen"
  );
  if (closeBtn) setTimeout(showMenu, 0);
}

/**
 * Handles FAB actions (edit/delete) for the current contact.
 *
 * @param {MouseEvent} event - Click event on the document.
 * @returns {void}
 */
function handleFabAction(event) {
  const item = event.target.closest(".contact-fab-item");
  if (!item) return;
  const text = item.textContent.toLowerCase();
  const isEdit = text.includes("edit"), isDelete = text.includes("delete");
  if (!isEdit && !isDelete) return;
  const contacts = getContactsFromStorage();
  if (!contacts.length) return;
  const name = getCurrentContactName();
  if (!name) return;
  const idx = findContactIndex(contacts, name);
  if (idx === -1) return;
  if (isEdit) handleEditContact(idx, contacts, event);
  else handleDeleteContact(idx, contacts, event);
}

/**
 * Initializes the contact page:
 * sets layout, FAB behavior and global handlers.
 *
 * @returns {void}
 */
function initContactsPage() {
  updateContactLayout();
  syncAddFab();
  document.onclick = function (event) {
    handleMenuClick(event);
    handleFabAction(event);
    syncAddFab();
  };
  window.onresize = function () {
    updateContactLayout();
    syncAddFab();
  };
}

/**
 * Entry point for the contacts page.
 * Runs after the window has finished loading.
 */
window.onload = initContactsPage;
