window.selectedUsers = window.selectedUsers || [];
window.isDropdownOpen = window.isDropdownOpen || false;

// === Title Validation ===
document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("title");
  if (!titleInput) return;
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
});

// === Hidden Date Picker (Reusable) ===
let hiddenDatePicker = document.createElement("input");
hiddenDatePicker.type = "date";
hiddenDatePicker.id = "hidden-date-picker";
hiddenDatePicker.name = "hidden-date-picker";
hiddenDatePicker.style.position = "fixed"; // an Feld-Position kleben
hiddenDatePicker.style.opacity = "0";
hiddenDatePicker.style.pointerEvents = "none";
hiddenDatePicker.style.height = "0";
hiddenDatePicker.style.width = "0";
hiddenDatePicker.style.zIndex = "1100";
document.body.appendChild(hiddenDatePicker);

// === Due Date Validation & Input Formatting ===
/**
 * Validates whether a string matches the date format dd/mm/yyyy.
 * @param {string} dateString - The input date string.
 * @returns {boolean} True if format is valid.
 */
function isValidDateFormat(dateString) {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(dateString);
}

/**
 * Sanitizes and formats the due date input into dd/mm/yyyy as the user types.
 * @param {InputEvent} e - The input event.
 */
function sanitizeDueDateInput(e) {
  let v = e.target.value.replace(/[^\d]/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) {
    v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4);
  } else if (v.length > 2) {
    v = v.slice(0, 2) + "/" + v.slice(2);
  }
  e.target.value = v;
}

/**
 * Validates the due date input field for format and real date values.
 * @returns {boolean} True if the due date is valid.
 */
function validateDueDate() {
  const dueDateInput = document.getElementById("due-date");
  if (!dueDateInput) return false;
  const parent = dueDateInput.parentElement;
  const wrapper = dueDateInput.closest(".date-input-wrapper-addTask_page");
  const errorMsg = wrapper.querySelector("#due-date-error");
  const value = dueDateInput.value.trim();
  if (value === "") {
    errorMsg.textContent = "This field is required.";
    parent.style.borderBottom = "1px solid red";
    return false;
  }
  if (!isValidDateFormat(value)) {
    errorMsg.textContent = "Please use format dd/mm/yyyy";
    parent.style.borderBottom = "1px solid red";
    return false;
  }
  if (!isRealDate(value)) {
    errorMsg.textContent = "Please enter a valid calendar date";
    parent.style.borderBottom = "1px solid red";
    return false;
  }
  errorMsg.textContent = "";
  parent.style.borderBottom = "1px solid #d1d1d1";
  return true;
}

/**
 * Opens the hidden native date picker and syncs the result
 * back into the visible due-date input as dd/mm/yyyy.
 * Der Picker „hängt“ an der Position des Due-Date-Feldes
 * (gelbe Linie).
 */
function openPickerSimple() {
  const dueInput = document.getElementById("due-date");
  if (!dueInput) return;

  const dateField =
  dueInput.closest(".date-field-addTask_page") || dueInput;
  const rect = dateField.getBoundingClientRect();
  hiddenDatePicker.style.pointerEvents = "auto";
  hiddenDatePicker.style.width = rect.width + "px";
  hiddenDatePicker.style.height = rect.height + "px";
  hiddenDatePicker.style.left = rect.left + "px";
  hiddenDatePicker.style.top = rect.top + "px";


  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  hiddenDatePicker.min = `${yyyy}-${mm}-${dd}`;

  hiddenDatePicker.removeAttribute("value");
  hiddenDatePicker.value = "";

  hiddenDatePicker.onchange = () => {
    hiddenDatePicker.style.pointerEvents = "none";
    if (!hiddenDatePicker.value) {
      dueInput.value = "";
      validateDueDate();
      return;
    }
    const [year, month, day] = hiddenDatePicker.value.split("-");
    dueInput.value = `${day}/${month}/${year}`;
    validateDueDate();
  };

  hiddenDatePicker.focus();
  setTimeout(() => {
    if (hiddenDatePicker.showPicker) {
      hiddenDatePicker.showPicker();
    } else {
      hiddenDatePicker.click();
    }
  }, 0);
}

window.openPickerSimple = openPickerSimple;

hiddenDatePicker.addEventListener("blur", () => {
  hiddenDatePicker.style.pointerEvents = "none";
});

// === Event-Handling ===
const dueDateInput = document.getElementById("due-date");
if (dueDateInput) {
  dueDateInput.addEventListener("input", (e) => {
    sanitizeDueDateInput(e);
    validateDueDate();
  });
  dueDateInput.addEventListener("blur", validateDueDate);
}

/**
 * Checks whether a date string represents a real calendar date.
 * @param {string} dateString - Date string in dd/mm/yyyy format.
 * @returns {boolean} True if the date exists on the calendar.
 */
function isRealDate(dateString) {
  const [day, month, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// === Priority Selection ===
/**
 * Sets the priority level for the task and applies visual styling.
 * @param {string} priority - One of "urgent", "medium", or "low".
 */
function setPriorityAddTask(priority) {
  const urgentBtn = document.querySelector(".priority-btn-urgent-addTask_page");
  const mediumBtn = document.querySelector(".priority-btn-medium-addTask_page");
  const lowBtn = document.querySelector(".priority-btn-low-addTask_page");

  urgentBtn.style.backgroundColor = "white";
  mediumBtn.style.backgroundColor = "white";
  lowBtn.style.backgroundColor = "white";
  urgentBtn.style.color = "black";
  mediumBtn.style.color = "black";
  lowBtn.style.color = "black";

  urgentBtn.querySelector("img").style.filter = "";
  mediumBtn.querySelector("img").style.filter =
    "brightness(0) saturate(100%) invert(68%) sepia(94%) saturate(312%) hue-rotate(360deg) brightness(101%) contrast(102%)"; // orange
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

// === Subtask Delete ===
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("subtask-delete-addTask_page")) {
    const subtaskInput = document.getElementById("subtask");
    if (subtaskInput) {
      subtaskInput.value = "";
    }
  }
});

// === Subtask Add ===
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("subtask-check-addTask_page")) {
    const subtaskInput = document.getElementById("subtask");
    const subtaskList = document.getElementById("subtask-list");
    const value = subtaskInput.value.trim();

    if (value !== "") {
      const li = document.createElement("li");
      li.textContent = value;

      const actions = document.createElement("div");
      actions.classList.add("subtask-actions-addTask_page");
      actions.innerHTML = `
        <img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_page">
        <div class="subtask-divider-addTask_page"></div>
        <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page">
      `;
      li.appendChild(actions);

      subtaskList.appendChild(li);
      subtaskInput.value = "";
    }
  }
});

// === Subtask Remove ===
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("subtask-remove-addTask_page")) {
    const li = e.target.closest("li");
    if (li) li.remove();
  }
});

// === Subtask Edit (Beginner-friendly, in-place editing) ===
function enableSubtaskEditing(e) {
  if (!e.target.classList.contains("subtask-edit-addTask_page")) return;
  const li = e.target.closest("li");
  if (!li) return;
  const oldText = li.firstChild.textContent;
  li.innerHTML = "";
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldText.trim();
  input.classList.add("task-subtask-addTask_page");
  input.name = "subtask-edit";
  input.setAttribute("aria-label", "Edit subtask");
  const actions = document.createElement("div");
  actions.classList.add("subtask-actions-addTask_page");
  actions.innerHTML = `
    <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page">
    <div class="subtask-divider-addTask_page"></div>
    <img src="../assets/img/check.svg" alt="Save subtask" class="subtask-save-addTask_page">
  `;

  li.appendChild(input);
  li.appendChild(actions);
}

document.addEventListener("click", enableSubtaskEditing);

// === Subtask Save ===
function saveEditedSubtask(e) {
  if (!e.target.classList.contains("subtask-save-addTask_page")) return;

  const li = e.target.closest("li");
  if (!li) return;

  const input = li.querySelector("input");
  if (!input) return;

  const newText = input.value.trim();
  if (newText === "") return;

  li.innerHTML = "";
  li.textContent = newText;

  const actions = document.createElement("div");
  actions.classList.add("subtask-actions-addTask_page");
  actions.innerHTML = `
    <img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_page">
    <div class="subtask-divider-addTask_page"></div>
    <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page">
  `;
  li.appendChild(actions);
}

document.addEventListener("click", saveEditedSubtask);

// === Form Reset ===
function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("due-date").value = "";
  document.getElementById("subtask").value = "";
  document.getElementById("subtask-list").innerHTML = "";
  document.getElementById("assigned-avatars").innerHTML = "";

  const category = document.getElementById("category");
  if (category) category.selectedIndex = 0;

  document
    .querySelectorAll(".priority-group-addTask_page button")
    .forEach((btn) => {
      btn.style.backgroundColor = "white";
      btn.style.color = "black";
      const img = btn.querySelector("img");
      if (img) img.style.filter = "";
    });
  setPriorityAddTask("medium");

  selectedUsers = [];
  const placeholder = document.querySelector(
    ".assign-placeholder-addTask_page"
  );
  placeholder.textContent = "Select contact to assign";
  placeholder.style.color = "black";
  document
    .querySelectorAll(".assign-check-addTask_page")
    .forEach((cb) => (cb.checked = false));

  document.querySelectorAll(".error-text").forEach((e) => (e.textContent = ""));
}

// === Toast (GLOBAL) ===
function showToast(text, { variant = "ok", duration = 1000 } = {}) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  const el = document.createElement("div");
  el.className =
    "toast toast--show" + (variant === "error" ? " toast--error" : "");
  el.innerHTML = `<span>${text}</span><span class="toast-icon" aria-hidden="true"></span>`;
  root.appendChild(el);

  setTimeout(() => {
    el.classList.remove("toast--show");
    el.classList.add("toast--hide");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }, duration);
}

window.showToast = showToast;

// === Create Task ===
async function createTask() {
  const title = (document.getElementById("title")?.value || "").trim();
  if (!title) {
    showToast("Please enter a title", { variant: "error", duration: 1600 });
    return;
  }
  const dueDate = (document.getElementById("due-date")?.value || "").trim();
  if (!dueDate) {
    showToast("Please enter a due date", { variant: "error", duration: 1600 });
    return;
  }
  if (!isValidDateFormat(dueDate) || !isRealDate(dueDate)) {
    showToast("Please enter a valid date in format dd/mm/yyyy", {
      variant: "error",
      duration: 1600,
    });
    return;
  }
  const description =
    (document.getElementById("description")?.value || "").trim();
  const category = (document.getElementById("category")?.value || "").trim();
  if (!category) {
    showToast("Please select a category.", {
      variant: "error",
      duration: 1600,
    });
    return;
  }
  const priority = (window.currentPrio || "medium").toLowerCase();

  const priorityIcons = {
    urgent:
      "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg",
    medium:
      "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
    low: "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg",
  };
  let priorityIcon = priorityIcons[priority] || priorityIcons.low;

  const assignedTo = (window.selectedUsers || []).map((name) => {
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
    return { name, color };
  });
  const subtaskItems = document.querySelectorAll("#subtask-list li");
  const subTasks = Array.from(subtaskItems).map((li) => li.textContent.trim());
  const subtasksTotal = subTasks.length;
  const statusTarget = window.nextTaskTargetStatus || "todo";
  const task = {
    id: Date.now(),
    title,
    description,
    dueDate,
    priority,
    priorityIcon,
    status: statusTarget,
    type: category === "technical" ? "Technical Task" : "User Story",
    subTasks,
    subtasksDone: 0,
    subtasksTotal,
    assignedTo,
  };
  try {
    await saveTask(task.id, task);
    showToast("Task added to board", { duration: 1600 });
    setTimeout(() => {
      window.location.href = "../board_code/board.html";
    }, 1700);
  } catch (error) {
    console.error("Error saving task:", error);
    showToast("Error saving task", { variant: "error", duration: 2000 });
  }
}

window.createTask = createTask;
