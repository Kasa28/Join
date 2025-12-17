/**
 * @typedef {Object} ToastOptions
 * @property {"ok"|"error"} [variant="ok"]
 * @property {number} [duration=1000]
 */

/**
 * Shows a toast message.
 * @param {string} text - Message text.
 * @param {ToastOptions} [options] - Toast options.
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
  el.className = `toast toast--show${variant === "error" ? " toast--error" : ""}`;
  el.innerHTML = `<span>${text}</span><span class="toast-icon" aria-hidden="true"></span>`;
  root.appendChild(el);

  setTimeout(() => {
    el.classList.remove("toast--show");
    el.classList.add("toast--hide");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }, duration);
}

/**
 * DOMContentLoaded handler: wires mobile layout + FAB menu close behavior.
 * @returns {void}
 */
function onContactsDomReady() {
  const detail = document.getElementById("singleContactID");
  const wrapper = document.getElementById("singleContactWrapper");
  const maincontent = document.querySelector(".maincontent");
  if (!detail || !wrapper || !maincontent) return;

  /**
   * Checks if we are in mobile layout.
   * @returns {boolean}
   */
  function isMobile() {
    return window.innerWidth <= 1100;
  }

  /**
   * Updates the layout depending on mobile/desktop + whether detail has content.
   * @returns {void}
   */
  function updateMobileLayout() {
    const hasDetail = detail.innerHTML.trim() !== "";
    if (isMobile()) {
      wrapper.style.display = hasDetail ? "block" : "none";
      maincontent.style.display = hasDetail ? "none" : "block";
      return;
    }
    wrapper.style.display = "";
    maincontent.style.display = "";
  }

  /**
   * Called from the back arrow:
   * clears detail, resets highlight, removes focus, updates layout.
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
    if (active && active.closest("#contactContainerID")) active.blur();
    updateMobileLayout();
  }

  window.closeContactOverlay = closeContactOverlay;

  /**
   * MutationObserver callback to re-evaluate layout when detail content changes.
   * @param {MutationRecord[]} _mutations
   * @param {MutationObserver} _observer
   * @returns {void}
   */
  function onDetailMutate(_mutations, _observer) {
    updateMobileLayout();
  }

  const observer = new MutationObserver(onDetailMutate);
  observer.observe(detail, { childList: true, subtree: true });

  /**
   * Window resize handler to re-evaluate layout.
   * @param {UIEvent} _event
   * @returns {void}
   */
  function onResize(_event) {
    updateMobileLayout();
  }

  window.addEventListener("resize", onResize);
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
    if (toggle) toggle.checked = false;
  }

  /**
   * Document click handler to close FAB menu.
   * @param {MouseEvent} event
   * @returns {void}
   */
  function onDocClick(event) {
    const menu = getMenuElement();
    const toggle = getMenuToggle();
    if (!menu || !toggle) return;

    const target = /** @type {HTMLElement} */ (event.target);
    const clickedInsideMenu = menu.contains(target);
    const clickedFabButton = target.closest(".contact-fab");
    const clickedFabItem = target.closest(".contact-fab-item");

    if (clickedFabItem) return hideMenu();
    if (toggle.checked && !clickedInsideMenu && !clickedFabButton && target !== toggle) hideMenu();
  }

  document.addEventListener("click", onDocClick);
}

document.addEventListener("DOMContentLoaded", onContactsDomReady);
