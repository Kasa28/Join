function userMenuTemplate(){
return `<div class="user-menu-container-header">
            <div class="user-menu-content-header">
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
                    <a onclick="deleteIdFromLocalStorage()" class="button-sidebar padding-up-down-small" href="../login.html">
                        <span class="sidebar-font">Logout</span>
                    </a>
                </div>
            </div>
        </div>`
}

function renderUserMenuePopupMenu(){
    const contentRef = document.getElementById("user-menue-header");
    contentRef.innerHTML = userMenuTemplate();
}

function toggleUserMenuePopupMenu(){
    const contentRef = document.getElementById("user-menue-header");
    contentRef.classList.toggle("d_none");
}

function deleteIdFromLocalStorage(){
    localStorage.removeItem('userID');
}

function checkIfLogedIn(){
    if (!localStorage.getItem("userID")) {
        return false;
    }
    return true;
}

function setLetterInUserBall(){
    
    let contentRef = document.getElementById("user-ball-ID");

    if(!checkIfLogedIn()){
        contentRef.innerHTML = "g";
    }
        contentRef.innerHTML = "a";
}