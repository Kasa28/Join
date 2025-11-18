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
    // Inhalt von legacy -> content kopieren (für Mobile)
    function syncFromLegacy() {
      if (window.innerWidth <= 1000) {
        content.innerHTML = legacy.innerHTML;
      }
    }

    // Layout umschalten (Desktop vs. Mobile)
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
     2) 3-Punkte-Menü im Kontakt-Detail
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

    // Menü schließen, wenn man außerhalb klickt
    if (!menuWrapper.contains(target)) {
      toggle.checked = false;
    }

    // Klick auf Eintrag im 3-Punkte-Menü
    const fabItem = target.closest(".contact-actions-mobile .contact-fab-item");
    if (fabItem) {
      hideMenu();
    }

    // Klick auf X / Save / Delete im Edit-Overlay oder White-Screen
    const closeOrSaveBtn = target.closest(
      ".close-icon-edit-contact, .button-edit-contact, #white-screen"
    );
    if (closeOrSaveBtn) {
      setTimeout(showMenu, 0);
    }
  });
});
