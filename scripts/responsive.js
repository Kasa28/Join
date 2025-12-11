/**
 * @typedef {Object} ToastOptions
 * @property {"ok"|"error"} [variant="ok"]
 * @property {number} [duration=1000]
 */

/**
 * Shows a toast message.
 *
 * @param {string} text
 * @param {ToastOptions} [options]
 * @returns {void}
 */
function showToast(text, { variant = "ok", duration = 2000 } = {}) {
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

  setTimeout(function () {
    el.classList.remove("toast--show");
    el.classList.add("toast--hide");
    el.addEventListener(
      "animationend",
      function () {
        el.remove();
      },
      { once: true }
    );
  }, duration);
}

document.addEventListener("DOMContentLoaded", function () {
  const detail = document.getElementById("singleContactID");    
  const wrapper = document.getElementById("singleContactWrapper"); 
  const maincontent = document.querySelector(".maincontent");      

  if (!detail || !wrapper || !maincontent) {
    return;
  }

  /**
   * Checks if we are in mobile layout.
   * @returns {boolean}
   */
  function isMobile() {
    return window.innerWidth <= 1100;
  }

  /**
   * Updates the layout:
   * - Mobile + detail has content -> show detail, hide list
   * - Mobile + no detail -> show list, hide detail
   * - Desktop -> both controlled via CSS
   * @returns {void}
   */
  function updateMobileLayout() {
    const hasDetail = detail.innerHTML.trim() !== "";

    if (isMobile() && hasDetail) {
      wrapper.style.display = "block";
      maincontent.style.display = "none";
    } else if (isMobile() && !hasDetail) {
      wrapper.style.display = "none";
      maincontent.style.display = "block";
    } else {
      wrapper.style.display = "";
      maincontent.style.display = "";
    }
  }

  /**
   * Called from the back arrow.
   * - clears the detail view
   * - resets the current highlight using toggleContactHighlight
   * - removes focus
   * - switches layout back to the list
   * @returns {void}
   */
  function closeContactOverlay() {
    if (!isMobile()) return;
    detail.innerHTML = "";
    if (
      typeof toggleContactHighlight === "function" &&
      typeof currentlySelectedContact === "string" &&
      currentlySelectedContact
    ) {
      toggleContactHighlight(currentlySelectedContact);
    }

    const active = document.activeElement;
    if (active && active.closest("#contactContainerID")) {
      active.blur();
    }
    updateMobileLayout();
  }

  window.closeContactOverlay = closeContactOverlay;
  const observer = new MutationObserver(updateMobileLayout);
  observer.observe(detail, { childList: true, subtree: true });

  window.addEventListener("resize", updateMobileLayout);
  updateMobileLayout();

  /**
   * Returns the FAB menu element.
   * @returns {HTMLElement|null}
   */
  function getMenuElement() {
    return document.querySelector(".contact-fab-menu");
  }

  /**
   * Returns the checkbox toggle for the FAB menu.
   * @returns {HTMLInputElement|null}
   */
  function getMenuToggle() {
    return /** @type {HTMLInputElement|null} */ (
      document.getElementById("contact-menu-toggle")
    );
  }

  /**
   * Hides the FAB menu (unchecks the toggle).
   * @returns {void}
   */
  function hideMenu() {
    const toggle = getMenuToggle();
    if (!toggle) return;
    toggle.checked = false;
  }

  document.addEventListener("click", function (event) {
    const menu = getMenuElement();
    const toggle = getMenuToggle();
    if (!menu || !toggle) return;

    const target = /** @type {HTMLElement} */ (event.target);
    const clickedInsideMenu = menu.contains(target);
    const clickedFabButton = target.closest(".contact-fab");
    const clickedFabItem = target.closest(".contact-fab-item");
    if (clickedFabItem) {
      hideMenu();
      return;
    }
    if (
      toggle.checked &&
      !clickedInsideMenu &&
      !clickedFabButton &&
      target !== toggle
    ) {
      hideMenu();
    }
  });
});
