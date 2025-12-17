/**
 * Opens the task modal and shows content for the given task ID.
 * @param {number|string} id - Task ID to display in the modal.
 * @returns {void}
 */
function openModalDynamic(id) {
  let task = findTaskForModal(id);
  if (!task) {
    return;
  }
  let modal = document.getElementById("task-modal");
  let content = document.getElementById("task-modal-content");
  if (!modal || !content) {
    return;
  }
  renderModalContent(content, task);
  showTaskModal(modal);
}

/**
 * Finds a task in window.tasks by task ID for the modal.
 * @param {number|string} id - Task ID to search for.
 * @returns {Task|null}
 */
function findTaskForModal(id) {
  if (!Array.isArray(window.tasks)) {
    return null;
  }
  let task = window.tasks.find(function (t) {
    return t && t.id === id;
  });
  return task || null;
}

/**
 * Renders the modal content for the given task.
 * @param {HTMLElement} content - Modal content container element.
 * @param {Task} task - Task to render in the modal.
 * @returns {void}
 */
function renderModalContent(content, task) {
  if (typeof bigCardDynamicHtml === "function") {
    content.innerHTML = bigCardDynamicHtml(task);
  } else {
    content.innerHTML = fallbackModal(task);
  }
}

/**
 * Shows the modal element and disables body scrolling.
 * @param {HTMLElement} modal - Modal root element.
 * @returns {void}
 */
function showTaskModal(modal) {
  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
}

/**
 * Deletes a task (non-demo task) from UI, server and local storage.
 * @param {number|string} id - Task ID to delete.
 * @returns {Promise<void>}
 */
async function deleteDynamicTask(id) {
  let task = getTaskForDelete(id);
  if (!task) {
    return;
  }
  if (!canDeleteTask(task)) {
    return;
  }
  deleteTaskFromArray(task);
  removeTaskCard(task);
  closeTaskModal();
  requestBoardRender();
  await deleteTaskOnServer(task);
  persistTasks();
}

/**
 * Looks up a task by task ID for deletion.
 * @param {number|string} id - Task ID to search for.
 * @returns {Task|null}
 */
function getTaskForDelete(id) {
  if (!Array.isArray(window.tasks)) {
    alert("Task not found.");
    return null;
  }
  let task = window.tasks.find(function (t) {
    return t && t.id === id;
  });
  if (!task) {
    alert("Task not found.");
    return null;
  }
  return task;
}

/**
 * Checks whether a task may be deleted (demo tasks cannot be deleted).
 * @param {Task} task - Task to validate.
 * @returns {boolean}
 */
function canDeleteTask(task) {
  if (typeof isDemoTask === "function" && isDemoTask(task)) {
    showToast("Demo tasks can only be moved.", { variant: "error", duration: 1600 });
    return false;
  }
  return true;
}

/**
 * Removes the task from the global window.tasks array.
 * @param {Task} task - Task to remove.
 * @returns {void}
 */
function deleteTaskFromArray(task) {
  window.tasks = window.tasks.filter(function (t) {
    return t && t.id !== task.id;
  });
}

/**
 * Removes the task card element from the DOM.
 * @param {Task} task - Task whose card should be removed.
 * @returns {void}
 */
function removeTaskCard(task) {
  let cardEl = document.getElementById("card-" + task.id);
  if (cardEl && cardEl.parentNode) {
    cardEl.parentNode.removeChild(cardEl);
  }
}

/**
 * Requests a re-render of the board in the next animation frame.
 * @returns {void}
 */
function requestBoardRender() {
  requestAnimationFrame(function () {
    if (typeof render === "function") {
      render();
    }
  });
}

/**
 * Deletes the task from the Firebase backend.
 * @param {Task} task - Task to delete on the server.
 * @returns {Promise<void>}
 */
async function deleteTaskOnServer(task) {
  await fetchBoardTasks(`/${task.id}`, {
    method: "DELETE",
  });
}

/**
 * Fallback modal HTML if no dynamic template exists.
 * @param {Task} task - Task to show in the fallback modal.
 * @returns {string}
 */
function fallbackModal(task) {
  return (
    '<div style="padding:24px">' +
    "<h2>" +
    (task && task.title ? task.title : "Task") +
    "</h2>" +
    "<p>" +
    (task && task.description ? task.description : "") +
    "</p>" +
    "<p><em>No template found.</em></p>" +
    '<button onclick="closeTaskModal()">Close</button>' +
    "</div>"
  );
}
