
// === Assign Dropdown Handling ===
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

// === Assign User Selection ===
function selectAssignUser(name, event) {
  if (event && event.stopPropagation) event.stopPropagation();

  let item = event && event.currentTarget ? event.currentTarget : null;
  if (!item) {
    const candidates = document.querySelectorAll(".assign-item-addTask_page");
    candidates.forEach((el) => {
      const label = el
        .querySelector(".assign-name-addTask_page")
        .textContent.trim();
      if (!item && label === name) item = el;
    });
  }
  if (!item) return;

  const checkbox = item.querySelector(".assign-check-addTask_page");
  item.classList.toggle("selected", checkbox.checked);

  if (checkbox.checked) {
    if (!selectedUsers.includes(name)) selectedUsers.push(name);
  } else {
    selectedUsers = selectedUsers.filter((user) => user !== name);
  }

  updateAssignPlaceholder();
}

// === Placeholder Updates ===
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
    placeholder.contentEditable = false;
    placeholder.classList.remove("typing");
    arrow.style.transform = "rotate(0deg)";
    renderAssignedAvatars();
  }
});

// === Avatar Rendering ===
function renderAssignedAvatars() {
  const container = document.getElementById("assigned-avatars");
  if (!container) return;
  container.innerHTML = "";
  selectedUsers.forEach((name) => {
    const sourceAvatar = [
      ...document.querySelectorAll(".assign-item-addTask_page"),
    ]
      .find(
        (item) =>
          item.querySelector(".assign-name-addTask_page").textContent.trim() ===
          name
      )
      ?.querySelector(".assign-avatar-addTask_page");

    const color = sourceAvatar ? sourceAvatar.style.backgroundColor : "#4589ff";
    const initials = name
      .split(" ")
      .map((n) => n[0].toUpperCase())
      .join("");
    const avatar = document.createElement("div");
    avatar.textContent = initials;
    avatar.classList.add("assign-avatar-addTask_page");
    avatar.style.backgroundColor = color;
    container.appendChild(avatar);
  });
}
