// === Toast (GLOBAL) ===
function showToast(text, { variant = "ok", duration = 1000 } = {}) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  const el = document.createElement("div");
  el.className =
    "toast toast--show" + (variant === "error" ? " toast--error" : "");
  el.innerHTML = `<span>${text}</span><span class="toast-icon" aria-hidden="true"></span>`;
  root.appendChild(el);

  setTimeout(() => {
    el.classList.remove("toast--show");
    el.classList.add("toast--hide");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }, duration);
}

document.addEventListener("DOMContentLoaded", function () {
  /* =========================================
     1) Kontakt-Detail: Desktop vs. Mobile
     ========================================= */

  const legacy = document.getElementById("singleContactID");
  const content = document.getElementById("singleContactContent");

  if (legacy && content) {
    function syncFromLegacy() {
      if (window.innerWidth <= 1000) {
        content.innerHTML = legacy.innerHTML;
      }
    }

    function applyContactLayout() {
      if (window.innerWidth <= 1000) {
        legacy.style.display = "none";
        content.style.display = "";
        syncFromLegacy();
      } else {
        legacy.style.display = "";
        content.style.display = "none";
      }
    }

    const contactObserver = new MutationObserver(syncFromLegacy);
    contactObserver.observe(legacy, { childList: true, subtree: true });

    window.addEventListener("resize", applyContactLayout);
    applyContactLayout();
  }

  /* =========================================
     2) 3-Punkte-Menü im Kontakt-Detail (mobile FAB Menü)
     ========================================= */

  function getMenuWrapper() {
    return document.querySelector(".contact-actions-mobile");
  }

  function getToggle() {
    return document.getElementById("contact-menu-toggle");
  }

  function hideMenu() {
    const toggle = getToggle();
    if (!toggle) return;
    // Nur Menü zuklappen (Checkbox), Wrapper bleibt sichtbar
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

  document.addEventListener("click", function (event) {
    const menuWrapper = getMenuWrapper();
    const toggle = getToggle();
    if (!menuWrapper || !toggle) return;

    const target = event.target;

    // Klick außerhalb des Menüs → einklappen
    if (!menuWrapper.contains(target)) {
      toggle.checked = false;
    }

    // Klick auf Menü-Eintrag (Edit/Delete) → Menü einklappen
    const fabItem = target.closest(".contact-actions-mobile .contact-fab-item");
    if (fabItem) {
      hideMenu();
    }

    // Wenn Edit-Overlay geschlossen wurde → Menü-Wrapper wieder normal
    const closeOrSaveBtn = target.closest(
      ".close-icon-edit-contact, .button-edit-contact, #white-screen"
    );
    if (closeOrSaveBtn) {
      setTimeout(showMenu, 0);
    }
  });

  /* =========================================
     3) Blauer +-Button (Add-FAB) & Add/Edit Overlays
     ========================================= */

  const addFab = document.querySelector(".button-contacts-position"); // blauer +
  const addOverlay = document.querySelector(".add-contact");
  const editOverlay = document.querySelector(".edit-contact");
  let overlayObserver;

  function overlayVisible(el) {
    if (!el) return false;
    const st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;
    if (el.classList.contains("d-none")) return false;
    if (el.classList.contains("hide-add-contact")) return false;
    if (el.classList.contains("hide-edit-contact")) return false;
    return true;
  }

  function anyOverlayOpen() {
    return overlayVisible(addOverlay) || overlayVisible(editOverlay);
  }

  function syncAddFab() {
    if (!addFab) return;

    if (window.innerWidth > 1000) {
      // Desktop: FAB immer sichtbar
      addFab.style.display = "";
      return;
    }

    // Mobile: nur, wenn kein Overlay offen ist
    addFab.style.display = anyOverlayOpen() ? "none" : "";
  }

  // Mobile: Add-Overlay initial verstecken
  if (window.innerWidth <= 1000 && addOverlay) {
    addOverlay.classList.add("d-none");
  }

  // Klick auf blauen +-Button → Add-Overlay öffnen (mobile)
  if (addFab && addOverlay) {
    addFab.addEventListener("click", function () {
      if (window.innerWidth <= 1000) {
        addOverlay.classList.remove("d-none");
        addOverlay.style.display = "";
        syncAddFab();
      }
    });
  }

  function initOverlayObserver() {
    if (overlayObserver) overlayObserver.disconnect();
    const targets = [addOverlay, editOverlay].filter(Boolean);
    if (!targets.length) return;

    overlayObserver = new MutationObserver(syncAddFab);
    targets.forEach((el) =>
      overlayObserver.observe(el, {
        attributes: true,
        attributeFilter: ["class", "style"],
      })
    );
  }

  syncAddFab();
  initOverlayObserver();
  window.addEventListener("resize", syncAddFab);

  /* =========================================
     4) Mobile FAB-Menu → richtigen Kontakt finden
     ========================================= */

  function getCurrentContactName() {
    const hMobile = document.querySelector("#singleContactContent h2");
    if (hMobile && hMobile.textContent.trim()) {
      return hMobile.textContent.trim();
    }
    const hDesktop = document.querySelector("#singleContactID h2");
    if (hDesktop) {
      return hDesktop.textContent.trim();
    }
    return null;
  }

  document.addEventListener("click", function (event) {
    const item = event.target.closest(".contact-fab-item");
    if (!item) return;

    const label = item.textContent.toLowerCase();
    const isEdit = label.includes("edit");
    const isDelete = label.includes("delete");
    if (!isEdit && !isDelete) return;

    const data = JSON.parse(localStorage.getItem("userData")) || {};
    const contacts = Array.isArray(data.friends) ? data.friends : [];
    if (!contacts.length) return;

    const displayedName = getCurrentContactName();
    if (!displayedName) return;

    const targetName = displayedName.trim().toLowerCase();
    const idx = contacts.findIndex(
      (c) => (c.username || "").trim().toLowerCase() === targetName
    );
    if (idx === -1) return;

    if (isEdit) {
      if (typeof setUserDataValue === "function") {
        setUserDataValue(idx);
      }
      if (typeof showEditContactFormular === "function") {
        showEditContactFormular();
      }
      if (typeof callWhiteScreen === "function") {
        callWhiteScreen();
      }
      hideMenu();
      event.preventDefault();
      return;
    }

    if (isDelete) {
      const username = contacts[idx].username;
      if (typeof deleteContact === "function") {
        deleteContact(username);
      }
      hideMenu();
      event.preventDefault();
    }
  });
});

/* =========================================
   5) Sicheres Löschen überschreibt globale
      deleteContact-Funktionen
   ========================================= */

// Kontakt per Name in localStorage finden
function findContactByName(rawName) {
  const data = JSON.parse(localStorage.getItem("userData")) || {};
  const contacts = Array.isArray(data.friends) ? data.friends : [];

  const needle = String(rawName || "").trim().toLowerCase();
  const index = contacts.findIndex(
    (c) => (c.username || "").trim().toLowerCase() === needle
  );

  return { data, contacts, index };
}

// Zentrale Delete-Funktion: löscht genau EINEN Kontakt
async function safeDeleteContact(nameFromClick) {
  const { data, contacts, index } = findContactByName(nameFromClick);

  if (index === -1) {
    console.warn("safeDeleteContact: Kontakt nicht gefunden:", nameFromClick);
    return;
  }

  contacts.splice(index, 1);
  data.friends = contacts;
  localStorage.setItem("userData", JSON.stringify(data));

  const userID = await getUserID(data.name);
  if (userID) {
    await updateUserFriendslist(userID, contacts);
  }

  const showContact = document.getElementById("singleContactID");
  if (showContact) showContact.innerHTML = "";

  if (typeof hideEditContactFormular === "function") {
    hideEditContactFormular();
  }

  // Auswahl zurücksetzen → kein Fehler in makeContactBlue
  if (typeof remindString !== "undefined") {
    remindString = null;
  }

  renderContactList();
}

// Delete über Edit-Overlay (nimmt aktuellen Namen aus dem Formular)
async function safeDeleteContactFromEdit() {
  const input = document.getElementById("edit-contact-usernameID");
  const nameFromForm = input ? input.value : "";
  await safeDeleteContact(nameFromForm);
}

window.addEventListener("load", function () {
  // Delete-Funktionen global überschreiben
  window.deleteContact = safeDeleteContact;
  window.deleteContactinEditContactWindow = safeDeleteContactFromEdit;

  // makeContactBlue robust machen
  window.makeContactBlue = safeMakeContactBlue;

  // Falls es eine alte renderSingleContact gibt → merken (falls du sie noch brauchst)
  if (typeof window.renderSingleContact === "function") {
    window._renderSingleContactOriginal = window.renderSingleContact;
  }

  // Unsere eigene, sichere Variante überschreibt alles andere
  window.renderSingleContact = safeRenderSingleContact;
});



// =========================================
// 6) Robuste Version von makeContactBlue
//    (verhindert Fehler, wenn alter Kontakt
//    im DOM nicht mehr existiert)
// =========================================
function safeMakeContactBlue(inputName) {
  const prevName = typeof remindString === "string" ? remindString : null;

  // Alte Auswahl zurücksetzen – aber nur, wenn die Elemente noch existieren
  if (prevName) {
    const prevCard = document.getElementById(prevName + "-contactID");
    const prevMail = document.getElementById(prevName + "-emailID");

    if (prevCard) {
      prevCard.classList.add("single-contact-hover");
      prevCard.classList.remove("backgroundcolor-blue");
    }
    if (prevMail) {
      prevMail.classList.remove("font-color-white");
    }
  }

  // Neue Auswahl einfärben – auch hier defensiv prüfen
  const card = document.getElementById(inputName + "-contactID");
  const mail = document.getElementById(inputName + "-emailID");

  if (card) {
    card.classList.remove("single-contact-hover");
    card.classList.add("backgroundcolor-blue");
  }
  if (mail) {
    mail.classList.add("font-color-white");
  }

  // Merken, welcher Kontakt aktuell aktiv ist
  remindString = inputName;
}
// =========================================
// 7) Eigene Version von renderSingleContact
//    (ohne kaputte Toggle-Logik mit remindString)
// =========================================
function safeRenderSingleContact(inputName) {
  // Daten aus localStorage holen
  const data = JSON.parse(localStorage.getItem("userData")) || {};
  const contacts = Array.isArray(data.friends) ? data.friends : [];

  if (!contacts.length) {
    console.warn("safeRenderSingleContact: keine Kontakte gefunden");
    return;
  }

  // richtigen Kontakt suchen
  const idx = findIndexFromUsername(contacts, inputName);
  if (idx === -1) {
    console.warn("safeRenderSingleContact: Kontakt nicht gefunden:", inputName);
    return;
  }

  const contact = contacts[idx];

  if (typeof singleContactTemplate === "function") {
    singleContactTemplate(
      contact.color,
      contact.username,
      idx,
      contact.email,
      contact.PhoneNumber
    );
  }
  if (typeof makeContactBlue === "function") {
    makeContactBlue(contact.username);
  }
}

