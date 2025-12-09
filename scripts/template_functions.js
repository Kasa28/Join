/**
 * @typedef {Object} AssignedUser
 * @property {string} name
 * @property {string} [img]
 * @property {string} [color]
 */

/**
 * @typedef {"urgent"|"medium"|"low"} TaskPriority
 */

/**
 * @typedef {Object} Task
 * @property {number|string} id
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [dueDate]
 * @property {TaskPriority|string} [priority]
 * @property {string} [priorityIcon]
 * @property {string} [type]
 * @property {AssignedUser[]} [assignedTo]
 * @property {string[]} [subTasks]
 * @property {number} [subtasksDone]
 * @property {number} [subtasksTotal]
 */

/**
 * @typedef {Object} DynamicBigCardData
 * @property {number|string} id
 * @property {string} title
 * @property {string} description
 * @property {string} dueDate
 * @property {string} priority
 * @property {string} priorityIcon
 * @property {string} type
 * @property {string} assignedHTML
 * @property {string} subtasksHTML
 */

/**
 * @typedef {DynamicBigCardData & { priorityText?: string }} DynamicTechnicalBigCardData
 */

/**
 * Builds and returns the dynamic big card HTML for user-story tasks.
 * Uses helper functions to build assigned users and subtasks HTML.
 * @param {Task} t
 * @returns {string} HTML string for the big user-story card.
 */
function bigCardDynamicHtml(t) {
  const base = getBaseCardData(t);
  const assignedHTML = buildAssignedUserStoryHTML(t.assignedTo);
  const subtasksHTML = buildSubtasksUserStoryHTML(t);
  base.assignedHTML = assignedHTML;
  base.subtasksHTML = subtasksHTML;
  return getBigCardDynamicHtml(base);
}

/**
 * Builds and returns the dynamic big card HTML for technical tasks.
 * Adds priorityText and uses technical helpers for HTML parts.
 * @param {Task} t
 * @returns {string} HTML string for the big technical-task card.
 */
function bigCardDynamicTechnicalHtml(t) {
  const base = getBaseCardData(t);
  const assignedHTML = buildAssignedTechnicalHTML(t.assignedTo);
  const subtasksHTML = buildSubtasksTechnicalHTML(t);
  base.priorityText =
    base.priority.charAt(0).toUpperCase() + base.priority.slice(1);
  base.assignedHTML = assignedHTML;
  base.subtasksHTML = subtasksHTML;
  return getBigCardDynamicTechnicalHtml(base);
}

const PRIORITY_ICONS = {
  urgent: "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg",
  medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
  low: "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg"
};

function getBaseCardData(t) {
  const data = {};
  data.id = t.id;
  data.title = t.title || "No title";
  data.description = t.description || "No description provided.";
  data.dueDate = t.dueDate || "No due date";
  data.priority = (t.priority || "low").toLowerCase();
  data.priorityIcon = t.priorityIcon ||
    PRIORITY_ICONS[data.priority] || PRIORITY_ICONS.low;
  data.type = t.type || "User Story";
  return data;
}

function getInitials(name) {
  const text = String(name || "").trim();
  const parts = text.split(" ");
  let letters = "";
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      letters += parts[i][0].toUpperCase();
    }
  }
  if (!letters) {
    letters = "?";
  }
  return letters;
}

function buildAssignedUserStoryHTML(assignedTo) {
  const list = assignedTo || [];
  if (!list.length) { return "<p>No one assigned.</p>"; }
  let html = "";
  for (let i = 0; i < list.length; i++) {
    const user = list[i], initials = getInitials(user.name);
    const bg = user.color ? "background-color:" + user.color + ";" : "";
    html += '<div class="user-badge_user-story">' +
      '<span class="span-user-badge_user-story" style="' + bg + '">' +
      initials +
      '</span><p class="p-user-badge_user-story">' +
      user.name + "</p></div>";
  }
  return html;
}

function buildAssignedTechnicalHTML(assignedTo) {
  const list = assignedTo || [];
  if (!list.length) {
    return '<p class="description-font-technical-task">No one assigned.</p>';
  }
  let html = "";
  for (let i = 0; i < list.length; i++) {
    const user = list[i], initials = getInitials(user.name);
    const bg = user.color
      ? ' style="background-color:' + user.color + ';"'
      : "";
    html += '<div class="user-container-technical-task"><div class="user-badge-and-name">' +
      '<div class="name-letter-ball-technical-task"' + bg + '>' +
      '<span class="name-letter-ball-font-technical-task name-letter-ball-font-position-technical-task">' +
      initials +
      '</span></div><span class="a-user-bagde-font-position-technical-task">' +
      user.name +
      '</span></div><input type="checkbox" class="checkbox-technical-task border-white-technical-task" disabled></div>';
  }
  return html;
}

function buildSubtasksUserStoryHTML(t) {
  const list = t.subTasks || [];
  if (!list.length) { return "<p>No subtasks added.</p>"; }
  let html = "";
  const done = t.subtasksDone || 0;
  for (let i = 0; i < list.length; i++) {
    const sub = list[i], checked = i < done ? "checked" : "";
    html += '<label class="label_user-story">' +
      '<input type="checkbox" class="checkbox_user-story" ' +
      'onchange="updateSubtasks(' + t.id + ', this)" ' + checked + ">" +
      sub + "</label>";
  }
  return html;
}

function buildSubtasksTechnicalHTML(t) {
  const list = t.subTasks || [];
  if (!list.length) {
    return '<p class="description-font-technical-task">No subtasks added.</p>';
  }
  let html = "";
  const done = t.subtasksDone || 0;
  for (let i = 0; i < list.length; i++) {
    const sub = list[i], checked = i < done ? "checked" : "";
    html += '<label class="label-font-technical-task">' +
      '<input type="checkbox" class="checkbox-technical-task border-blue-technical-task" ' +
      'onchange="updateSubtasks(' + t.id + ', this)" ' + checked + ">" +
      sub + "</label>";
  }
  return html;
}
