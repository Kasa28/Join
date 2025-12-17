/** Reads subtasks from the subtask list in the edit form. @returns {string[]} */
function readSubtasksFromForm() {
  let list = document.getElementById("subtask-list"); if (!list) return [];
  return Array.from(list.querySelectorAll("li")).map(function (li) {
    let input = li.querySelector("input");
    let raw = input ? input.value : (li.firstChild && li.firstChild.textContent) || li.textContent;
    return String(raw || "").trim();
  }).filter(Boolean);
}

/** Populates the edit overlay with a task's data. @param {Object} task @returns {void} */
function populateEditOverlay(task) {
  let content = document.getElementById("addtask-content"); if (!content) return;
  fillBasicFields(content, task); hydrateAssignSection(task); fillSubtaskList(content, task);
  resetSubtaskInput(content); setupSubmitButton(content, task);
}

/** Fills all basic form fields for the edit overlay. @param {HTMLElement} content @param {Object} task @returns {void} */
function fillBasicFields(content, task) {
  setEditHeading(content); fillTitleInput(content, task); fillDescriptionInput(content, task);
  fillDueDateInput(content, task); fillCategorySelect(content, task); setPriorityForEdit(task); prepareAssignedUsers(task);
}

/** Updates the overlay heading text for edit mode. @param {HTMLElement} content @returns {void} */
function setEditHeading(content) {
  let heading = content.querySelector(".h1-addTask_template"); if (heading) heading.textContent = "Edit Task";
}

/** Fills the title input with the task title and triggers input event. @param {HTMLElement} content @param {Object} task @returns {void} */
function fillTitleInput(content, task) {
  let titleInput = content.querySelector("#title"); if (!titleInput) return;
  titleInput.value = task.title || ""; titleInput.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Fills the description input with the task description. @param {HTMLElement} content @param {Object} task @returns {void} */
function fillDescriptionInput(content, task) {
  let descriptionInput = content.querySelector("#description"); if (!descriptionInput) return;
  descriptionInput.value = task.description || "";
}

/** Fills the due date input and triggers validation if available. @param {HTMLElement} content @param {Object} task @returns {void} */
function fillDueDateInput(content, task) {
  let dueDateInput = content.querySelector("#due-date"); if (!dueDateInput) return;
  dueDateInput.value = task.dueDate || "";
  if (typeof validateDueDate === "function") requestAnimationFrame(function () { validateDueDate(); });
}

/** Sets the category select value based on the task type. @param {HTMLElement} content @param {Object} task @returns {void} */
function fillCategorySelect(content, task) {
  let categorySelect = content.querySelector("#category"); if (!categorySelect) return;
  let typeString = String(task.type || "").toLowerCase();
  categorySelect.value = typeString === "technical task" ? "technical" : "user-story";
}

/** Sets priority for edit mode (global prio + UI update if available). @param {Object} task @returns {void} */
function setPriorityForEdit(task) {
  let priority = String(task.priority || "low").toLowerCase(); window.currentPrio = priority;
  if (typeof setPriorityAddTask === "function") setPriorityAddTask(priority);
}

/** Prepares selected users + user colors for the assign UI. @param {Object} task @returns {void} */
function prepareAssignedUsers(task) {
  let assigned = task.assignedTo || [], users = [], colors = {};
  for (let i = 0; i < assigned.length; i++) {
    let person = assigned[i];
    if (person && person.name) { users.push(person.name); colors[person.name] = person.color || "#4589ff"; }
  }
  window.selectedUsers = users; window.selectedUserColors = colors;
}

/** Renders the current task subtasks into the subtask list. @param {HTMLElement} content @param {Object} task @returns {void} */
function fillSubtaskList(content, task) {
  let subtaskList = content.querySelector("#subtask-list"); if (!subtaskList) return;
  subtaskList.innerHTML = ""; let subtasks = task.subTasks || [];
  for (let i = 0; i < subtasks.length; i++) {
    let text = subtasks[i];
    if (text) { let item = buildSubtaskListItem(text); subtaskList.appendChild(item); }
  }
}

/** Resets the subtask input field in the overlay. @param {HTMLElement} content @returns {void} */
function resetSubtaskInput(content) {
  let subtaskInput = content.querySelector("#subtask"); if (subtaskInput) subtaskInput.value = "";
}

/** Replaces submit behavior to save edits for the given task. @param {HTMLElement} content @param {Object} task @returns {void} */
function setupSubmitButton(content, task) {
  let submitBtn = content.querySelector(".btn-done-addTask_template"); if (!submitBtn) return;
  submitBtn.removeAttribute("onclick"); submitBtn.onclick = function () { saveTaskEdits(task.id); };
  submitBtn.innerHTML = 'OK <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/check.svg" alt="Check icon" class="check-icon-addTask_template">';
}

/** Normalizes subtask progress and syncs saved checkbox states. @param {Object} task @returns {void} */
function normaliseSubtaskProgress(task) {
  if (!task) return; updateSubtaskCounts(task); syncSavedCheckboxes(task);
}

/** Updates subtasksTotal and clamps subtasksDone to valid range. @param {Object} task @returns {void} */
function updateSubtaskCounts(task) {
  let total = Array.isArray(task.subTasks) ? task.subTasks.length : 0; task.subtasksTotal = total;
  let done = Math.min(Number(task.subtasksDone) || 0, total); task.subtasksDone = done;
}

/** Syncs saved checkbox array length with current subtasks total and persists it. @param {Object} task @returns {void} */
function syncSavedCheckboxes(task) {
  if (!window.saved) return;
  let total = task.subtasksTotal || 0;
  let prev = Array.isArray(window.saved[task.id]) ? window.saved[task.id] : [];
  window.saved[task.id] = buildCheckboxArray(prev, total); saveCheckboxState();
}

/** Builds a checkbox state array matching the given total count. @param {boolean[]} prev @param {number} total @returns {boolean[]} */
function buildCheckboxArray(prev, total) {
  let next = prev.slice(0, total); while (next.length < total) next.push(false); return next;
}

/** Persists checkbox state into localStorage. @returns {void} */
function saveCheckboxState() {
  try { localStorage.setItem("checks", JSON.stringify(window.saved)); } catch (e) {}
}

/** Saves edits for an existing task. @param {number|string} id @returns {void} */
function saveTaskEdits(id) {
  let task = getTaskForEdit(id); if (!canEditTask(task)) return;
  let formData = readEditForm(task); if (!formData) return; applyEditsAndPersist(task, formData);
}

/** Checks whether the given task can be edited. @param {Object|null} task @returns {boolean} */
function canEditTask(task) {
  if (!task) return false; if (!checkDemoTask(task)) return false; return true;
}

/** Reads and validates edit form values and returns a data object. @param {Object} task @returns {Object|null} */
function readEditForm(task) {
  let title = getTitleOrAlert(); if (!title) return null;
  let dueDate = getDueDateOrAbort(); if (dueDate === null) return null;
  let data = getEditFormData(task); if (!data) return null;
  data.title = title; data.dueDate = dueDate; return data;
}

/** Applies edits, normalizes subtasks, persists tasks and closes overlay. @param {Object} task @param {Object} data @returns {void} */
function applyEditsAndPersist(task, data) {
  applyEditsToTask(task, data); normaliseSubtaskProgress(task); persistTasks();
  if (typeof render === "function") render(); closeAddTask();
}

/** Finds a task by id from window.tasks or alerts if not found. @param {number|string} id @returns {Object|null} */
function getTaskForEdit(id) {
  if (!Array.isArray(window.tasks)) { alert("Task not found."); return null; }
  for (let i = 0; i < window.tasks.length; i++) { let t = window.tasks[i]; if (t && t.id === id) return t; }
  alert("Task not found."); return null;
}

/** Blocks editing for demo tasks and shows a toast message. @param {Object} task @returns {boolean} */
function checkDemoTask(task) {
  if (!task) return false;
  if (typeof isDemoTask === "function" && isDemoTask(task)) {
    showToast("Demo tasks can only be moved.", { variant: "error", duration: 1600 });
    return false;
  }
  return true;
}

/** Gets the title from input or alerts and focuses the input if missing. @returns {string|null} */
function getTitleOrAlert() {
  let input = document.getElementById("title");
  if (!input) { alert("Title input not found."); return null; }
  let value = input.value.trim();
  if (!value) { alert("Please enter a title."); input.focus(); return null; }
  return value;
}

/** Gets the due date and optionally validates it; returns null if validation fails. @returns {string|null} */
function getDueDateOrAbort() {
  let input = document.getElementById("due-date"); if (!input) return "";
  let value = input.value.trim();
  if (typeof validateDueDate === "function") { let ok = validateDueDate(); if (!ok) return null; }
  return value;
}

/** Collects edit form data (description, category, priority, assigned users, subtasks). @param {Object} task @returns {Object} */
function getEditFormData(task) {
  let description = getDescriptionValue(), categoryValue = getCategoryValue();
  let priority = getPriorityValue(task), assigned = getAssignedValue(task), subtasks = readSubtasksFromForm();
  return { description: description, categoryValue: categoryValue, priority: priority, assigned: assigned, subtasks: subtasks };
}

/** Reads the description input value. @returns {string} */
function getDescriptionValue() {
  let input = document.getElementById("description"); if (!input) return ""; return input.value.trim();
}

/** Reads the category select value. @returns {string} */
function getCategoryValue() {
  let select = document.getElementById("category"); if (!select) return ""; return select.value;
}

/** Resolves the priority value from task + global state and normalizes to lowercase. @param {Object} task @returns {string} */
function getPriorityValue(task) {
  let base = "low"; if (task && task.priority) base = task.priority; if (window.currentPrio) base = window.currentPrio;
  return String(base).toLowerCase();
}

/** Extracts assigned users from UI if available, otherwise uses task data. @param {Object} task @returns {Array} */
function getAssignedValue(task) {
  if (typeof assignedToDataExtractSafe === "function") return assignedToDataExtractSafe();
  if (task && Array.isArray(task.assignedTo)) return task.assignedTo; return [];
}

/** Applies the collected form data to the task object. @param {Object} task @param {Object} data @returns {void} */
function applyEditsToTask(task, data) {
  task.title = data.title; task.description = data.description; task.dueDate = data.dueDate;
  task.type = data.categoryValue === "technical" ? "Technical Task" : "User Story";
  task.priority = data.priority; task.priorityIcon = getPriorityIcon(data.priority, task.priorityIcon);
  task.assignedTo = data.assigned; task.subTasks = data.subtasks;
}

/** Returns the priority icon path for a given priority value. @param {string} priority @param {string} fallbackIcon @returns {string} */
function getPriorityIcon(priority, fallbackIcon) {
  let icons = {
    urgent: "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg",
    medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
    low: "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg",
  };
  if (icons[priority]) return icons[priority]; return fallbackIcon || "";
}

/** Starts editing a task by id. @param {number|string} id @returns {void} */
function startEditTask(id) {
  let task = getTaskForEdit(id); if (!task || !checkDemoTask(task)) return;
  prepareAssignedUsers(task); prepareEditState(task); openEditOverlay(task);
}
window.startEditTask = startEditTask;

/** Sets global state for the task that is being edited. @param {Object} task @returns {void} */
function prepareEditState(task) {
  closeTaskModal(); window.taskBeingEdited = task.id;
  window.nextTaskTargetStatus = task.status || (window.STATUS && window.STATUS.TODO) || "todo";
}

/** Opens the Add Task overlay and fills it with task data. @param {Object} task @returns {void} */
function openEditOverlay(task) {
  if (typeof openAddTask !== "function") return;
  openAddTask(); requestAnimationFrame(function () { populateEditOverlay(task); });
}
