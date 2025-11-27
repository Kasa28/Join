/* === board_modals_core.js | Handles opening and closing of task and add-task modals === */

/**
 * Opens the task modal for a given task ID.
 * Looks up the task, collects DOM elements and delegates opening.
 * @param {number} id - Task ID to open in the modal.
 */
function openModalById(id) {
  const task = findTaskById(id);
  if (!task) {
    return;
  }
  const els = getTaskModalElements();
  if (!els) {
    return;
  }
  openTaskModalWithTask(task, id, els);
}
window.openModalById = openModalById;

/**
 * Finds a task with a given ID in the global tasks array.
 * @param {number} id - ID of the task.
 * @returns {Task|null} The found task or null.
 */
function findTaskById(id) {
  if (!Array.isArray(window.tasks)) {
    return null;
  }
  for (let i = 0; i < window.tasks.length; i++) {
    const t = window.tasks[i];
    if (t && t.id === id) {
      return t;
    }
  }
  return null;
}

/**
 * Returns modal container and content elements for the task modal.
 * @returns {{modal: HTMLElement, content: HTMLElement}|null}
 */
function getTaskModalElements() {
  const modal = document.getElementById("task-modal");
  const content = document.getElementById("task-modal-content");
  if (!modal || !content) {
    return null;
  }
  return { modal, content };
}

/**
 * Ensures the CSS for user-story big cards is loaded once.
 */
function ensureUserStoryCss() {
  const link = document.getElementById("user-story-css");
  if (link) {
    return;
  }
  const css = document.createElement("link");
  css.id = "user-story-css";
  css.rel = "stylesheet";
  css.href = "../board_code/user_story_template.css";
  document.head.appendChild(css);
}

/**
 * Ensures the CSS for technical big cards is loaded once.
 */
function ensureTechnicalCss() {
  const link = document.getElementById("technical-css");
  if (link) {
    return;
  }
  const css = document.createElement("link");
  css.id = "technical-css";
  css.rel = "stylesheet";
  css.href = "../styles/board-technical.css";
  document.head.appendChild(css);
}

/**
 * Chooses between dynamic and legacy modal rendering for a task.
 * @param {Task} task - Task object to show.
 * @param {number} id - Task ID.
 * @param {{modal: HTMLElement, content: HTMLElement}} els - Modal elements.
 */
function openTaskModalWithTask(task, id, els) {
  const modal = els.modal;
  const content = els.content;
  const type = task.type;
  const isTech = isTechnicalType(type);
  const isStory = isUserStoryType(type);
  if (task.id > 1000 && typeof bigCardDynamicHtml === "function") {
    openDynamicTaskModal(task, modal, content, isTech, isStory);
  } else {
    openLegacyTaskModal(task, id, modal, content, isTech);
  }
}

/**
 * Opens the dynamic big-card modal (user-story or technical).
 * @param {Task} task
 * @param {HTMLElement} modal
 * @param {HTMLElement} content
 * @param {boolean} isTech
 * @param {boolean} isStory
 */
function openDynamicTaskModal(task, modal, content, isTech, isStory) {
  if (isStory) {
    ensureUserStoryCss();
  }
  if (isTech) {
    ensureTechnicalCss();
  }
  if (isTech && typeof bigCardDynamicTechnicalHtml === "function") {
    content.innerHTML = bigCardDynamicTechnicalHtml(task);
  } else {
    content.innerHTML = bigCardDynamicHtml(task);
  }
  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
}

/**
 * Ensures the correct CSS file is loaded for legacy templates.
 * @param {boolean} isTech - True for technical task.
 */
function ensureCssForLegacy(isTech) {
  if (!isTech) {
    ensureUserStoryCss();
  }
  if (isTech) {
    ensureTechnicalCss();
  }
}

/**
 * Returns the HTML for legacy task templates.
 * @param {Task} task
 * @param {boolean} isTech
 * @returns {string} HTML string for the modal content.
 */
function getLegacyTaskHtml(task, isTech) {
  if (isTech && typeof getTechnicalTaskTemplate === "function") {
    return getTechnicalTaskTemplate(task);
  }
  if (typeof bigCardHtml === "function") {
    return bigCardHtml(task);
  }
  return fallbackModal(task);
}

/**
 * Restores saved checkbox states for subtasks in the modal.
 * @param {number} id - Task ID.
 * @param {HTMLElement} content - Modal content element.
 */
function restoreSubtasksState(id, content) {
  if (typeof saved === "undefined") { return; }
  const s = saved[id];
  if (!s) { return; }
  const boxes = content.querySelectorAll(
    '.subtask-list input[type="checkbox"]'
  );
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].checked = !!s[i];
  }
  if (boxes.length) {
    updateSubtasks(id, boxes[0]);
  }
}

/**
 * Opens the legacy task modal and restores subtasks.
 * @param {Task} task
 * @param {number} id
 * @param {HTMLElement} modal
 * @param {HTMLElement} content
 * @param {boolean} isTech
 */
function openLegacyTaskModal(task, id, modal, content, isTech) {
  ensureCssForLegacy(isTech);
  const html = getLegacyTaskHtml(task, isTech);
  content.innerHTML = html;
  restoreSubtasksState(id, content);
  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
}

/**
 * Closes the task modal and restores scrolling.
 */
function closeModal() {
  const modal = document.getElementById("task-modal");
  if (modal) {
    modal.style.display = "none";
  }
  document.body.classList.remove("no-scroll");
}

/**
 * Wrapper for closing the task modal.
 * Can be used directly in HTML onclick attributes.
 */
function closeTaskModal() {
  closeModal();
}

/**
 * Ensures CSS for the Add Task overlay is loaded once.
 */
function ensureAddTaskCss() {
  const link = document.getElementById("addtask-css");
  if (link) {
    return;
  }
  const css = document.createElement("link");
  css.id = "addtask-css";
  css.rel = "stylesheet";
  css.href = "./addTask_template.css";
  document.head.appendChild(css);
}

/**
 * Returns the HTML for the Add Task template or a fallback message.
 * @returns {string} HTML for the Add Task overlay.
 */
function getAddTaskHtml() {
  if (typeof getAddTaskTemplate === "function") {
    return getAddTaskTemplate();
  }
  return '<div style="padding:16px">AddTask-Template fehlt.</div>';
}

/**
 * Fills the Add Task content, renders contacts and sets focus.
 * @param {HTMLElement} content - Container for the Add Task template.
 */
function setupAddTaskContent(content) {
  content.innerHTML = getAddTaskHtml();
  renderContactsInDropdown();
  if (typeof initAddTaskTemplateHandlers === "function") {
    initAddTaskTemplateHandlers();
  }
  const titleInput = content.querySelector("#title");
  if (titleInput) {
    titleInput.focus();
  }
}

/**
 * Opens the Add Task overlay and prevents background scrolling.
 */
function openAddTask() {
  const overlay = document.getElementById("addtask-overlay");
  const content = document.getElementById("addtask-content");
  if (!overlay || !content) {
    return;
  }
  ensureAddTaskCss();
  setupAddTaskContent(content);
  overlay.classList.add("open");
  document.body.classList.add("no-scroll");
}

/**
 * Resets global helper variables used by the Add Task overlay.
 */
function resetAddTaskGlobals() {
  window.taskBeingEdited = null;
  window.selectedUsers = [];
  window.selectedUserColors = {};
  window.isDropdownOpen = false;
}

/**
 * Clears Add Task content and removes injected CSS after animation.
 */
function clearAddTaskAfterAnimation() {
  const content = document.getElementById("addtask-content");
  if (!content) {
    return;
  }
  content.innerHTML = "";
  const css = document.getElementById("addtask-css");
  if (css) {
    css.remove();
  }
}

/**
 * Closes the Add Task overlay and restores the page state.
 */
function closeAddTask() {
  const overlay = document.getElementById("addtask-overlay");
  const content = document.getElementById("addtask-content");
  if (!overlay || !content) {
    return;
  }
  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll");
  resetAddTaskGlobals();
  setTimeout(clearAddTaskAfterAnimation, 300);
}
