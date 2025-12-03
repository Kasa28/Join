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

function getMenuWrapper() {
  return document.querySelector(".contact-actions-mobile");
}

function getToggle() {
  return document.getElementById("contact-menu-toggle");
}

function hideMenu() {
  const toggle = getToggle();
  if (!toggle) return;
  toggle.checked = false;
}

function showMenu() {
  const menuWrapper = getMenuWrapper();
  const toggle = getToggle();
  if (!toggle) return;
  if (menuWrapper && menuWrapper.style.display === "none") {
    menuWrapper.style.display = "";
  }
  toggle.checked = false;
}

function overlayVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  if (style.display === "none") return false;
  if (style.visibility === "hidden") return false;
  if (el.classList.contains("d-none")) return false;
  return true;
}

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

function getCurrentContactName() {
  const m = document.querySelector("#singleContactContent h2");
  if (m && m.textContent.trim()) return m.textContent.trim();
  const d = document.querySelector("#singleContactID h2");
  if (d) return d.textContent.trim();
  return null;
}

function getContactsFromStorage() {
  const data = JSON.parse(localStorage.getItem("userData")) || {};
  if (!Array.isArray(data.friends)) return [];
  return data.friends;
}

function findContactIndex(contacts, name) {
  const target = name.trim().toLowerCase();
  return contacts.findIndex(function (c) {
    const user = (c.username || "").trim().toLowerCase();
    return user === target;
  });
}

function handleEditContact(idx, contacts, event) {
  if (typeof setUserDataValue === "function") setUserDataValue(idx);
  if (typeof showEditContactFormular === "function") showEditContactFormular();
  if (typeof callWhiteScreen === "function") callWhiteScreen();
  hideMenu();
  if (event) event.preventDefault();
}

function handleDeleteContact(idx, contacts, event) {
  const username = contacts[idx].username;
  if (typeof deleteContact === "function") deleteContact(username);
  hideMenu();
  if (event) event.preventDefault();
}

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

window.onload = initContactsPage;
