/**
 * @typedef {"todo"|"in-progress"|"await-feedback"|"done"} TaskStatus
 */

/**
 * @typedef {"urgent"|"medium"|"low"} TaskPriority
 */

/**
 * @typedef {Object} AssignedUser
 * @property {string} name
 * @property {string} [color]
 * @property {string} [img]
 */

/**
 * @typedef {Object} Task
 * @property {string|number} id
 * @property {string} title
 * @property {string} description
 * @property {string} type
 * @property {TaskStatus} status
 * @property {string} dueDate
 * @property {TaskPriority|string} priority
 * @property {AssignedUser[]} assignedTo
 * @property {number} subtasksDone
 * @property {number} subtasksTotal
 * @property {string[]} subTasks
 */

/* === Global Status Configuration === */

/**
 * Global status enum used across board/addTask.
 * @type {{TODO: TaskStatus, INPROGRESS: TaskStatus, AWAIT: TaskStatus, DONE: TaskStatus}}
 */
window.STATUS = window.STATUS || {
  TODO: "todo",
  INPROGRESS: "in-progress",
  AWAIT: "await-feedback",
  DONE: "done",
};
/**
 * Next status a newly created task should receive.
 * @type {TaskStatus}
 */
window.nextTaskTargetStatus = window.nextTaskTargetStatus || window.STATUS.TODO;
/**
 * Current selected priority while creating/editing tasks.
 * @type {TaskPriority|string}
 */
window.currentPrio = window.currentPrio || "low";
/**
 * Map of userName -> color used for assignment avatars.
 * @type {Record<string, string>}
 */
window.selectedUserColors = window.selectedUserColors || {};


/**
 * Opens AddTask overlay and sets target status for the new task.
 * @param {TaskStatus} status
 * @returns {void}
 */
if (!window.openAddTaskWithStatus) {
  window.openAddTaskWithStatus = function (status) {
    window.nextTaskTargetStatus = status || window.STATUS.TODO;
    if (typeof openAddTask === "function") openAddTask();
  };
}

/**
 * Click handler for "+" buttons that open AddTask in a specific column.
 * @param {MouseEvent} e
 * @returns {void}
 */
if (!window.openAddTaskFromPlus) {
  window.openAddTaskFromPlus = function (e) {
    const s = e?.currentTarget?.dataset?.target || window.STATUS.TODO;
    window.openAddTaskWithStatus(s);
  };
}


/**
 * Maps category select value to task type label.
 * @param {string} value
 * @returns {string}
 */
function mapCategoryToType(value) {
  return value === "technical" ? "Technical Task" : "User Story";
}


/**
 * Safe wrapper for assignedToDataExtract().
 * If original extractor exists, it is used; otherwise DOM is read.
 * @returns {AssignedUser[]}
 */
function assignedToDataExtractSafe() {
  if (typeof assignedToDataExtract === "function")
    return assignedToDataExtract();
  const assigned = [];
  const avatars = document.querySelectorAll(
    "#assigned-avatars .assign-avatar-addTask_template, #assigned-avatars .assign-avatar-addTask_page"
  );
  avatars.forEach((el) => {
    const initials = el.textContent.trim();
    const dataName = el.dataset?.fullName;
    const nameFromList = (window.selectedUsers || []).find(
      (n) => n === dataName || (!dataName && n && n.startsWith(initials))
    );
    const fullName = dataName || nameFromList || initials;
    const color =
      el.dataset?.color ||
      (window.selectedUserColors && fullName
        ? window.selectedUserColors[fullName]
        : null) ||
      el.style.backgroundColor ||
      "#4589ff";
    assigned.push({ name: fullName, color });
  });
  return assigned;
}


/**
 * Safe wrapper for getSubtasks().
 * If original function exists, it is used; otherwise reads current input.
 * @returns {string[]}
 */
function getSubtasksSafe() {
  if (typeof getSubtasks === "function") return getSubtasks();
  const v = (document.getElementById("subtask")?.value || "").trim();
  return v ? [v] : [];
}


/**
 * Generates a unique task id.
 * Uses crypto.randomUUID() when available.
 * @returns {string}
 */
function generateTaskId() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


/**
 * Collects the task payload from AddTask form fields.
 * @returns {Task}
 */
function collectTaskFromForm() {
  const title = (document.getElementById("title")?.value || "").trim();
  const description = (
    document.getElementById("description")?.value || ""
  ).trim();
  const dueDate = (document.getElementById("due-date")?.value || "").trim();
  const categoryVal = document.getElementById("category")?.value || "";
  const subtasks = getSubtasksSafe();
  return {
    id: generateTaskId(),
    title,
    description,
    type: mapCategoryToType(categoryVal),
    status: window.nextTaskTargetStatus,
    dueDate,
    priority: window.currentPrio,
    assignedTo: assignedToDataExtractSafe(),
    subtasksDone: 0,
    subtasksTotal: subtasks.length,
    subTasks: subtasks,
  };
}


/**
 * Creates a new task from form values, pushes into window.tasks,
 * re-renders board, closes overlay and updates summary.
 * @param {Event} [event]
 * @returns {void}
 */
function createTask(event) {
  if (event && event.preventDefault) event.preventDefault();
  const task = collectTaskFromForm();
  if (!task.title) {
    alert("Bitte Titel eingeben!");
    return;
  }
  window.tasks = Array.isArray(window.tasks) ? window.tasks : [];
  window.tasks.push(task);
  if (typeof render === "function") render();
  if (typeof closeAddTask === "function") closeAddTask();
  window.nextTaskTargetStatus = window.STATUS.TODO;
  if (typeof updateSummary === "function") {
    updateSummary();
  }
}

/**
 * Exposes createTask globally.
 * @type {(event?: Event) => void}
 */
window.createTask = createTask;
/**
 * Current selected priority (fallback init).
 * @type {TaskPriority|string}
 */

window.currentPrio = window.currentPrio || "low";


/**
 * Sets current priority and updates active priority button styles.
 * @param {TaskPriority|string} prio
 * @returns {void}
 */
window.setPriority = function (prio) {
  window.currentPrio = String(prio || "low").toLowerCase();
  const wrap = document.querySelector(
    ".priority-group-addTask_template, .priority-group-addTask_page"
  );
  if (!wrap) return;
  wrap
    .querySelectorAll("button")
    .forEach((btn) => btn.classList.remove("active-prio"));
  const map = {
    urgent:
      ".priority-btn-urgent-addTask_template, .priority-btn-urgent-addTask_page",
    medium:
      ".priority-btn-medium-addTask_template, .priority-btn-medium-addTask_page",
    low: ".priority-btn-low-addTask_template,    .priority-btn-low-addTask_page",
  };
  const active = wrap.querySelector(map[window.currentPrio]);
  if (active) active.classList.add("active-prio");
};
