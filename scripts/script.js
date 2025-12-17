/**
 * Opens AddTask overlay and sets target status for the new task.
 * @param {TaskStatus} targetStatus
 * @returns {void}
 */
if (!window.openAddTaskWithStatus) {
  window.openAddTaskWithStatus = function (targetStatus) {
    window.nextTaskTargetStatus = targetStatus || window.STATUS.TODO;
    if (typeof openAddTask === "function") openAddTask();
  };
}

/**
 * Click handler for "+" buttons that open AddTask in a specific column.
 * @param {MouseEvent} ev
 * @returns {void}
 */
if (!window.openAddTaskFromPlus) {
  window.openAddTaskFromPlus = function (ev) {
    const s = ev?.currentTarget?.dataset?.target || window.STATUS.TODO;
    window.openAddTaskWithStatus(s);
  };
}

/**
 * Maps category select value to task type label.
 * @param {string} categoryValue
 * @returns {string}
 */
function mapCategoryToType(categoryValue) {
  return categoryValue === "technical" ? "Technical Task" : "User Story";
}

/**
 * Creates a new task from form values, pushes into window.tasks,
 * re-renders board, closes overlay and updates summary.
 * @param {Event} [ev]
 * @returns {void}
 */
function createTask(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  const task = collectTaskFromForm();
  if (!task.title) {
    alert("Please enter a title!");
    return;
  }
  window.tasks = Array.isArray(window.tasks) ? window.tasks : [];
  window.tasks.push(task);
  if (typeof render === "function") render();
  if (typeof closeAddTask === "function") closeAddTask();
  window.nextTaskTargetStatus = window.STATUS.TODO;
  if (typeof updateSummary === "function") updateSummary();
}

/**
 * Sets current priority and updates active priority button styles.
 * @param {TaskPriority|string} priority
 * @returns {void}
 */
window.setPriority = function (priority) {
  window.currentPrio = String(priority || "low").toLowerCase();
  const wrap = document.querySelector(
    ".priority-group-addTask_template, .priority-group-addTask_page"
  );
  if (!wrap) return;
  wrap.querySelectorAll("button").forEach((btn) => btn.classList.remove("active-prio"));
  const map = {
    urgent: ".priority-btn-urgent-addTask_template, .priority-btn-urgent-addTask_page",
    medium: ".priority-btn-medium-addTask_template, .priority-btn-medium-addTask_page",
    low: ".priority-btn-low-addTask_template,    .priority-btn-low-addTask_page",
  };
  const active = wrap.querySelector(map[window.currentPrio]);
  if (active) active.classList.add("active-prio");
};
