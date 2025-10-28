function userMenuTemplate(){
return `<div class="user-menu-container-header">
            <div class="user-menu-content-header">
                <div>
                    <a href="./legal.html">
                        <button class="button-sidebar padding-up-down-small sidebar-font">Legal Notice</button>
                    </a>
                </div>
                <div>
                    <a href="./privacy.html">
                        <button class="button-sidebar padding-up-down-small sidebar-font">Privacy Policy</button>
                    </a>
                </div>
                <div>
                    <a href="./signUp.html">
                        <button class="button-sidebar padding-up-down-small sidebar-font">Logout</button>
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

