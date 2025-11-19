
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

    if (!menuWrapper.contains(target)) {
      toggle.checked = false;
    }

    const fabItem = target.closest(".contact-actions-mobile .contact-fab-item");
    if (fabItem) {
      hideMenu();
    }

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
    // FAB zeigen/verstecken
    if (addFab) {
      if (window.innerWidth > 1000) {
        // Desktop: FAB immer sichtbar
        addFab.style.display = "";
      } else {
        // Mobile: FAB nur wenn kein Overlay offen ist
        addFab.style.display = anyOverlayOpen() ? "none" : "";
      }
    }

    // Scroll-Lock für Body
    if (anyOverlayOpen()) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
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

  function getCurrentContactName() {
  }

  document.addEventListener("click", function (event) {
}); 


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
