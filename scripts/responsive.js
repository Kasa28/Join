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
    // Inhalte von legacy -> content kopieren (nur für Mobile)
    function syncFromLegacy() {
      if (window.innerWidth <= 1000) {
        content.innerHTML = legacy.innerHTML;
      }
    }

    // Layout je nach Breite umschalten
    function applyContactLayout() {
      if (window.innerWidth <= 1000) {
        // MOBILE: nur singleContactContent anzeigen
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
    // Nur das Menü zuklappen, den Wrapper NICHT verstecken
    toggle.checked = false;
  }

  function showMenu() {
    const menuWrapper = getMenuWrapper();
    const toggle = getToggle();
    if (!toggle) return;

    // Sicherheitshalber Wrapper wieder sichtbar machen
    if (menuWrapper.style.display === "none") {
      menuWrapper.style.display = "";
    }
    // Menü standardmäßig zu
    toggle.checked = false;
  }

  // Klicks allgemein (außerhalb Menü schließen usw.)
  document.addEventListener("click", function (event) {
    const menuWrapper = getMenuWrapper();
    const toggle = getToggle();
    if (!menuWrapper || !toggle) return;

    const target = event.target;

    // Klick außerhalb des 3-Punkte-Menüs → Menü schließen
    if (!menuWrapper.contains(target)) {
      toggle.checked = false;
    }

    // Klick auf Menü-Eintrag (Edit/Delete) → Menü schließen
    const fabItem = target.closest(".contact-actions-mobile .contact-fab-item");
    if (fabItem) {
      hideMenu();
    }

    // Wenn Edit-Overlay geschlossen wurde → Menü wieder zeigen
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

  // Ist ein Overlay wirklich sichtbar?
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

  // Steuert Sichtbarkeit des blauen +-Buttons
  function syncAddFab() {
    if (!addFab) return;

    // Desktop: FAB immer sichtbar
    if (window.innerWidth > 1000) {
      addFab.style.display = "";
      return;
    }

    // Mobile: FAB nur anzeigen, wenn KEIN Overlay offen ist
    addFab.style.display = anyOverlayOpen() ? "none" : "";
  }

  // Mobile: Add-Overlay initial verstecken
  if (window.innerWidth <= 1000 && addOverlay) {
    addOverlay.classList.add("d-none");
  }

  // Klick auf blauen +-Button → Add-Overlay öffnen (auf Mobile)
  if (addFab && addOverlay) {
    addFab.addEventListener("click", function () {
      if (window.innerWidth <= 1000) {
        addOverlay.classList.remove("d-none");
        addOverlay.style.display = "";
        syncAddFab(); // FAB ausblenden
      }
    });
  }

  // Änderungen an Overlays beobachten
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

  // Initial ausführen
  syncAddFab();
  initOverlayObserver();
  window.addEventListener("resize", syncAddFab);

  /* =========================================
     4) NEU: Mobile FAB-Menu → richtigen Kontakt
        für Edit/Delete ermitteln
     ========================================= */

  // Hilfsfunktion: aktuell angezeigter Name im Detail
  function getCurrentContactName() {
    // Mobile-Spiegel (content) hat Vorrang
    const hMobile = document.querySelector("#singleContactContent h2");
    if (hMobile && hMobile.textContent.trim()) {
      return hMobile.textContent.trim();
    }
    // Fallback: normales Detail
    const hDesktop = document.querySelector("#singleContactID h2");
    if (hDesktop) {
      return hDesktop.textContent.trim();
    }
    return null;
  }

  document.addEventListener("click", function (event) {
    const item = event.target.closest(".contact-fab-item");
    if (!item) return; // kein Menü-Eintrag

    const label = item.textContent.toLowerCase();
    const isEdit = label.includes("edit");
    const isDelete = label.includes("delete");
    if (!isEdit && !isDelete) return;

    // Kontakte aus LocalStorage holen
    const data = JSON.parse(localStorage.getItem("userData")) || {};
    const contacts = Array.isArray(data.friends) ? data.friends : [];
    if (!contacts.length) return;

    // Namen aus dem sichtbaren Detail holen
    const displayedName = getCurrentContactName();
    if (!displayedName) return;

    const targetName = displayedName.trim().toLowerCase();
    const idx = contacts.findIndex(
      (c) => (c.username || "").trim().toLowerCase() === targetName
    );
    if (idx === -1) return;

    if (isEdit) {
      // RICHTIGEN Kontakt ins Edit-Formular schreiben
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
        deleteContact(username); // async Funktion, läuft im Hintergrund
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

  // Hilfsfunktion: Kontakt per Name aus LocalStorage holen
  function findContactByName(rawName) {
    const data = JSON.parse(localStorage.getItem("userData")) || {};
    const contacts = Array.isArray(data.friends) ? data.friends : [];

    const needle = String(rawName || "").trim().toLowerCase();
    const index = contacts.findIndex(
      (c) => (c.username || "").trim().toLowerCase() === needle
    );

    return { data, contacts, index };
  }

  // Neue, „sichere“ Delete-Funktion (für Detail-Delete + Mobile-FAB-Delete)
  async function safeDeleteContact(nameFromClick) {
    const { data, contacts, index } = findContactByName(nameFromClick);

    if (index === -1) {
      console.warn("safeDeleteContact: Kontakt nicht gefunden:", nameFromClick);
      return;
    }

    // genau EINEN Kontakt entfernen
    contacts.splice(index, 1);
    data.friends = contacts;
    localStorage.setItem("userData", JSON.stringify(data));

    const userID = await getUserID(data.name);
    if (userID) {
      await updateUserFriendslist(userID, contacts);
    }

    // Detailbereich leeren
    const showContact = document.getElementById("singleContactID");
    if (showContact) showContact.innerHTML = "";

    // Edit-Overlay schließen, falls offen
    if (typeof hideEditContactFormular === "function") {
      hideEditContactFormular();
    }

    // Auswahl zurücksetzen → kein makeContactBlue-Fehler
    if (typeof remindString !== "undefined") {
      remindString = null;
    }

    // Liste neu zeichnen
    renderContactList();
  }

  // Delete aus dem Edit-Overlay (nutzt den Namen aus dem Formular)
  async function safeDeleteContactFromEdit() {
    const input = document.getElementById("edit-contact-usernameID");
    const nameFromForm = input ? input.value : "";
    await safeDeleteContact(nameFromForm);
  }

  // Wenn alle anderen Scripts geladen sind, globale Funktionen ersetzen
  window.addEventListener("load", function () {
    // überschreibt die alten Implementierungen überall (Detail, FAB, etc.)
    window.deleteContact = safeDeleteContact;
    window.deleteContactinEditContactWindow = safeDeleteContactFromEdit;
  });
