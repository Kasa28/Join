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
    const menuWrapper = getMenuWrapper();
    const toggle = getToggle();
    if (!menuWrapper || !toggle) return;
    menuWrapper.style.display = "none";
    toggle.checked = false;
  }

  function showMenu() {
    const menuWrapper = getMenuWrapper();
    const toggle = getToggle();
    if (!menuWrapper || !toggle) return;
    menuWrapper.style.display = "";
    toggle.checked = false;
  }

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
        – Button soll verschwinden, wenn Overlay offen ist
        – und wiederkommen, wenn Overlay geschlossen wird
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

  // Änderungen an Overlays beobachten, damit der FAB automatisch
  // wieder erscheint, wenn z.B. closeAddContact/closeEditContact laufen
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
});
