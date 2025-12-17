/**
 * @type {{TODO:"todo",INPROGRESS:"in-progress",AWAIT:"await-feedback",DONE:"done"}}
 */
window.STATUS = window.STATUS || {
  TODO: "todo",
  INPROGRESS: "in-progress",
  AWAIT: "await-feedback",
  DONE: "done",
};

/** @type {"todo"|"in-progress"|"await-feedback"|"done"} */
window.nextTaskTargetStatus = window.nextTaskTargetStatus || window.STATUS.TODO;
/** @type {"urgent"|"medium"|"low"|string} */
window.currentPrio = window.currentPrio || "low";
/** @type {Record<string,string>} */
window.selectedUserColors = window.selectedUserColors || {};

/**
 * Opens AddTask overlay and sets target status for the new task.
 * @param {"todo"|"in-progress"|"await-feedback"|"done"} status
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
 * Reads avatar color for a given name from the assign list (page).
 * @param {string} fullName
 * @returns {string}
 */
function getDomColorForName(fullName) {
  for (const item of document.querySelectorAll(".assign-item-addTask_page")) {
    const label = item
      .querySelector(".assign-name-addTask_page")
      ?.textContent.trim();
    if (label !== fullName) continue;
    const avatar = item.querySelector(".assign-avatar-addTask_page");
    if (avatar?.style?.backgroundColor) return avatar.style.backgroundColor;
  }
  return "";
}

/**
 * Builds AssignedUser objects from selected user names.
 * @param {string[]} names
 * @returns {{name:string,color:string}[]}
 */
function buildAssignedFromNames(names) {
  const colors = window.selectedUserColors || {};
  return names.map((name) => {
    const domColor = colors[name] || getDomColorForName(name) || "#4589ff";
    return { name, color: domColor };
  });
}

/**
 * Builds AssignedUser objects from rendered avatar elements.
 * @returns {{name:string,color:string}[]}
 */
function buildAssignedFromAvatars() {
  const out = [],
    users = window.selectedUsers || [],
    colors = window.selectedUserColors || {};
  for (const el of document.querySelectorAll(
    "#assigned-avatars .assign-avatar-addTask_template, #assigned-avatars .assign-avatar-addTask_page"
  )) {
    const initials = el.textContent.trim(),
      dataName = el.dataset?.fullName;
    const fromList = users.find(
      (n) => n === dataName || (!dataName && n && n.startsWith(initials))
    );
    const fullName = dataName || fromList || initials;
    const color =
      el.dataset?.color ||
      colors[fullName] ||
      el.style.backgroundColor ||
      "#4589ff";
    out.push({ name: fullName, color });
  }
  return out;
}

/**
 * Safe wrapper for assignedToDataExtract().
 * @returns {{name:string,color?:string,img?:string}[]}
 */
function assignedToDataExtractSafe() {
  if (typeof assignedToDataExtract === "function")
    return assignedToDataExtract();
  const names = Array.isArray(window.selectedUsers)
    ? window.selectedUsers.slice()
    : [];
  return names.length
    ? buildAssignedFromNames(names)
    : buildAssignedFromAvatars();
}

/**
 * Safe wrapper for getSubtasks().
 * @returns {string[]}
 */
function getSubtasksSafe() {
  if (typeof getSubtasks === "function") return getSubtasks();
  const v = (document.getElementById("subtask")?.value || "").trim();
  return v ? [v] : [];
}

/**
 * Generates a unique task id.
 * @returns {string}
 */
function generateTaskId() {
  return typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Collects the task payload from AddTask form fields.
 * @returns {{
 *   id:string,title:string,description:string,type:string,status:string,dueDate:string,priority:string,
 *   assignedTo:{name:string,color?:string,img?:string}[],subtasksDone:number,subtasksTotal:number,subTasks:string[]
 * }}
 */
function collectTaskFromForm() {
  const title = (document.getElementById("title")?.value || "").trim();
  const description = (
    document.getElementById("description")?.value || ""
  ).trim();
  const dueDate = (document.getElementById("due-date")?.value || "").trim();
  const categoryVal = document.getElementById("category")?.value || "";
  const subTasks = getSubtasksSafe();
  return {
    id: generateTaskId(), title, description, type: mapCategoryToType(categoryVal), status: window.nextTaskTargetStatus,
    dueDate, priority: window.currentPrio, assignedTo: assignedToDataExtractSafe(), subtasksDone: 0, subtasksTotal: subTasks.length, subTasks,
  };
}

/**
 * Creates a new task from form values and updates UI.
 * @param {Event} [event]
 * @returns {void}
 */
function createTask(event) {
  if (event?.preventDefault) event.preventDefault();
  const task = collectTaskFromForm();
  if (!task.title) return alert("Bitte Titel eingeben!");
  window.tasks = Array.isArray(window.tasks) ? window.tasks : [];
  window.tasks.push(task);
  if (typeof render === "function") render();
  if (typeof closeAddTask === "function") closeAddTask();
  window.nextTaskTargetStatus = window.STATUS.TODO;
  if (typeof updateSummary === "function") updateSummary();
}

/**
 * Exposes createTask globally.
 * @type {(event?: Event) => void}
 */
window.createTask = createTask;

/**
 * Sets current priority and updates active priority button styles.
 * @param {"urgent"|"medium"|"low"|string} prio
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
    .forEach((b) => b.classList.remove("active-prio"));
  const map = {
    urgent:
      ".priority-btn-urgent-addTask_template, .priority-btn-urgent-addTask_page",
    medium:
      ".priority-btn-medium-addTask_template, .priority-btn-medium-addTask_page",
    low: ".priority-btn-low-addTask_template, .priority-btn-low-addTask_page",
  };
  const active = wrap.querySelector(map[window.currentPrio]);
  if (active) active.classList.add("active-prio");
};
