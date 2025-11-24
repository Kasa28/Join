/* === header.js | Handles user menu, login state, and header rendering === */

/**
 * Determines the correct base path for links depending on the current page location.
 * Returns `".."` if the current page is inside a nested folder (e.g., /board_code/ or /addTask_code/),
 * otherwise returns `"."` for root-level pages.
 *
 * @returns {string} The relative base path to use for link generation.
 */
function getBasePath() {
    const path = window.location.pathname;
    if (path.includes("/board_code/") || path.includes("/addTask_code/")) {
        return "..";
    }
    return ".";
}


/**
 * Returns the HTML template for the user menu displayed in the header.
 * @returns {string} The user menu HTML string.
 */

function userMenuTemplate() {
    const base = getBasePath();
    return `<div class="user-menu-container-header">
                <div class="user-menu-content-header">
                    <div>
                        <a class="button-sidebar padding-up-down-small button_help" href="${base}/help.html">
                            <span class="sidebar-font">Help</span>
                        </a>
                    </div>
                    <div>
                        <a class="button-sidebar padding-up-down-small" href="${base}/legal.html">
                            <span class="sidebar-font">Legal Notice</span>
                        </a>
                    </div>
                    <div>
                        <a class="button-sidebar padding-up-down-small" href="${base}/privacy.html">
                            <span class="sidebar-font">Privacy Policy</span>
                        </a>
                    </div>
                    <div>
                        <a onclick="deleteIdFromLocalStorage()" class="button-sidebar padding-up-down-small" href="${base}/index.html">
                            <span class="sidebar-font">Logout</span>
                        </a>
                    </div>
                </div>
            </div>`;
}

/* === Render User Menu === */
/**
 * Renders the user menu popup into the header container.
 */
function renderUserMenuePopupMenu(){
    const contentRef = document.getElementById("user-menue-header");
    contentRef.innerHTML = userMenuTemplate();
}


/* === Toggle User Menu Visibility === */
/**
 * Toggles the visibility of the user menu popup in the header.
 */
function toggleUserMenuePopupMenu(){
    const contentRef = document.getElementById("user-menue-header");
    contentRef.classList.toggle("d_none");
     if (!contentRef.classList.contains("d_none")) {
        updateUserMenuPosition();
    }
}

/**
 * Positions the user menu directly beneath the avatar circle so it stays visually connected.
 */
function updateUserMenuPosition() {
    const wrapper = document.getElementById("user-menue-header");
    const menu = wrapper?.querySelector(".user-menu-container-header");
    const trigger = document.querySelector(".guest-logo-header");

    if (!wrapper || !menu || !trigger || wrapper.classList.contains("d_none")) {
        return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = menu.offsetWidth || menu.getBoundingClientRect().width || 181;
    const calculatedLeft = rect.left + rect.width / 2 - menuWidth / 2 + window.scrollX;
    const minLeft = 8;

    menu.style.position = "fixed";
     menu.style.top = `${rect.bottom + 6 + window.scrollY}px`;
    menu.style.left = `${Math.max(minLeft, calculatedLeft)}px`;
    menu.style.right = "auto";
}


/* === Logout Functionality === */
/**
 * Removes stored user data from localStorage, effectively logging the user out.
 */
function deleteIdFromLocalStorage(){
    localStorage.removeItem('userData');
}


/* === Login State Check === */
/**
 * Checks whether a user is currently logged in by verifying stored user data.
 * Allows public access to help, legal, and privacy pages.
 * @returns {boolean} True if logged in, false otherwise.
 */
function checkIfLogedIn() {
    const currentPath = window.location.pathname;
    const publicPages = ["help.html", "legal.html", "privacy.html", "index.html", "/"];
    const isPublicPage =
        currentPath === "/" ||
        publicPages.some(page => currentPath.endsWith(page));
    if (isPublicPage) {
        return true;
    }
    const isLoggedIn = Boolean(localStorage.getItem("userData"));
    if (!isLoggedIn) {
        const loginPath = "/index.html";
        window.location.href = loginPath;
        return false;
    }
    return true;
}


/* === User Initial Display === */
/**
 * Initializes the header on page load by setting the user ball letter,
 * activating sidebar button behaviors, and highlighting the current page.
 */
function onloadFunctionHeader(){
    setLetterInUserBall();
    addActiveClassToSidebarButtons();
    setActiveSidebarByURL();
}


/**
 * Sets the displayed initial in the user avatar circle based on login state.
 */
function setLetterInUserBall(){
    let contentRef = document.getElementById("user-ball-ID");
    if(!checkIfLogedIn()){
        contentRef.innerHTML = "G";
    }   else{
        let userJson = JSON.parse(localStorage.getItem("userData"));
        userLetter = userJson.name.charAt(0).toUpperCase();
        contentRef.innerHTML = userLetter;
    }        
}


/* === Greeting Message Rendering === */
/**
 * Capitalizes the first letter of a given string.
 * @param {string} inputString - The string to modify.
 * @returns {string} The string with its first letter capitalized.
 */
function makeFirstLetterBig(inputString){
    return String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1);
}


/**
 * Renders a greeting message in the header, personalized when the user is logged in.
 */
function greetUserName() {
    let contentRef = document.getElementById("greetID");
    const now = new Date();
    const hour = now.getHours();
    let greeting = "";
    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 18) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }
    if (!checkIfLogedIn()) {
        contentRef.innerHTML = `<h1 class="summary-h1-font-guest">${greeting}</h1>`;
    } else {
        let userJson = JSON.parse(localStorage.getItem("userData"));
        let userName = makeFirstLetterBig(userJson.name);
        contentRef.innerHTML = `<h2 class="summary-h2-font-user">${greeting},&nbsp;</h2>
                                <h1 class="summary-h1-font-user">${userName}</h1>`;
    }
}


/**
 * Highlights the active sidebar button based on the current page URL.
 */
function setActiveSidebarByURL() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.side-menu .button-sidebar').forEach(btn => {
        const link = btn.getAttribute('href');
        btn.classList.remove('active');
        if (link && link.includes(currentPage)) {
            btn.classList.add('active');
        }
    });
}


/**
 * Adds click listeners to sidebar buttons to visually indicate active selection.
 */
function addActiveClassToSidebarButtons() {
    document.querySelectorAll('.side-menu .button-sidebar').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.button-sidebar').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}
window.addEventListener('resize', updateUserMenuPosition);
window.addEventListener('scroll', updateUserMenuPosition);