window.selectedUsers = window.selectedUsers || [];
window.isDropdownOpen = window.isDropdownOpen || false;
// Alias, damit onclick="setPriority('urgent')" weiter funktioniert
window.setPriority = function(p) {
  return setPriorityAddTask(p);
};

function initAddTaskTemplateHandlers() {
  const titleInput = document.getElementById("title");
  if (titleInput) {
    const errorMsg = document.getElementById("title-error");
    function validateTitle() {
      const value = titleInput.value.trim();
      if (value === "") {
        errorMsg.textContent = "This field is required.";
        titleInput.style.borderBottom = "1px solid red";
      } else {
        errorMsg.textContent = "";
        titleInput.style.borderBottom = "1px solid #d1d1d1";
      }
    }
    titleInput.addEventListener("blur", validateTitle);
    titleInput.addEventListener("input", validateTitle);
  }

  const dueDateInput = document.getElementById("due-date");
  if (dueDateInput) {
    dueDateInput.addEventListener("input", (e) => {
      sanitizeDueDateInput(e);
      validateDueDate();
    });
    dueDateInput.addEventListener("blur", validateDueDate);
  }
}

function toggleAssignDropdown(event) {
  event.stopPropagation();
  const dropdown = document.querySelector(".assign-dropdown-addTask_template");
  const placeholder = document.querySelector(".assign-placeholder-addTask_template");
  const arrow = document.querySelector(".assign-arrow-addTask_template");

  if (!dropdown || !placeholder || !arrow) return;

  isDropdownOpen = dropdown.style.display !== "block";
  dropdown.style.display = isDropdownOpen ? "block" : "none";

  if (isDropdownOpen) {
    // Platzhalter als Eingabefeld aktivieren
    placeholder.contentEditable = true;
    placeholder.textContent = "";
    placeholder.classList.add("typing");
    placeholder.focus();
    arrow.style.transform = "rotate(180deg)"; // Pfeil nach oben
    const items = document.querySelectorAll(".assign-item-addTask_template");
    items.forEach((item) => (item.style.display = "flex"));
  } else {
    // Dropdown wird geschlossen
    placeholder.contentEditable = false;
    placeholder.classList.remove("typing");
    placeholder.blur();
    arrow.style.transform = "rotate(0deg)"; // Pfeil nach unten

    // ✅ Placeholder immer wiederherstellen (egal ob Auswahl oder nicht)
    placeholder.textContent = "Select contact to assign";
    placeholder.style.color = "black";
  }

  // Nach dem Schließen → Avatare aktualisieren
  if (!isDropdownOpen) {
    renderAssignedAvatars();
  }
}

function selectAssignUser(name, event) {
  if (event && event.stopPropagation) event.stopPropagation();

  let item = event && event.currentTarget ? event.currentTarget : null;
  if (!item) {
    const candidates = document.querySelectorAll(".assign-item-addTask_template");
    candidates.forEach((el) => {
      const label = el
        .querySelector(".assign-name-addTask_template")
        .textContent.trim();
      if (!item && label === name) item = el;
    });
  }
  if (!item) return;

  const checkbox = item.querySelector(".assign-check-addTask_template");
  item.classList.toggle("selected", checkbox.checked);

  if (checkbox.checked) {
    if (!selectedUsers.includes(name)) selectedUsers.push(name);
  } else {
    selectedUsers = selectedUsers.filter((user) => user !== name);
  }

  updateAssignPlaceholder();
}

function updateAssignPlaceholder() {
  const placeholder = document.querySelector(".assign-placeholder-addTask_template");
  if (selectedUsers.length === 0) {
    placeholder.textContent = "Select contact to assign";
    placeholder.style.color = "black";
  } else {
    // leer lassen, CSS-Placeholder zeigt den Text
    placeholder.textContent = "";
  }
}

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("assign-placeholder-addTask_template")) {
    const searchValue = e.target.textContent.toLowerCase();
    const items = document.querySelectorAll(".assign-item-addTask_template");

    if (searchValue.trim() === "") {
      items.forEach((item) => (item.style.display = "flex"));
      return;
    }

    let anyMatch = false;
    items.forEach((item) => {
      const name = item.querySelector(".assign-name-addTask_template").textContent.toLowerCase();
      if (name.includes(searchValue)) {
        item.style.display = "flex";
        anyMatch = true;
      } else {
        item.style.display = "none";
      }

      if (
        e.target.classList.contains("assign-placeholder-addTask_template") &&
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

document.addEventListener("click", (e) => {
  const dropdown = document.querySelector(".assign-dropdown-addTask_template");
  const assignSelect = document.getElementById("assign-select");
  const placeholder = document.querySelector(".assign-placeholder-addTask_template");
  const arrow = document.querySelector(".assign-arrow-addTask_template");

  if (!dropdown || !assignSelect) return;

  if (!assignSelect.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
    placeholder.contentEditable = false;
    placeholder.classList.remove("typing");
    arrow.style.transform = "rotate(0deg)";
    renderAssignedAvatars();
  }
});

function renderAssignedAvatars() {
  const container = document.getElementById("assigned-avatars");
  if (!container) return;

  container.innerHTML = ""; // vorhandene Avatare löschen

  selectedUsers.forEach((name) => {
    // Avatar im Dropdown finden
    const sourceAvatar = [
      ...document.querySelectorAll(".assign-item-addTask_template"),
    ]
      .find(
        (item) =>
          item.querySelector(".assign-name-addTask_template").textContent.trim() ===
          name
      )
      ?.querySelector(".assign-avatar-addTask_template");

    // 🔹 Hintergrundfarbe übernehmen, wie im Original
    const color = sourceAvatar ? sourceAvatar.style.backgroundColor : "#4589ff";

    const initials = name
      .split(" ")
      .map((n) => n[0].toUpperCase())
      .join("");

    const avatar = document.createElement("div");
    avatar.textContent = initials;
    avatar.classList.add("assign-avatar-addTask_template");
    avatar.style.backgroundColor = color; // Farbe übernehmen!

    container.appendChild(avatar);
  });
}

function setPriorityAddTask(priority) {
  const urgentBtn = document.querySelector(".priority-btn-urgent-addTask_template");
  const mediumBtn = document.querySelector(".priority-btn-medium-addTask_template");
  const lowBtn = document.querySelector(".priority-btn-low-addTask_template");

  urgentBtn.style.backgroundColor = "white";
  mediumBtn.style.backgroundColor = "white";
  lowBtn.style.backgroundColor = "white";
  urgentBtn.style.color = "black";
  mediumBtn.style.color = "black";
  lowBtn.style.color = "black";

  urgentBtn.querySelector("img").style.filter = "";
  mediumBtn.querySelector("img").style.filter =
    "brightness(0) saturate(100%) invert(68%) sepia(94%) saturate(312%) hue-rotate(360deg) brightness(101%) contrast(102%)";
  lowBtn.querySelector("img").style.filter = "";

  if (priority === "urgent") {
    urgentBtn.style.backgroundColor = "#ff3d00";
    urgentBtn.style.color = "white";
    urgentBtn.querySelector("img").style.filter = "brightness(0) invert(1)";
  } else if (priority === "medium") {
    mediumBtn.style.backgroundColor = "#ffa800";
    mediumBtn.style.color = "white";
    mediumBtn.querySelector("img").style.filter = "brightness(0) invert(1)";
  } else if (priority === "low") {
    lowBtn.style.backgroundColor = "#00c853";
    lowBtn.style.color = "white";
    lowBtn.querySelector("img").style.filter = "brightness(0) invert(1)";
  }

  window.currentPriority = priority;
  window.currentPrio = priority;
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("subtask-delete-addTask_template")) {
    const subtaskInput = document.getElementById("subtask");
    if (subtaskInput) subtaskInput.value = "";
  }

  if (e.target.classList.contains("subtask-check-addTask_template")) {
    const subtaskInput = document.getElementById("subtask");
    const subtaskList = document.getElementById("subtask-list");
    const value = subtaskInput.value.trim();

    if (value !== "") {
      const li = document.createElement("li");
      li.textContent = value;

      const actions = document.createElement("div");
      actions.classList.add("subtask-actions-addTask_template");
      actions.innerHTML = `
        <img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_template">
        <div class="subtask-divider-addTask_template"></div>
        <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_template">
      `;
      li.appendChild(actions);

      subtaskList.appendChild(li);
      subtaskInput.value = "";
    }
  }

  if (e.target.classList.contains("subtask-remove-addTask_template")) {
    const li = e.target.closest("li");
    if (li) li.remove();
  }

  if (e.target.classList.contains("subtask-edit-addTask_template")) {
    const li = e.target.closest("li");
    if (!li) return;
    const oldText = li.firstChild.textContent;
    li.innerHTML = "";

    const input = document.createElement("input");
    input.type = "text";
    input.value = oldText.trim();
    input.classList.add("task-subtask-addTask_template");

    const actions = document.createElement("div");
    actions.classList.add("subtask-actions-addTask_template");
    actions.innerHTML = `
      <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_template">
      <div class="subtask-divider-addTask_template"></div>
      <img src="../assets/img/check.svg" alt="Save subtask" class="subtask-save-addTask_template">
    `;

    li.appendChild(input);
    li.appendChild(actions);
  }

  if (e.target.classList.contains("subtask-save-addTask_template")) {
    const li = e.target.closest("li");
    const input = li.querySelector("input");
    const newText = input.value.trim();
    if (!newText) return;
    li.innerHTML = "";
    li.textContent = newText;

    const actions = document.createElement("div");
    actions.classList.add("subtask-actions-addTask_template");
    actions.innerHTML = `
      <img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_template">
      <div class="subtask-divider-addTask_template"></div>
      <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_template">
    `;
    li.appendChild(actions);
  }
});

function sanitizeDueDateInput(e) {
  const input = e.target;
  input.value = input.value.replace(/[^0-9/]/g, "").slice(0, 10);
}

function isValidDateFormat(dateString) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(dateString);
}

function isRealDate(dateString) {
  const [d, m, y] = dateString.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date &&
    date.getDate() === d &&
    date.getMonth() === m - 1 &&
    date.getFullYear() === y
  );
}

function validateDueDate() {
  const dueDateInput = document.getElementById("due-date");
  const errorMsg = document.getElementById("due-date-error");
  if (!dueDateInput || !errorMsg) return;

  const value = dueDateInput.value.trim();
  if (!value) {
    errorMsg.textContent = "This field is required.";
    dueDateInput.style.borderBottom = "1px solid red";
    return false;
  }

  if (!isValidDateFormat(value)) {
    errorMsg.textContent = "Use format dd/mm/yyyy.";
    dueDateInput.style.borderBottom = "1px solid red";
    return false;
  }

  if (!isRealDate(value)) {
    errorMsg.textContent = "Invalid date.";
    dueDateInput.style.borderBottom = "1px solid red";
    return false;
  }

  errorMsg.textContent = "";
  dueDateInput.style.borderBottom = "1px solid #d1d1d1";
  return true;
}