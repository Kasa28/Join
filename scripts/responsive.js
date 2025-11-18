

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
document.addEventListener('DOMContentLoaded', function () {
  /* =========================================
     1) Kontakt-Detail: Desktop vs. Mobile
     ========================================= */

  const legacy  = document.getElementById('singleContactID');      
  const content = document.getElementById('singleContactContent');  

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
        legacy.style.display = 'none';
        content.style.display = '';
        syncFromLegacy();
      } else {
        legacy.style.display = '';
        content.style.display = 'none';
      }
    }

    const contactObserver = new MutationObserver(syncFromLegacy);
    contactObserver.observe(legacy, { childList: true, subtree: true });

    window.addEventListener('resize', applyContactLayout);
    applyContactLayout();
  }


  function getMenuWrapper() {
    return document.querySelector('.contact-actions-mobile');
  }

  function getToggle() {
    return document.getElementById('contact-menu-toggle');
  }

  function hideMenu() {
    const menuWrapper = getMenuWrapper();
    const toggle = getToggle();
    if (!menuWrapper || !toggle) return;
    menuWrapper.style.display = 'none';
    toggle.checked = false;
  }

  function showMenu() {
    const menuWrapper = getMenuWrapper();
    const toggle = getToggle();
    if (!menuWrapper || !toggle) return;
    menuWrapper.style.display = '';
    toggle.checked = false;
  }

  document.addEventListener('click', function (event) {
    const menuWrapper = getMenuWrapper();
    const toggle = getToggle();
    if (!menuWrapper || !toggle) return;

    const target = event.target;

    if (!menuWrapper.contains(target)) {
      toggle.checked = false;
    }

    const fabItem = target.closest('.contact-actions-mobile .contact-fab-item');
    if (fabItem) {
      hideMenu(); 
    }

    const closeOrSaveBtn = target.closest(
      '.close-icon-edit-contact, .button-edit-contact, #white-screen'
    );
    if (closeOrSaveBtn) {
      setTimeout(showMenu, 0);
    }
  });


  const addFab = document.querySelector('.button-contacts-position'); 
  let addOverlay, editOverlay, overlayObserver;

  function refreshOverlays() {
    addOverlay  = document.querySelector('.add-contact');
    editOverlay = document.querySelector('.edit-contact');
  }

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (el.classList.contains('d-none')) return false;
    return true;
  }

  function applyAddOverlayLayout() {
    if (!addOverlay) return;

    if (window.innerWidth <= 1000) {
      addOverlay.classList.add('d-none');
    } else {

      addOverlay.classList.remove('d-none');
    }
  }

function syncAddFab() {
  if (!addFab) return;


  if (window.innerWidth > 1000) {
    addFab.style.display = '';
    return;
  }

  const overlayOpen = addOverlay && !addOverlay.classList.contains('d-none');

  addFab.style.display = overlayOpen ? 'none' : '';
}


  function setupOverlayObserver() {
    if (overlayObserver) overlayObserver.disconnect();
    const targets = [addOverlay, editOverlay].filter(Boolean);
    if (!targets.length) return;

    overlayObserver = new MutationObserver(syncAddFab);
    targets.forEach(el =>
      overlayObserver.observe(el, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      })
    );
  }

  function initOverlays() {
    refreshOverlays();
    if (!addOverlay && !editOverlay) return;
    applyAddOverlayLayout();
    syncAddFab();
    setupOverlayObserver();
  }

  window.addEventListener('load', initOverlays);

  setTimeout(initOverlays, 800);

  window.addEventListener('resize', function () {
    applyAddOverlayLayout();
    syncAddFab();
  });
});


document.addEventListener('DOMContentLoaded', function () {
  const addOverlay  = document.querySelector('.add-contact');
  const editOverlay = document.querySelector('.edit-contact');
  const addFab      = document.querySelector('.button-contacts-position');

  function applyAddOverlayLayout() {
    if (!addOverlay) return;

    if (window.innerWidth <= 1000) {
      addOverlay.classList.add('d-none');

    } else {
      addOverlay.classList.remove('d-none');
      addOverlay.style.display = '';
    }
  }

  applyAddOverlayLayout();
  window.addEventListener('resize', applyAddOverlayLayout);

  function isVisible(el) {  }

  function syncAddFab() {
    if (!addFab) return;

    if (window.innerWidth > 1000) {
      addFab.style.display = '';
      return;
    }

    const overlayOpen = addOverlay && !addOverlay.classList.contains('d-none');
    addFab.style.display = overlayOpen ? 'none' : '';
  }

  syncAddFab();

  const addFabClickTarget = document.querySelector('.button-contacts-position');
  if (addFabClickTarget) {
    addFabClickTarget.addEventListener('click', function () {
      if (window.innerWidth <= 1000 && addOverlay) {
        addOverlay.classList.remove('d-none');
        addOverlay.style.display = '';
        syncAddFab();
      }
    });
  }
});
