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
    localStorage.removeItem('userData');
}

function checkIfLogedIn(){

    if (!localStorage.getItem("userData")) {
        return false;
    }
    return true;
}

function onloadFunctionHeader(){
    setLetterInUserBall();
    
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

function makeFirstLetterBig(inputString){

    return String(inputString).charAt(0).toUpperCase() + String(inputString).slice(1);

}


function greetUserName(){

    let contentRef = document.getElementById("greetID");

    if(!checkIfLogedIn()){
        contentRef.innerHTML = `<h1 class="summary-h1-font-guest">Good Morning</h1>`;
    }   else{
        let userJson = JSON.parse(localStorage.getItem("userData"));
        let userName = makeFirstLetterBig(userJson.name);
        contentRef.innerHTML = `<h2 class="summary-h2-font-user" >Good Morning,  </h2>
                                <h1 class="summary-h1-font-user">${userName}</h1>`
    } 


}