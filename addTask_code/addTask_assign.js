/** @returns {{dropdown:HTMLElement|null,placeholder:HTMLElement|null,arrow:HTMLElement|null}} */
function getAssignElements() {
  return {
    dropdown: document.querySelector(".assign-dropdown-addTask_page"),
    placeholder: document.querySelector(".assign-placeholder-addTask_page"),
    arrow: document.querySelector(".assign-arrow-addTask_page"),
  };
}

/** Toggles assign dropdown open/close. @param {Event} event */
function toggleAssignDropdown(event) {
  event.stopPropagation();
  const { dropdown, placeholder, arrow } = getAssignElements();
  if (!dropdown || !placeholder || !arrow) return;
  const willOpen = dropdown.style.display !== "block";
  setAssignDropdownState(dropdown, placeholder, arrow, willOpen);
  if (!willOpen) renderAssignedAvatars();
}

/** Sets dropdown state and UI. @param {HTMLElement} d @param {HTMLElement} p @param {HTMLElement} a @param {boolean} open */
function setAssignDropdownState(d, p, a, open) {
  window.isDropdownOpen = open;
  d.style.display = open ? "block" : "none";
  if (open) openAssignUI(p, a);
  else closeAssignUI(p, a);
}

/** Prepares UI for open state. @param {HTMLElement} p @param {HTMLElement} a */
function openAssignUI(p, a) {
  p.contentEditable = true;
  p.textContent = "";
  p.classList.add("typing");
  p.focus();
  a.style.transform = "rotate(180deg)";
  showAllAssignItems();
}

/** Prepares UI for closed state. @param {HTMLElement} p @param {HTMLElement} a */
function closeAssignUI(p, a) {
  p.contentEditable = false;
  p.classList.remove("typing");
  p.blur();
  p.textContent = "Select contact to assign";
  p.style.color = "black";
  a.style.transform = "rotate(0deg)";
}

/** Shows all assign dropdown items. */
function showAllAssignItems() {
  document
    .querySelectorAll(".assign-item-addTask_page")
    .forEach((item) => (item.style.display = "flex"));
}

/** Returns initials from name. @param {string} full @returns {string} */
function getInitials(full) {
  const parts = full.split(/\s+/);
  const f = parts[0]?.charAt(0).toUpperCase() || "";
  const l = parts[1]?.charAt(0).toUpperCase() || "";
  return `${f}${l}`;
}

/** Renders contacts into dropdown. */
async function renderContactsInDropdown() {
  const merged = await getMergedContacts();
  if (!merged.length) return;
  const contentRef = document.getElementById("contacts-containerID");
  if (!contentRef) return;
  contentRef.innerHTML = "";
  merged.forEach(singleContactTemplate);
  updateAssignPlaceholder();
}

/** Builds merged contact list. @returns {Promise<Object[]>} */
async function getMergedContacts() {
  if (window.authReady) await window.authReady;
  const base = window.currentUser
    ? await loadContactsForActiveUser()
    : GUEST_EXAMPLE_CONTACTS;
  const merged = Array.isArray(base) ? [...base] : [];
  const selected = Array.isArray(window.selectedUsers) ? window.selectedUsers : [];
  const colors = window.selectedUserColors || {};
  selected.forEach((name) => {
    if (!merged.some((c) => c && c.username === name)) {
      merged.push({ username: name, color: colors[name] || "#4589ff" });
    }
  });
  return merged;
}

/** Appends single contact DOM template. @param {{username:string,color?:string}} contact */
function singleContactTemplate(contact) {
  const contentRef = document.getElementById("contacts-containerID");
  if (!contentRef) return;
  const isSelected =
    Array.isArray(window.selectedUsers) &&
    window.selectedUsers.includes(contact.username);
  contentRef.innerHTML += `
    <div class="assign-item-addTask_page assign-item-addTask_template ${isSelected ? "selected" : ""}"
         onclick="selectAssignUser('${contact.username}', event)">
      <span class="assign-avatar-addTask_page assign-avatar-addTask_template"
            style="background-color:${contact.color || "#4589ff"};">
        ${getInitials(contact.username)}
      </span>
      <span class="assign-name-addTask_page assign-name-addTask_template">
        ${contact.username}
      </span>
      <input type="checkbox" name="assigned[]"
             class="assign-check-addTask_page assign-check-addTask_template"
             ${isSelected ? "checked" : ""}>
    </div>`;
}

/** Selects/deselects user in dropdown. @param {string} name @param {Event} event */
function selectAssignUser(name, event) {
  const item = findAssignItem(name, event);
  if (!item) return;
  const checkbox = item.querySelector(".assign-check-addTask_page");
  checkbox.checked = !checkbox.checked;
  item.classList.toggle("selected", checkbox.checked);
  updateSelectedUsersArray(name, checkbox.checked);
  updateAssignPlaceholder();
}

/** Finds contact item element. @param {string} name @param {Event} [event] @returns {HTMLElement|null} */
function findAssignItem(name, event) {
  if (event?.target) {
    const fromEvent = event.target.closest(".assign-item-addTask_page");
    if (fromEvent) return fromEvent;
  }
  const items = document.querySelectorAll(".assign-item-addTask_page");
  for (const el of items) {
    const label = el
      .querySelector(".assign-name-addTask_page")
      .textContent.trim();
    if (label === name) return el;
  }
  return null;
}

/** Updates window.selectedUsers. @param {string} name @param {boolean} isSelected */
function updateSelectedUsersArray(name, isSelected) {
  if (!Array.isArray(window.selectedUsers)) window.selectedUsers = [];
  if (isSelected) {
    if (!window.selectedUsers.includes(name)) window.selectedUsers.push(name);
  } else {
    window.selectedUsers = window.selectedUsers.filter((u) => u !== name);
  }
}

/** Updates placeholder text based on selection. */
function updateAssignPlaceholder() {
  const placeholder = document.querySelector(
    ".assign-placeholder-addTask_page"
  );
  if (!placeholder) return;
  const hasSel =
    Array.isArray(window.selectedUsers) && window.selectedUsers.length > 0;
  placeholder.textContent = hasSel ? "" : "Select contact to assign";
  if (!hasSel) placeholder.style.color = "black";
}

document.addEventListener("input", handleAssignInput);

/** Handles input in assign placeholder. @param {InputEvent} e */
function handleAssignInput(e) {
  if (!isAssignPlaceholderEvent(e)) return;
  const value = getAssignSearchValue(e.target);
  processAssignSearch(value, e.target);
}

/** Checks if event is from placeholder. @param {Event} e @returns {boolean} */
function isAssignPlaceholderEvent(e) {
  return e.target.classList.contains("assign-placeholder-addTask_page");
}

/** Gets lowercase trimmed search value. @param {HTMLElement} target @returns {string} */
function getAssignSearchValue(target) {
  return target.textContent.toLowerCase().trim();
}

/** Filters contacts by search. @param {string} value @param {HTMLElement} target */
function processAssignSearch(value, target) {
  const items = document.querySelectorAll(".assign-item-addTask_page");
  if (!value) {
    resetAssignSearch();
    return;
  }
  const anyMatch = filterAssignList(items, value);
  if (!anyMatch) showAllAssignItems();
  if (target.textContent.trim() === "") updateAssignPlaceholder();
}

/** Resets search and shows all. */
function resetAssignSearch() {
  showAllAssignItems();
  updateAssignPlaceholder();
}

/** Filters list and returns match flag. @param {NodeListOf<Element>} items @param {string} value @returns {boolean} */
function filterAssignList(items, value) {
  let anyMatch = false;
  items.forEach((item) => {
    const name = item
      .querySelector(".assign-name-addTask_page")
      .textContent.toLowerCase();
    const matches = name.includes(value);
    item.style.display = matches ? "flex" : "none";
    if (matches) anyMatch = true;
  });
  return anyMatch;
}

document.addEventListener("click", handleAssignDropdownClick);

/** Handles closing dropdown on outside click. @param {MouseEvent} e */
function handleAssignDropdownClick(e) {
  const { dropdown, placeholder, arrow } = getAssignElements();
  const assignSelect = document.getElementById("assign-select");
  const panel = document.getElementById("addtask-content");
  if (!dropdown || !assignSelect) return;
  const insidePanel =
    panel?.contains(e.target) &&
    !assignSelect.contains(e.target) &&
    !dropdown.contains(e.target);
  if (insidePanel) return;
  if (assignSelect.contains(e.target) || dropdown.contains(e.target)) return;
  closeAssignDropdown(dropdown, placeholder, arrow);
}

/** Closes dropdown and resets UI. @param {HTMLElement} d @param {HTMLElement|null} p @param {HTMLElement|null} a */
function closeAssignDropdown(d, p, a) {
  d.style.display = "none";
  window.isDropdownOpen = false;
  if (p) {
    p.contentEditable = false;
    p.classList.remove("typing");
  }
  if (a) a.style.transform = "rotate(0deg)";
  renderAssignedAvatars();
}

/** Renders selected avatars into container. */
function renderAssignedAvatars() {
  const container = document.getElementById("assigned-avatars");
  if (!container) return;
  container.innerHTML = "";
  const selected = Array.isArray(window.selectedUsers)
    ? window.selectedUsers
    : [];
  selected.slice(0, 3).forEach((name) => {
    const data = getAvatarData(name);
    container.appendChild(createAvatarNode(data.initials, data.color));
  });
  if (selected.length > 3) {
    container.appendChild(createRestAvatar(selected.length - 3));
  }
}

/** Collects avatar data. @param {string} name @returns {{color:string,initials:string}} */
function getAvatarData(name) {
  const item = [...document.querySelectorAll(".assign-item-addTask_page")].find(
    (el) =>
      el.querySelector(".assign-name-addTask_page").textContent.trim() === name
  );
  const sourceAvatar = item?.querySelector(".assign-avatar-addTask_page");
  const color = sourceAvatar ? sourceAvatar.style.backgroundColor : "#4589ff";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join("");
  return { color, initials };
}

/** Creates avatar node element. @param {string} initials @param {string} color @returns {HTMLDivElement} */
function createAvatarNode(initials, color) {
  const avatar = document.createElement("div");
  avatar.classList.add("assign-avatar-addTask_page");
  avatar.textContent = initials;
  avatar.style.backgroundColor = color;
  return avatar;
}

/** Creates "+X" avatar bubble. @param {number} rest @returns {HTMLDivElement} */
function createRestAvatar(rest) {
  const bubble = createAvatarNode(`+${rest}`, "#d1d1d1");
  bubble.style.color = "black";
  bubble.style.fontWeight = "bold";
  return bubble;
}

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("assign-check-addTask_page")) return;
  e.stopPropagation();
  const item = e.target.closest(".assign-item-addTask_page");
  if (!item) return;
  const name = item
    .querySelector(".assign-name-addTask_page")
    .textContent.trim();
  selectAssignUser(name, e);
});
