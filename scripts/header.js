function userMenuTemplate(){
return `<div class="user-menu-container-header">
            <div class="user-menu-content-header">
                <div>
                    <a class="button-sidebar padding-up-down-small" href="./legal.html">
                        <span class="sidebar-font">Legal Notice</span>
                    </a>
                </div>
                <div>
                    <a class="button-sidebar padding-up-down-small" href="./privacy.html">
                        <span class="sidebar-font">Privacy Policy</span>
                    </a>
                </div>
                <div>
                    <a class="button-sidebar padding-up-down-small" href="./login.html">
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

