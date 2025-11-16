/* === script.js | Handles global task creation, priority, and status setup === */

/* === Global Status Configuration === */
window.STATUS = window.STATUS || {
  TODO: "todo",
  INPROGRESS: "in-progress",
  AWAIT: "await-feedback",
  DONE: "done",
};

window.nextTaskTargetStatus = window.nextTaskTargetStatus || window.STATUS.TODO;
window.currentPrio = window.currentPrio || "low";
window.selectedUserColors = window.selectedUserColors || {};


/* === Add Task Status Handling === */
if (!window.openAddTaskWithStatus) {
  window.openAddTaskWithStatus = function (status) {
    window.nextTaskTargetStatus = status || window.STATUS.TODO;
    if (typeof openAddTask === "function") openAddTask();
  };
}


if (!window.openAddTaskFromPlus) {
  window.openAddTaskFromPlus = function (e) {
    const s = e?.currentTarget?.dataset?.target || window.STATUS.TODO;
    window.openAddTaskWithStatus(s);
  };
}


/* === Category Mapping === */
function mapCategoryToType(value) {
  return value === "technical" ? "Technical Task" : "User Story";
}


/* === Assigned User Extraction === */
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


/* === Subtask Extraction === */
function getSubtasksSafe() {
  if (typeof getSubtasks === "function") return getSubtasks();
  const v = (document.getElementById("subtask")?.value || "").trim();
  return v ? [v] : [];
}


/* === Task ID Generation === */
function generateTaskId() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


/* === Collect Task Data from Form === */
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


/* === Create Task and Update Board === */
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


window.createTask = createTask;

window.currentPrio = window.currentPrio || "low";


/* === Priority Button Handling === */
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
