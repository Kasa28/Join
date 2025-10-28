function userMenuTemplate(){
return `<div class="user-menu-container-header">
            <div class="user-menu-content-header">
                <div>
                        <button class="button-sidebar padding-up-down-small sidebar-font" href="">Legal Notice</button>
                </div>
                <div>
                        <button class="button-sidebar padding-up-down-small sidebar-font" href="">Privacy Policy</button>
                </div>
                <div>
                        <button class="button-sidebar padding-up-down-small sidebar-font" href="">Logout</button>
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

