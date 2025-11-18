/* === header.js | Handles user menu, login state, and header rendering === */

/* === User Menu Template === */
function userMenuTemplate(){
return `<div class="user-menu-container-header">
            <div class="user-menu-content-header">
            <div>
                    <a class="button-sidebar padding-up-down-small button_help" href="../help.html">
                        <span class="sidebar-font">Help</span>
                    </a>
                </div>
                <div>
                    <a class="button-sidebar padding-up-down-small" href="../legal.html">
                        <span class="sidebar-font">Legal Notice</span>
                    </a>
                </div>
                <div>
                    <a class="button-sidebar padding-up-down-small" href="../privacy.html">
                        <span class="sidebar-font">Privacy Policy</span>
                    </a>
                </div>
                <div>
                    <a onclick="deleteIdFromLocalStorage()" class="button-sidebar padding-up-down-small" href="../index.html">
                        <span class="sidebar-font">Logout</span>
                    </a>
                </div>
            </div>
        </div>`
}


/* === Render User Menu === */
function renderUserMenuePopupMenu(){
    const contentRef = document.getElementById("user-menue-header");
    contentRef.innerHTML = userMenuTemplate();
}


/* === Toggle User Menu Visibility === */
function toggleUserMenuePopupMenu(){
    const contentRef = document.getElementById("user-menue-header");
    contentRef.classList.toggle("d_none");
}


/* === Logout Functionality === */
function deleteIdFromLocalStorage(){
    localStorage.removeItem('userData');
}


/* === Login State Check === */
function checkIfLogedIn(){
    if (!localStorage.getItem("userData")) {
        return false;
    }
    return true;
}


/* === User Initial Display === */
function onloadFunctionHeader(){
    setLetterInUserBall();
    addActiveClassToSidebarButtons();
    setActiveSidebarByURL();
}


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
function makeFirstLetterBig(inputString){
    return String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1);
}


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

function setActiveSidebarByURL() {
    const currentPage = window.location.pathname.split('/').pop();

    document.querySelectorAll('.button-sidebar').forEach(btn => {
        const link = btn.getAttribute('href');

        btn.classList.remove('active');

        if (link && link.includes(currentPage)) {
            btn.classList.add('active');
        }
    });
}


function addActiveClassToSidebarButtons() {
    document.querySelectorAll('.button-sidebar').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.button-sidebar').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}