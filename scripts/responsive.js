/**
 * @typedef {Object} ToastOptions
 * @property {"ok"|"error"} [variant="ok"]
 * @property {number} [duration=1000]
 */

/**
 * Shows a toast message in the UI.
 * Creates #toast-root lazily if missing and auto-removes toast after duration.
 *
 * @param {string} text
 * @param {ToastOptions} [options]
 * @returns {void}
 */
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

  const legacy = document.getElementById("singleContactID");
  const content = document.getElementById("singleContactContent");

  if (legacy && content) {
       /**
     * Syncs mobile contact container from legacy desktop container.
     * @returns {void}
     */
    function syncFromLegacy() {
      if (window.innerWidth <= 1000) {
        content.innerHTML = legacy.innerHTML;
      }
    }
 /**
     * Applies responsive layout rules for contact detail containers.
     * @returns {void}
     */
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
  /**
   * Returns the mobile menu wrapper element.
   * @returns {Element|null}
   */
  function getMenuWrapper() {
    return document.querySelector(".contact-actions-mobile");
  }
  /**
   * Returns the checkbox toggle element for the contact menu.
   * @returns {HTMLInputElement|null}
   */
  function getToggle() {
    return document.getElementById("contact-menu-toggle");
  }
  /**
   * Hides the mobile contact menu by unchecking its toggle.
   * @returns {void}
   */
  function hideMenu() {
    const toggle = getToggle();
    if (!toggle) return;
    toggle.checked = false;
  }
  /**
   * Ensures the mobile contact menu can be shown and resets toggle state.
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
   * Global click handler for closing menu or reacting to FAB actions.
   * @param {MouseEvent} event
   * @returns {void}
   */
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

  const addFab = document.querySelector(".button-contacts-position"); 
  const addOverlay = document.querySelector(".add-contact");
  const editOverlay = document.querySelector(".edit-contact");
  let overlayObserver;
  /**
   * Checks whether a given overlay element is currently visible.
   * @param {Element|null} el
   * @returns {boolean}
   */
  function overlayVisible(el) {
    if (!el) return false;
    const st = window.getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") return false;
    if (el.classList.contains("d-none")) return false;
    if (el.classList.contains("hide-add-contact")) return false;
    if (el.classList.contains("hide-edit-contact")) return false;
    return true;
  }
  /**
   * Returns whether any contact overlay is open.
   * @returns {boolean}
   */
  function anyOverlayOpen() {
    return overlayVisible(addOverlay) || overlayVisible(editOverlay);
  }
  /**
   * Syncs Add-FAB visibility and body scroll lock to overlay + viewport state.
   * @returns {void}
   */
  function syncAddFab() {
    if (addFab) {
      if (window.innerWidth > 1000) {
        addFab.style.display = "";
      } else {
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
  /**
   * Observes overlay class/style changes to keep FAB and scroll state in sync.
   * @returns {void}
   */
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
  /**
   * Placeholder for future contact-name resolution.
   * @returns {void}
   */
  function getCurrentContactName() {
  }

  document.addEventListener("click", function (event) {
}); 

  /**
   * Gets the currently displayed contact name from mobile or desktop detail view.
   * @returns {string|null}
   */
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
  /**
   * Handles FAB action clicks (edit/delete) for the currently displayed contact.
   * @param {MouseEvent} event
   * @returns {void}
   */
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
