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

  const legacy  = document.getElementById("singleContactID");
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
     2) 3-Punkte-Menü im Kontakt-Detail
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

  /* =========================================
     3) Floating-Button ausblenden,
        wenn Add/Edit-Overlay offen ist
     ========================================= */

  const fabWrapper  = document.querySelector(".contact-actions-mobile"); 
  const addOverlay  = document.querySelector(".add-contact");            
  const editOverlay = document.getElementById("edit-contactID");         

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (el.classList.contains("d-none")) return false;
    if (el.classList.contains("hide-add-contact")) return false;
    if (el.classList.contains("hide-edit-contact")) return false;
    return true;
  }

function syncFloatingActions() {
  if (!fabWrapper) return;

  const overlayOpen =
    isVisible(addOverlay) ||  
    isVisible(editOverlay);      

  fabWrapper.style.display = overlayOpen ? "none" : "";
  document.body.classList.toggle("no-scroll", overlayOpen);
  document.documentElement.classList.toggle("no-scroll", overlayOpen);
}

  /* =========================================
     4) Klick-Handler für Menü + Overlays
     ========================================= */

  document.addEventListener("click", function (event) {
    const wrapper = getMenuWrapper();
    const toggle  = getToggle();
    if (!wrapper || !toggle) return;

    const target = event.target;

    if (!wrapper.contains(target)) {
      hideMenu();
    }

    const fabItem = target.closest(".contact-actions-mobile .contact-fab-item");
    if (fabItem) {
      hideMenu();
    }

    const togglesOverlay =
      target.closest(".contact-fab-item")             || 
      target.closest(".button-contacts-position")     || 
      target.closest(".button-add-contact")           || 
      target.closest(".close-icon-add-contact")       || 
      target.closest(".button-cancel-add-contact")    || 
      target.closest(".button-create-contact")        || 
      target.closest(".close-icon-edit-contact")      || 
      target.closest(".button-edit-contact");           

    if (togglesOverlay) {
      setTimeout(syncFloatingActions, 0);
    }
  });
});
