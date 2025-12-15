const isTouchDevice =
  window.matchMedia("(pointer: coarse)").matches ||
  navigator.maxTouchPoints > 0;

if (isTouchDevice || window.innerWidth < 1200) {
  document.body.classList.add("touch-device");
}

/** Performs live search and updates UI + result message. @returns {void} */
window.searchTasks = function () {
  const input = document.getElementById("board-search");
  const msg = document.getElementById("search-msg");
  searchQuery = (input?.value || "").trim().toLowerCase();
  updateSearchClearButtonState(input);
  render();
  if (!msg) return;
  if (!searchQuery) {
    resetSearchMsg(msg);
    return;
  }
  const count = document.querySelectorAll(".task-card").length;
  updateSearchResultMsg(msg, count);
};

/** Resets result message. @param {HTMLElement} msg @returns {void} */
function resetSearchMsg(msg) {
  msg.textContent = "";
  msg.className = "";
}

/** Updates result message text + color. @param {HTMLElement} msg @param {number} count @returns {void} */
function updateSearchResultMsg(msg, count) {
  msg.textContent =
    count === 0 ? "No results" : count === 1 ? "1 result." : count + " results.";
  msg.className = count === 0 ? "msg-red" : "msg-green";
}

/** Clears search input and triggers search. @returns {void} */
window.clearBoardSearch = function () {
  const input = document.getElementById("board-search");
  if (!input) return;
  input.value = "";
  input.focus();
  searchTasks();
};

/** Init search clear button on load. @returns {void} */
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("board-search");
  if (input) updateSearchClearButtonState(input);
});

/** Checks if task matches active search query. @param {Object} t @returns {boolean} */
function matchesSearch(t) {
  if (!searchQuery) return true;
  const ass = (t.assignedTo || []).map((p) => String(p.name || "")).join(" ");
  const text = [
    t.title || "",
    t.description || "",
    t.type || "",
    t.priority || "",
    String(t.id),
    ass,
  ]
    .join(" ")
    .toLowerCase();
  return text.includes(searchQuery);
}

let longPressTimer = null;
let longPressActive = false;
let hoverStabilityTimeout = null;
let lastStableHoverId = null;

/** Stabilizes highlight to avoid flicker. @param {string} columnId @returns {void} */
function stableHighlight(columnId) {
  if (!columnId || columnId === lastStableHoverId) return;
  clearTimeout(hoverStabilityTimeout);
  hoverStabilityTimeout = setTimeout(() => {
    lastStableHoverId = columnId;
    highlight(columnId);
  }, 80);
}

/** Allows drop on drag areas. @param {DragEvent} e @returns {void} */
window.allowDrop = (e) => e.preventDefault();

/** Highlights a drag-area column while dragging. @param {string} id @returns {void} */
window.highlight = function (id) {
  if (!id) return;
  if (activeHighlightColumnId && activeHighlightColumnId !== id) {
    const prev = document.getElementById(activeHighlightColumnId);
    if (prev) prev.classList.remove("drag-highlight");
  }
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("drag-highlight");
  activeHighlightColumnId = id;
  const status = statusByColumnId[id];
  if (status) scheduleAutoMoveTo(status);
};

/** Removes highlight from column. @param {string} id @returns {void} */
window.removeHighlight = function (id) {
  if (!id) return;
  if (activeHighlightColumnId && activeHighlightColumnId !== id) return;
  const el = document.getElementById(id);
  if (el) el.classList.remove("drag-highlight");
  activeHighlightColumnId = null;
  const status = statusByColumnId[id];
  if (status) cancelScheduledAutoMove(status);
};

/** Clears highlight from all columns. @returns {void} */
function clearAllColumnHighlights() {
  document
    .querySelectorAll(".drag-area.drag-highlight")
    .forEach((el) => el.classList.remove("drag-highlight"));
  activeHighlightColumnId = null;
}

/** Starts desktop drag behavior. @param {DragEvent} event @param {number|string} whichTaskId @returns {void} */
window.onCardDragStart = function (event, whichTaskId) {
  if (isTouchDevice) return;
  whichCardActuellDrop = whichTaskId;
  currentDragCardEl = event.currentTarget;
  lastDragPointerX = null;
  pendingDragTiltClass = null;
  cancelScheduledAutoMove();
  try {
    event.dataTransfer.setData("text/plain", String(whichTaskId));
    event.dataTransfer.effectAllowed = "move";
  } catch (e) {}
  document.body.classList.add("dragging");
  if (currentDragCardEl) currentDragCardEl.classList.add("is-dragging");
};

/** Ends drag behavior and resets UI states. @returns {void} */
window.onCardDragEnd = function () {
  document.body.classList.remove("dragging");
  cancelScheduledAutoMove();
  if (currentDragCardEl)
    currentDragCardEl.classList.remove("is-dragging", "tilt-left", "tilt-right");
  currentDragCardEl = null;
  lastDragPointerX = null;
  pendingDragTiltClass = null;
  needsDraggingClassAfterRender = false;
  clearAllColumnHighlights();
};

/** Moves dragged task to new status column. @param {string} newStatus @returns {void} */
window.moveTo = function (newStatus) {
  cancelScheduledAutoMove();
  applyStatusChangeForDraggedTask(newStatus, { keepDraggingState: false });
  clearAllColumnHighlights();
};

/** Gets task currently being dragged. @returns {Task|null} */
function getDraggedTask() {
  if (whichCardActuellDrop == null || !Array.isArray(window.tasks)) return null;
  return window.tasks.find((t) => t.id === whichCardActuellDrop) || null;
}

/** Computes tilt class based on current drag state. @param {boolean} keepDraggingState @returns {string|null} */
function computePendingTilt(keepDraggingState) {
  if (!keepDraggingState || !currentDragCardEl) return null;
  if (currentDragCardEl.classList.contains("tilt-right")) return "tilt-right";
  if (currentDragCardEl.classList.contains("tilt-left")) return "tilt-left";
  return null;
}

/** Applies status change for dragged task. @param {string} newStatus @param {{keepDraggingState?: boolean}} [options] @returns {boolean} */
function applyStatusChangeForDraggedTask(newStatus, { keepDraggingState } = {}) {
  const draggedTask = getDraggedTask();
  if (!draggedTask || draggedTask.status === newStatus) return false;
  pendingDragTiltClass = computePendingTilt(keepDraggingState);
  draggedTask.status = newStatus;
  persistTasks();
  needsDraggingClassAfterRender = Boolean(keepDraggingState);
  render();
  return true;
}

/** Schedules automatic move on hover. @param {string} status @returns {void} */
function scheduleAutoMoveTo(status) {
  if (!currentDragCardEl || whichCardActuellDrop == null) return;
  const draggedTask = getDraggedTask();
  if ((draggedTask && draggedTask.status === status) || pendingAutoMoveStatus === status) {
    cancelScheduledAutoMove();
    return;
  }
  cancelScheduledAutoMove();
  pendingAutoMoveStatus = status;
  autoMoveTimeoutId = setTimeout(() => {
    autoMoveTimeoutId = null;
    pendingAutoMoveStatus = null;
    applyStatusChangeForDraggedTask(status, { keepDraggingState: true });
  }, 160);
}

/** Cancels scheduled auto-move. @param {string} [expectedStatus] @returns {void} */
function cancelScheduledAutoMove(expectedStatus) {
  if (
    pendingAutoMoveStatus &&
    expectedStatus &&
    pendingAutoMoveStatus !== expectedStatus
  ) {
    return;
  }
  if (autoMoveTimeoutId != null) clearTimeout(autoMoveTimeoutId);
  autoMoveTimeoutId = null;
  pendingAutoMoveStatus = null;
}

/* === Column Detection Logic === */

const MAX_VERTICAL_SNAP_DISTANCE = 220;

/** Finds closest drop column by pointer coords. @param {number} clientX @param {number} clientY @returns {HTMLElement|null} */
function findColumnByPointer(clientX, clientY) {
  const columns = document.querySelectorAll(".drag-area");
  let best = null;
  let bestDistance = Infinity;
  for (const col of columns) {
    const rect = col.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right) continue;
    let distanceY = 0;
    if (clientY < rect.top) distanceY = rect.top - clientY;
    else if (clientY > rect.bottom) distanceY = clientY - rect.bottom;
    if (distanceY < bestDistance) {
      bestDistance = distanceY;
      best = col;
    }
  }
  return best && bestDistance <= MAX_VERTICAL_SNAP_DISTANCE ? best : null;
}

/** Updates card tilt during drag. @param {number} clientX @returns {void} */
function updateDragTilt(clientX) {
  if (typeof clientX !== "number") return;
  if (lastDragPointerX == null) {
    lastDragPointerX = clientX;
    return;
  }
  const deltaX = clientX - lastDragPointerX;
  if (Math.abs(deltaX) < 2) return;
  currentDragCardEl.classList.remove("tilt-left", "tilt-right");
  currentDragCardEl.classList.add(deltaX > 0 ? "tilt-right" : "tilt-left");
  lastDragPointerX = clientX;
}

/** Handles dragover: tilt + column detection + highlight. @param {DragEvent} event @returns {void} */
function handleDragOver(event) {
  if (!currentDragCardEl) return;
  const { clientX, clientY } = event;
  updateDragTilt(clientX);
  if (typeof clientX !== "number" || typeof clientY !== "number") return;
  let hoveredColumn = event.target?.closest?.(".drag-area") || null;
  if (!hoveredColumn) {
    const direct = document.elementFromPoint(clientX, clientY);
    hoveredColumn = direct?.closest?.(".drag-area") || null;
  }
  if (!hoveredColumn) hoveredColumn = findColumnByPointer(clientX, clientY);
  const id = hoveredColumn?.id;
  if (!id || activeHighlightColumnId === id) return;
  highlight(id);
  if (activeHighlightColumnId !== id) stableHighlight(id);
}

document.addEventListener("dragover", (event) => handleDragOver(event));

/* === Mobile Move Menu Logic === */

/** Opens mobile move menu. @param {MouseEvent} event @param {number|string} taskId @returns {void} */
window.openMoveMenu = function (event, taskId) {
  event.stopPropagation();
  window.moveMenuTaskId = taskId;
  buildMoveMenuOptions(taskId);
  const overlay = document.getElementById("move-menu-overlay");
  if (overlay) overlay.classList.add("open");
};

/** Closes mobile move menu. @param {MouseEvent} [event] @returns {void} */
window.closeMoveMenu = function (event) {
  const overlay = document.getElementById("move-menu-overlay");
  if (!overlay) return;
  if (
    event &&
    event.currentTarget &&
    event.currentTarget.classList.contains("move-menu-close-btn")
  ) {
    overlay.classList.remove("open");
    return;
  }
  if (!event || event.target.id === "move-menu-overlay") {
    overlay.classList.remove("open");
  }
};

/** Confirms move menu selection and moves task. @returns {void} */
window.confirmMoveMenu = function () {
  if (!window.selectedMoveStatus) return;
  whichCardActuellDrop = window.moveMenuTaskId;
  moveTo(window.selectedMoveStatus);
  closeMoveMenu();
};

/** Creates a move-menu option button. @param {string} label @param {string} status @returns {HTMLDivElement} */
function createMoveMenuButton(label, status) {
  const btn = document.createElement("div");
  btn.classList.add("move-menu-option");
  btn.textContent = label;
  btn.onclick = () => {
    window.selectedMoveStatus = status;
    document
      .querySelectorAll(".move-menu-option")
      .forEach((x) => x.classList.remove("selected"));
    btn.classList.add("selected");
  };
  return btn;
}

/** Builds move menu options list. @param {number|string} taskId @returns {void} */
window.buildMoveMenuOptions = function (taskId) {
  const optBox = document.getElementById("move-menu-options");
  if (!optBox) return;
  optBox.innerHTML = "";
  window.selectedMoveStatus = null;
  Object.entries(statusByColumnId).forEach(([columnId, status]) => {
    const header = document
      .querySelector(`#${columnId}`)
      ?.closest("section")
      ?.querySelector("h2");
    const label = header ? header.textContent.trim() : status;
    optBox.appendChild(createMoveMenuButton(label, status));
  });
};
