/**
 * @typedef {Object} AssignedUser
 * @property {string} name
 * @property {string} [img]
 * @property {string} [color]
 */
/**
 * @typedef {"todo"|"in-progress"|"await-feedback"|"done"} TaskStatus
 */
/**
 * @typedef {"urgent"|"medium"|"low"} TaskPriority
 */
/**
 * @typedef {Object} Task
 * @property {number|string} id
 * @property {string} title
 * @property {string} description
 * @property {string} type
 * @property {TaskStatus} status
 * @property {string} dueDate
 * @property {TaskPriority} priority
 * @property {string} [priorityIcon]
 * @property {number} subtasksDone
 * @property {number} subtasksTotal
 * @property {AssignedUser[]} assignedTo
 * @property {string[]} [subTasks]
 */

function readSubtasksFromForm() {
  let list = document.getElementById("subtask-list");
  if (!list) {
    return [];
  }
  return Array.from(list.querySelectorAll("li"))
    .map(function (li) {
      let input = li.querySelector("input");
      let raw = input
        ? input.value
        : (li.firstChild && li.firstChild.textContent) || li.textContent;
      return String(raw || "").trim();
    })
    .filter(Boolean);
}


function populateEditOverlay(task) {
  let content = document.getElementById("addtask-content");
  if (!content) {
    return;
  }
  fillBasicFields(content, task);
  hydrateAssignSection(task);
  fillSubtaskList(content, task);
  resetSubtaskInput(content);
  setupSubmitButton(content, task);
}

function fillBasicFields(content, task) {
  setEditHeading(content);
  fillTitleInput(content, task);
  fillDescriptionInput(content, task);
  fillDueDateInput(content, task);
  fillCategorySelect(content, task);
  setPriorityForEdit(task);
  prepareAssignedUsers(task);
}

function setEditHeading(content) {
  let heading = content.querySelector(".h1-addTask_template");
  if (heading) {
    heading.textContent = "Edit Task";
  }
}

function fillTitleInput(content, task) {
  let titleInput = content.querySelector("#title");
  if (!titleInput) {
    return;
  }
  titleInput.value = task.title || "";
  let inputEvent = new Event("input", { bubbles: true });
  titleInput.dispatchEvent(inputEvent);
}
function fillDescriptionInput(content, task) {
  let descriptionInput = content.querySelector("#description");
  if (!descriptionInput) {
    return;
  }
  descriptionInput.value = task.description || "";
}

function fillDueDateInput(content, task) {
  let dueDateInput = content.querySelector("#due-date");
  if (!dueDateInput) {
    return;
  }
  dueDateInput.value = task.dueDate || "";
  if (typeof validateDueDate === "function") {
    requestAnimationFrame(function () {
      validateDueDate();
    });
  }
}

function fillCategorySelect(content, task) {
  let categorySelect = content.querySelector("#category");
  if (!categorySelect) {
    return;
  }
  let typeString = String(task.type || "").toLowerCase();
  let value = typeString === "technical task" ? "technical" : "user-story";
  categorySelect.value = value;
}

function setPriorityForEdit(task) {
  let priority = String(task.priority || "low").toLowerCase();
  window.currentPrio = priority;
  if (typeof setPriorityAddTask === "function") {
    setPriorityAddTask(priority);
  }
}

function prepareAssignedUsers(task) {
  let assigned = task.assignedTo || [];
  let users = [];
  let colors = {};
  for (let i = 0; i < assigned.length; i++) {
    let person = assigned[i];
    if (person && person.name) {
      users.push(person.name);
      colors[person.name] = person.color || "#4589ff";
    }
  }
  window.selectedUsers = users;
  window.selectedUserColors = colors;
}

function fillSubtaskList(content, task) {
  let subtaskList = content.querySelector("#subtask-list");
  if (!subtaskList) {
    return;
  }
  subtaskList.innerHTML = "";
  let subtasks = task.subTasks || [];
  for (let i = 0; i < subtasks.length; i++) {
    let text = subtasks[i];
    if (text) {
      let item = buildSubtaskListItem(text);
      subtaskList.appendChild(item);
    }
  }
}

function resetSubtaskInput(content) {
  let subtaskInput = content.querySelector("#subtask");
  if (subtaskInput) {
    subtaskInput.value = "";
  }
}

function setupSubmitButton(content, task) {
  let submitBtn = content.querySelector(".btn-done-addTask_template");
  if (!submitBtn) {
    return;
  }
  submitBtn.removeAttribute("onclick");
  submitBtn.onclick = function () {
    saveTaskEdits(task.id);
  };
  submitBtn.innerHTML =
    'OK <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/check.svg" alt="Check icon" class="check-icon-addTask_template">';
}

/**
 * Normalizes subtask progress and syncs saved checkbox states.
 * @param {Task} task
 * @returns {void}
 */
function normaliseSubtaskProgress(task) {
  if (!task) {
    return;
  }
  updateSubtaskCounts(task);
  syncSavedCheckboxes(task);
}

function updateSubtaskCounts(task) {
  let total = Array.isArray(task.subTasks) ? task.subTasks.length : 0;
  task.subtasksTotal = total;
  let done = Math.min(Number(task.subtasksDone) || 0, total);
  task.subtasksDone = done;
}

function syncSavedCheckboxes(task) {
  if (!window.saved) {
    return;
  }
  let total = task.subtasksTotal || 0;
  let prev = Array.isArray(window.saved[task.id])
    ? window.saved[task.id]
    : [];
  let next = buildCheckboxArray(prev, total);
  window.saved[task.id] = next;
  saveCheckboxState();
}

function buildCheckboxArray(prev, total) {
  let next = prev.slice(0, total);
  while (next.length < total) {
    next.push(false);
  }
  return next;
}

function saveCheckboxState() {
  try {
    localStorage.setItem("checks", JSON.stringify(window.saved));
  } catch (e) {
  }
}


/**
 * Saves edits for an existing task.
 * @param {number|string} id
 * @returns {void}
 */
function saveTaskEdits(id) {
  let task = getTaskForEdit(id);
  if (!canEditTask(task)) {
    return;
  }
  let formData = readEditForm(task);
  if (!formData) {
    return;
  }
  applyEditsAndPersist(task, formData);
}

function canEditTask(task) {
  if (!task) {
    return false;
  }
  if (!checkDemoTask(task)) {
    return false;
  }
  return true;
}

function readEditForm(task) {
  let title = getTitleOrAlert();
  if (!title) {
    return null;
  }
  let dueDate = getDueDateOrAbort();
  if (dueDate === null) {
    return null;
  }
  let data = getEditFormData(task);
  if (!data) {
    return null;
  }
  data.title = title;
  data.dueDate = dueDate;
  return data;
}

function applyEditsAndPersist(task, data) {
  applyEditsToTask(task, data);
  normaliseSubtaskProgress(task);
  persistTasks();
  if (typeof render === "function") {
    render();
  }
  closeAddTask();
}


function getTaskForEdit(id) {
  if (!Array.isArray(window.tasks)) {
    alert("Task not found.");
    return null;
  }
  for (let i = 0; i < window.tasks.length; i++) {
    let t = window.tasks[i];
    if (t && t.id === id) {
      return t;
    }
  }
  alert("Task not found.");
  return null;
}

function checkDemoTask(task) {
  if (!task) {
    return false;
  }
  if (typeof isDemoTask === "function" && isDemoTask(task)) {
   showToast("Demo tasks can only be moved.", { variant: "error", duration: 1600 });
    return false;
  }
  return true;
}

function getTitleOrAlert() {
  let input = document.getElementById("title");
  if (!input) {
    alert("Title input not found.");
    return null;
  }
  let value = input.value.trim();
  if (!value) {
    alert("Please enter a title.");
    input.focus();
    return null;
  }
  return value;
}

function getDueDateOrAbort() {
  let input = document.getElementById("due-date");
  if (!input) {
    return "";
  }
  let value = input.value.trim();
  if (typeof validateDueDate === "function") {
    let ok = validateDueDate();
    if (!ok) {
      return null;
    }
  }
  return value;
}

function getEditFormData(task) {
  let description = getDescriptionValue();
  let categoryValue = getCategoryValue();
  let priority = getPriorityValue(task);
  let assigned = getAssignedValue(task);
  let subtasks = readSubtasksFromForm();
  return {
    description: description,
    categoryValue: categoryValue,
    priority: priority,
    assigned: assigned,
    subtasks: subtasks
  };
}

function getDescriptionValue() {
  let input = document.getElementById("description");
  if (!input) {
    return "";
  }
  return input.value.trim();
}

function getCategoryValue() {
  let select = document.getElementById("category");
  if (!select) {
    return "";
  }
  return select.value;
}

function getPriorityValue(task) {
  let base = "low";
  if (task && task.priority) {
    base = task.priority;
  }
  if (window.currentPrio) {
    base = window.currentPrio;
  }
  return String(base).toLowerCase();
}

function getAssignedValue(task) {
  if (typeof assignedToDataExtractSafe === "function") {
    return assignedToDataExtractSafe();
  }
  if (task && Array.isArray(task.assignedTo)) {
    return task.assignedTo;
  }
  return [];
}

function applyEditsToTask(task, data) {
  task.title = data.title;
  task.description = data.description;
  task.dueDate = data.dueDate;
  task.type =
  data.categoryValue === "technical" ? "Technical Task" : "User Story";
  task.priority = data.priority;
  task.priorityIcon = getPriorityIcon(data.priority, task.priorityIcon);
  task.assignedTo = data.assigned;
  task.subTasks = data.subtasks;
}

function getPriorityIcon(priority, fallbackIcon) {
  let icons = {
    urgent:
      "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg",
    medium:
      "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
    low:
      "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg"
  };
  if (icons[priority]) {
    return icons[priority];
  }
  return fallbackIcon || "";
}
/**
 * Starts editing a task by id.
 * @param {number|string} id
 * @returns {void}
 */
function startEditTask(id) {
  let task = getTaskForEdit(id);
  if (!task || !checkDemoTask(task)) {
    return;
  }
  prepareAssignedUsers(task);
  prepareEditState(task);
  openEditOverlay(task);
}
window.startEditTask = startEditTask;
/**
 * Sets global state for the task that is being edited.
 * @param {Task} task
 * @returns {void}
 */
function prepareEditState(task) {
  closeTaskModal();
  window.taskBeingEdited = task.id;
  window.nextTaskTargetStatus =
    task.status || (window.STATUS && window.STATUS.TODO) || "todo";
}
/**
 * Opens the Add Task overlay and fills it with task data.
 * @param {Task} task
 * @returns {void}
 */
function openEditOverlay(task) {
  if (typeof openAddTask !== "function") {
    return;
  }
  openAddTask();
  requestAnimationFrame(function () {
    populateEditOverlay(task);
  });
}

