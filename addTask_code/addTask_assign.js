
// === Assign Dropdown Handling ===
/**
 * Toggles the assign dropdown open or closed and handles placeholder & arrow UI updates.
 * @param {Event} event - The click event triggering the toggle.
 */
function toggleAssignDropdown(event) {
  event.stopPropagation();
  const dropdown = document.querySelector(".assign-dropdown-addTask_page");
  const placeholder = document.querySelector(
    ".assign-placeholder-addTask_page"
  );
  const arrow = document.querySelector(".assign-arrow-addTask_page");
  if (!dropdown || !placeholder || !arrow) return;
  isDropdownOpen = dropdown.style.display !== "block";
  dropdown.style.display = isDropdownOpen ? "block" : "none";
  if (isDropdownOpen) {
    placeholder.contentEditable = true;
    placeholder.textContent = "";
    placeholder.classList.add("typing");
    placeholder.focus();
    arrow.style.transform = "rotate(180deg)";
    const items = document.querySelectorAll(".assign-item-addTask_page");
    items.forEach((item) => (item.style.display = "flex"));
  } else {
    placeholder.contentEditable = false;
    placeholder.classList.remove("typing");
    placeholder.blur();
    arrow.style.transform = "rotate(0deg)";
    placeholder.textContent = "Select contact to assign";
    placeholder.style.color = "black";
  }
  if (!isDropdownOpen) {
    renderAssignedAvatars();
  }
}


// === A special function to get the Initals from the contacts ===
/**
 * Extracts initials from a full name string.
 * @param {string} inputFullName - The full name of the contact.
 * @returns {string} The initials derived from the full name.
 */
function getInitials(inputFullName){
    const nameParts = inputFullName.split(/\s+/);
    const firstNameInital = nameParts[0]?.charAt(0).toUpperCase() || "";
    const lastNameInitial = nameParts[1]?.charAt(0).toUpperCase() || "";
    return `${firstNameInital}${lastNameInitial}`
}


// === Contacts are rendered when the page are been open ===
/**
 * Renders all contacts into the assign dropdown.
  * Loads user data from the current session and falls back to demo data if not logged in.
 */
function renderContactsInDropdown(){
  let getUserData = window.getSessionSnapshot() || { friends: [] };
  const userContacts = getUserData.friends;
  const login = checkIfLogedIn();
  if(!login){
    demoContactTemplate();
  }
  for (let index = 0; index < userContacts.length; index++) {
    singleContactTemplate(userContacts[index]);
  }
}


// === Some Templates ===
/**
 * Generates and appends a single contact HTML template to the dropdown.
 * @param {Object} inputContact - A contact object containing user data.
 * @param {string} inputContact.username - The contact's full name.
 * @param {string} inputContact.color - Background color for the contact avatar.
 */
function singleContactTemplate(inputContact){
  let contentRef = document.getElementById("contacts-containerID");
  contentRef.innerHTML += `         
    <div class="assign-item-addTask_page assign-item-addTask_template" onclick="selectAssignUser('${inputContact.username}', event)">
      <span class="assign-avatar-addTask_page assign-avatar-addTask_template" style="background-color: ${inputContact.color};">
        ${getInitials(inputContact.username)}
      </span>
      <span class="assign-name-addTask_page assign-name-addTask_template">
        ${inputContact.username}
      </span>
    <input type="checkbox" name="assigned[]" class="assign-check-addTask_page assign-check-addTask_template">
    </div>`;
}


/**
 * Renders fallback demo contacts when no user is logged in.
 */
function demoContactTemplate(){
   let contentRef = document.getElementById("contacts-containerID");

   contentRef.innerHTML += `         
            <div class="assign-item-addTask_page" onclick="selectAssignUser('Nils Becker', event)">
              <span class="assign-avatar-addTask_page" style="background-color: #4589ff;">NB</span>
              <span class="assign-name-addTask_page">Nils Becker</span>
            <input type="checkbox" name="assigned[]" class="assign-check-addTask_page">
            </div>

            <div class="assign-item-addTask_page" onclick="selectAssignUser('Lara König', event)">
              <span class="assign-avatar-addTask_page" style="background-color: #ff7eb6;">LK</span>
              <span class="assign-name-addTask_page">Lara König</span>
            <input type="checkbox" name="assigned[]" class="assign-check-addTask_page">
            </div>

            <div class="assign-item-addTask_page" onclick="selectAssignUser('Omar Said', event)">
              <span class="assign-avatar-addTask_page" style="background-color: #00bfa5;">OS</span>
              <span class="assign-name-addTask_page">Omar Said</span>
            <input type="checkbox" name="assigned[]" class="assign-check-addTask_page">
            </div>`
}


// === Assign User Selection ===
/**
 * Handles selection and deselection of a user inside the assign dropdown.
 * @param {string} name - The selected user's name.
 * @param {Event} event - The triggering event.
 */
function selectAssignUser(name, event) {
  let item = null;
  if (event && event.target) {
    item = event.target.closest(".assign-item-addTask_page");
  }
  if (!item) {
    const candidates = document.querySelectorAll(".assign-item-addTask_page");
    candidates.forEach((el) => {
      const label = el.querySelector(".assign-name-addTask_page").textContent.trim();
      if (!item && label === name) item = el;
    });
  }
  if (!item) return;
  const checkbox = item.querySelector(".assign-check-addTask_page");
  checkbox.checked = !checkbox.checked;
  item.classList.toggle("selected", checkbox.checked);
  if (checkbox.checked) {
    if (!selectedUsers.includes(name)) selectedUsers.push(name);
  } else {
    selectedUsers = selectedUsers.filter((user) => user !== name);
  }
  updateAssignPlaceholder();
}


// === Placeholder Updates ===
/**
 * Updates placeholder text depending on whether users are selected.
 */
function updateAssignPlaceholder() {
  const placeholder = document.querySelector(
    ".assign-placeholder-addTask_page"
  );
  if (selectedUsers.length === 0) {
    placeholder.textContent = "Select contact to assign";
    placeholder.style.color = "black";
  } else {
    placeholder.textContent = "";
  }
}


// === Input Filtering ===
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("assign-placeholder-addTask_page")) {
    const searchValue = e.target.textContent.toLowerCase();
    const items = document.querySelectorAll(".assign-item-addTask_page");
    if (searchValue.trim() === "") {
      items.forEach((item) => (item.style.display = "flex"));
      return;
    }
    let anyMatch = false;
    items.forEach((item) => {
      const name = item
        .querySelector(".assign-name-addTask_page")
        .textContent.toLowerCase();
      if (name.includes(searchValue)) {
        item.style.display = "flex";
        anyMatch = true;
      } else {
        item.style.display = "none";
      }
      if (
        e.target.classList.contains("assign-placeholder-addTask_page") &&
        e.target.textContent.trim() === ""
      ) {
        updateAssignPlaceholder();
      }
    });
    if (!anyMatch) {
      items.forEach((item) => (item.style.display = "flex"));
    }
  }
});


/**
 * Processes input events inside the assign placeholder to filter contacts.
 * @param {InputEvent} e - The input event.
 */
function handleAssignInput(e) {
  if (!isAssignPlaceholderEvent(e)) return;
  const searchValue = getAssignSearchValue(e.target);
  processAssignSearch(searchValue, e.target);
}


/**
 * Checks whether the event target is the assign placeholder element.
 * @param {Event} e - The event to check.
 * @returns {boolean} True if the event targets the assign placeholder.
 */
function isAssignPlaceholderEvent(e) {
  return e.target.classList.contains("assign-placeholder-addTask_page");
}


/**
 * Returns the lowercase trimmed search value from the assign placeholder.
 * @param {HTMLElement} target - The placeholder element.
 * @returns {string} The processed search value.
 */
function getAssignSearchValue(target) {
  return target.textContent.toLowerCase().trim();
}


/**
 * Filters the assign dropdown based on the given search value.
 * @param {string} searchValue - The search input.
 * @param {HTMLElement} target - The placeholder element triggering the search.
 */
function processAssignSearch(searchValue, target) {
  const items = document.querySelectorAll(".assign-item-addTask_page");
  if (shouldResetAssignSearch(searchValue)) {
    resetAssignSearch();
    return;
  }
  const anyMatch = filterAssignList(items, searchValue);
  finalizeAssignSearch(anyMatch, target);
}


/**
 * Checks if the search should reset based on whether the input is empty.
 * @param {string} searchValue - The current search text.
 * @returns {boolean} True if search string is empty.
 */
function shouldResetAssignSearch(searchValue) {
  return searchValue === "";
}


/**
 * Resets the assign dropdown list to show all contacts.
 */
function resetAssignSearch() {
  showAllAssignItems();
  updateAssignPlaceholder();
}


/**
 * Filters the provided list of items by a search string.
 * @param {NodeListOf<Element>} items - List of assign dropdown items.
 * @param {string} searchValue - The search string.
 * @returns {boolean} True if at least one item matches.
 */
function filterAssignList(items, searchValue) {
  let anyMatch = false;
  items.forEach((item) => {
    const name = item
      .querySelector(".assign-name-addTask_page")
      .textContent.toLowerCase();
    const matches = name.includes(searchValue);
    item.style.display = matches ? "flex" : "none";
    if (matches) anyMatch = true;
  });
  return anyMatch;
}


/**
 * Finalizes search by resetting view if no results match and updating placeholder state.
 * @param {boolean} anyMatch - Whether any contacts matched the filter.
 * @param {HTMLElement} target - The placeholder element.
 */
function finalizeAssignSearch(anyMatch, target) {
  if (!anyMatch) {
    showAllAssignItems();
  }
  if (target.textContent.trim() === "") {
    updateAssignPlaceholder();
  }
}


// === Dropdown Close Handling ===
document.addEventListener("click", (e) => {
  const dropdown = document.querySelector(".assign-dropdown-addTask_page");
  const assignSelect = document.getElementById("assign-select");
  const placeholder = document.querySelector(
    ".assign-placeholder-addTask_page"
  );
  const arrow = document.querySelector(".assign-arrow-addTask_page");

  if (!dropdown || !assignSelect) return;

  if (!assignSelect.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
    if (placeholder) {
      placeholder.contentEditable = false;
      placeholder.classList.remove("typing");
  }
  if (arrow) {
    arrow.style.transform = "rotate(0deg)";
  }
    renderAssignedAvatars();
  }
});


// === Avatar Rendering ===
/**
 * Renders selected user avatars into the assigned avatar container.
 */
function renderAssignedAvatars() {
  const container = document.getElementById("assigned-avatars");
  if (!container) return;
  container.innerHTML = "";

  // Zeige nur die ersten 3 ausgewählten
  const visibleUsers = selectedUsers.slice(0, 3);

  visibleUsers.forEach((name) => {
    // Avatar finden (aus der Dropdown-Liste)
    const sourceAvatar = [...document.querySelectorAll(".assign-item-addTask_page")]
      .find(item => item.querySelector(".assign-name-addTask_page").textContent.trim() === name)
      ?.querySelector(".assign-avatar-addTask_page");

    const color = sourceAvatar ? sourceAvatar.style.backgroundColor : "#4589ff";
    const initials = name.split(" ").map(n => n[0].toUpperCase()).join("");

    const avatar = document.createElement("div");
    avatar.classList.add("assign-avatar-addTask_page");
    avatar.textContent = initials;
    avatar.style.backgroundColor = color;

    container.appendChild(avatar);
  });

  // Wenn mehr als 3 → +X Bubble anzeigen
  if (selectedUsers.length > 3) {
    const rest = selectedUsers.length - 3;
    const bubble = document.createElement("div");
    bubble.classList.add("assign-avatar-addTask_page");
    bubble.style.backgroundColor = "#d1d1d1";
    bubble.style.color = "black";
    bubble.style.fontWeight = "bold";
    bubble.textContent = `+${rest}`;

    container.appendChild(bubble);
  }
}


// === Assign Checkbox Handling ===
/**
 * Handles checkbox click events inside the assign dropdown to ensure correct selection logic.
 */
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("assign-check-addTask_page")) return;
  e.stopPropagation();

  const item = e.target.closest(".assign-item-addTask_page");
  if (!item) return;

  const name = item.querySelector(".assign-name-addTask_page").textContent.trim();
  selectAssignUser(name, e);
});