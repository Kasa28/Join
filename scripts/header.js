/**
 * Determines the correct base path for links depending on the current page location.
 * @returns {string}
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes("/board_code/") || path.includes("/addTask_code/")) {
    return "..";
  }
  return ".";
}

/**
 * Builds the HTML string for the header user menu.
 * @returns {string}
 */
function userMenuTemplate() {
  const base = getBasePath();
  return `<div class="user-menu-container-header"><div class="user-menu-content-header"><div><a class="button-sidebar padding-up-down-small button_help" href="${base}/help.html"><span class="sidebar-font">Help</span></a></div><div><a class="button-sidebar padding-up-down-small" href="${base}/legal.html"><span class="sidebar-font">Legal Notice</span></a></div><div><a class="button-sidebar padding-up-down-small" href="${base}/privacy.html"><span class="sidebar-font">Privacy Policy</span></a></div><div><a onclick="deleteIdFromLocalStorage(), logout()" class="button-sidebar padding-up-down-small" href="${base}/index.html"><span class="sidebar-font">Logout</span></a></div></div></div>`;
}

/**
 * Renders the user menu into the header container.
 * @returns {void}
 */
function renderUserMenuePopupMenu() {
  const contentRef = document.getElementById("user-menue-header");
  if (!contentRef) return;
  contentRef.innerHTML = userMenuTemplate();
}

/**
 * Toggles the visibility of the user menu popup in the header.
 * @returns {void}
 */
function toggleUserMenuePopupMenu() {
  const contentRef = document.getElementById("user-menue-header");
  if (!contentRef) return;
  contentRef.classList.toggle("d_none");
  if (!contentRef.classList.contains("d_none")) updateUserMenuPosition();
}

/**
 * Positions the user menu below the avatar circle.
 * @returns {void}
 */
function updateUserMenuPosition() {
  const wrapper = document.getElementById("user-menue-header");
  const menu = wrapper?.querySelector(".user-menu-container-header");
  const trigger = document.querySelector(".guest-logo-header");
  if (!wrapper || !menu || !trigger || wrapper.classList.contains("d_none")) return;
  const rect = trigger.getBoundingClientRect();
  const menuWidth = menu.offsetWidth || menu.getBoundingClientRect().width || 181;
  const left = rect.left + rect.width / 2 - menuWidth / 2 + window.scrollX;
  const top = rect.bottom + 6 + window.scrollY;
  const safeLeft = Math.max(8, left);
  Object.assign(menu.style, { position: "fixed", top: `${top}px`, left: `${safeLeft}px`, right: "auto" });
}

/**
 * Removes guest contacts from localStorage and signs out the user.
 * @returns {Promise<void>}
 */
async function deleteIdFromLocalStorage() {
  localStorage.removeItem(GUEST_CONTACTS_KEY);
  if (typeof window.signOut === "function") await window.signOut();
}

/**
 * Checks if the current page is a public page (help, legal, privacy, index).
 * @returns {boolean}
 */
function isPublicPage() {
  const normalizedPath = window.location.pathname.toLowerCase();
  const publicPages = ["help", "legal", "privacy", "index", "/"];
  if (normalizedPath === "/") return true;
  return publicPages.some(
    (page) =>
      normalizedPath.endsWith(`${page}.html`) ||
      normalizedPath.endsWith(`/${page}`)
  );
}

/**
 * Checks if a user is logged in and redirects to login for protected pages.
 * @returns {boolean}
 */
function checkIfLogedIn() {
  const loggedIn = Boolean(window.currentUser);
  if (!loggedIn && !isPublicPage() && window.authReady) {
    window.authReady.then((user) => {
      if (!user) {
        const loginPath = "/index.html";
        window.location.href = loginPath;
      }
    });
  }
  return loggedIn;
}

/**
 * Initializes the header after page load.
 * @returns {Promise<void>}
 */
async function onloadFunctionHeader() {
  if (window.authReady) await window.authReady;
  const isLoggedIn = checkIfLogedIn();
  toggleNavigationForGuest(isLoggedIn);
  const profile = isLoggedIn ? await loadCurrentUserProfile() : null;
  await setLetterInUserBall(isLoggedIn, profile);
  toggleNavigationForGuest(isLoggedIn);
  addActiveClassToSidebarButtons();
  setActiveSidebarByURL();
  document.body.classList.remove("preload");
}

/**
 * Sets the avatar circle letter depending on login state and profile.
 * @param {boolean} isLoggedIn
 * @param {{name?:string,isGuest?:boolean}|null} [profile]
 * @returns {Promise<void>}
 */
async function setLetterInUserBall(isLoggedIn, profile) {
  const el = document.getElementById("user-ball-ID");
  if (!el) return;
  if (!isLoggedIn) {
    el.innerHTML = "G";
    return;
  }
  const isGuestUser = Boolean(window.currentUser?.isAnonymous || profile?.isGuest);
  const name =
    profile?.name ||
    window.currentUser?.displayName ||
    window.currentUser?.email ||
    (isGuestUser ? "Guest" : "");
  const letter = name.charAt(0).toUpperCase();
  if (letter) {
    el.innerHTML = letter;
    return;
  }
  el.innerHTML = isGuestUser ? "G" : "?";
}

/**
 * Capitalizes the first letter of the given string.
 * @param {string} inputString
 * @returns {string}
 */
function makeFirstLetterBig(inputString) {
  return (
    String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1)
  );
}

/**
 * Renders a greeting in the header, optionally with the user name.
 * @returns {Promise<void>}
 */
async function greetUserName() {
  if (window.authReady) await window.authReady;
  const el = document.getElementById("greetID");
  if (!el) return;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  if (!checkIfLogedIn()) {
    el.innerHTML = `<h1 class="summary-h1-font-guest">${greeting}</h1>`;
    return;
  }
  const profile = await loadCurrentUserProfile();
  const baseName =
    profile?.name ||
    window.currentUser?.displayName ||
    window.currentUser?.email ||
    "User";
  const userName = makeFirstLetterBig(baseName);
  el.innerHTML = `<h2 class="summary-h2-font-user">${greeting},&nbsp;</h2><h1 class="summary-h1-font-user">${userName}</h1>`;
}

/**
 * Highlights the active sidebar entry based on the current URL.
 * @returns {void}
 */
function setActiveSidebarByURL() {
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".side-menu .button-sidebar").forEach((btn) => {
    const link = btn.getAttribute("href");
    btn.classList.remove("active");
    if (link && link.includes(currentPage)) btn.classList.add("active");
  });
}

/**
 * Adds click handlers to sidebar buttons to toggle the active class.
 * @returns {void}
 */
function addActiveClassToSidebarButtons() {
  document.querySelectorAll(".side-menu .button-sidebar").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".button-sidebar")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

window.addEventListener("resize", updateUserMenuPosition);

/**
 * Shows or hides navigation parts for guests on public pages.
 * @param {boolean} isLoggedIn
 * @returns {void}
 */
function toggleNavigationForGuest(isLoggedIn) {
  const isGuestOnPublic = !isLoggedIn && isPublicPage();
  const sidebarHighSection = document.querySelector(".sidebar-high-section-container");
  const userAvatar = document.querySelector(".guest-logo-header");
  const loginLink = document.getElementById("guest-login-link");
  const headerHelpLink = document.getElementById("header-help-link");
  document.body.classList.toggle("guest-mode", isGuestOnPublic);
  if (sidebarHighSection) sidebarHighSection.classList.toggle("d_none", isGuestOnPublic);
  if (userAvatar) userAvatar.classList.toggle("d_none", isGuestOnPublic);
  if (headerHelpLink) headerHelpLink.classList.toggle("d_none", isGuestOnPublic);
  if (loginLink) loginLink.classList.toggle("d_none", !isGuestOnPublic);
}
