/* === board_interactions.js | Handles search, drag & drop, and user actions === */

/* === Search Functionality === */
window.searchTasks = function () {
  const input = document.getElementById("board-search");
  const msg = document.getElementById("search-msg");
  searchQuery = (input?.value || "").trim().toLowerCase();
  updateSearchClearButtonState(input);
  render();
  if (!msg) return;
  if (!searchQuery) {
    msg.textContent = "";
    msg.className = "";
    return;
  }
  const count = document.querySelectorAll(".task-card").length;
  msg.textContent =
    count === 0
      ? "Keine Treffer."
      : count === 1
      ? "1 Treffer."
      : count + " Treffer.";
  msg.className = count === 0 ? "msg-red" : "msg-green";
};


window.clearBoardSearch = function () {
  const input = document.getElementById("board-search");
  if (!input) return;
  input.value = "";
  input.focus();
  searchTasks();
};


window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("board-search");
  if (input) updateSearchClearButtonState(input);
});


/* === Search Helper Function === */
function matchesSearch(t) {
  if (!searchQuery) return true;
  const title = String(t.title || "").toLowerCase();
  const desc = String(t.description || "").toLowerCase();
  const type = String(t.type || "").toLowerCase();
  const prio = String(t.priority || "").toLowerCase();
  const ass = (t.assignedTo || [])
    .map((p) => String(p.name || "").toLowerCase())
    .join(" ");
  const idStr = String(t.id);
  return (
    title.includes(searchQuery) ||
    desc.includes(searchQuery) ||
    type.includes(searchQuery) ||
    prio.includes(searchQuery) ||
    ass.includes(searchQuery) ||
    idStr.includes(searchQuery)
  );
}


/* === Drag & Drop Core === */


/* === Mobile Long‑Press Drag Support === */
let longPressTimer = null;
let longPressActive = false;

document.addEventListener("touchstart", (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;

  longPressTimer = setTimeout(() => {
    longPressActive = true;
    whichCardActuellDrop = Number(card.dataset.id || card.getAttribute("data-id"));
    currentDragCardEl = card;
    card.classList.add("is-dragging");
    document.body.classList.add("dragging");
  }, 300);
}, { passive: false });

document.addEventListener("touchmove", (e) => {
  if (!longPressActive || !currentDragCardEl) return;
  const touch = e.touches[0];
  const hoverCol = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".drag-area");
  if (hoverCol?.id) highlight(hoverCol.id);
});

document.addEventListener("touchend", (e) => {
  clearTimeout(longPressTimer);
  if (longPressActive && currentDragCardEl) {
    const touch = e.changedTouches[0];
    const dropCol = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".drag-area");
    if (dropCol) {
      const status = statusByColumnId[dropCol.id];
      if (status) moveTo(status);
    }
    currentDragCardEl.classList.remove("is-dragging");
    document.body.classList.remove("dragging");
  }
  longPressActive = false;
  currentDragCardEl = null;
});
window.allowDrop = (e) => e.preventDefault();
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


window.removeHighlight = function (id) {
  if (!id) return;
  if (activeHighlightColumnId && activeHighlightColumnId !== id) {
    return;
  }
  const el = document.getElementById(id);
  if (el) el.classList.remove("drag-highlight");
  activeHighlightColumnId = null;
  const status = statusByColumnId[id];
  if (status) cancelScheduledAutoMove(status);
};


function clearAllColumnHighlights() {
  document
    .querySelectorAll(".drag-area.drag-highlight")
    .forEach((el) => el.classList.remove("drag-highlight"));
  activeHighlightColumnId = null;
}


window.onCardDragStart = function (event, whichTaskId) {
  whichCardActuellDrop = whichTaskId;
  currentDragCardEl = event.currentTarget;
  lastDragPointerX = null;
  pendingDragTiltClass = null;
  cancelScheduledAutoMove();
  try {
    event.dataTransfer.setData("text/plain", String(whichTaskId));
    event.dataTransfer.effectAllowed = "move";
  } catch (e) {
  }
  document.body.classList.add("dragging");
  if (currentDragCardEl) {
    currentDragCardEl.classList.add("is-dragging");
  }
};


window.onCardDragEnd = function () {
  document.body.classList.remove("dragging");
  cancelScheduledAutoMove();
  if (currentDragCardEl) {
    currentDragCardEl.classList.remove(
      "is-dragging",
      "tilt-left",
      "tilt-right"
    );
  }
  currentDragCardEl = null;
  lastDragPointerX = null;
  pendingDragTiltClass = null;
  needsDraggingClassAfterRender = false;
  clearAllColumnHighlights();
};


window.moveTo = function (newStatus) {
  cancelScheduledAutoMove();
  applyStatusChangeForDraggedTask(newStatus, { keepDraggingState: false });
  clearAllColumnHighlights();
};


function getDraggedTask() {
  if (whichCardActuellDrop == null || !Array.isArray(window.tasks)) return null;
  return window.tasks.find((t) => t.id === whichCardActuellDrop) || null;
}


/* === Task Status Update on Drop === */
function applyStatusChangeForDraggedTask(
  newStatus,
  { keepDraggingState } = {}
) {
  const draggedTask = getDraggedTask();
  if (!draggedTask) return false;
  if (draggedTask.status === newStatus) return false;
  pendingDragTiltClass = keepDraggingState
    ? currentDragCardEl?.classList.contains("tilt-right")
      ? "tilt-right"
      : currentDragCardEl?.classList.contains("tilt-left")
      ? "tilt-left"
      : null
    : null;
  draggedTask.status = newStatus;
  persistTasks();
  needsDraggingClassAfterRender = Boolean(keepDraggingState);
  render();
  return true;
}


/* === Auto Move Scheduling === */
function scheduleAutoMoveTo(status) {
  if (!currentDragCardEl || whichCardActuellDrop == null) return;
  const draggedTask = getDraggedTask();
  if (draggedTask && draggedTask.status === status) {
    cancelScheduledAutoMove();
    return;
  }
  if (pendingAutoMoveStatus === status) return;
  cancelScheduledAutoMove();
  pendingAutoMoveStatus = status;
  autoMoveTimeoutId = setTimeout(() => {
    autoMoveTimeoutId = null;
    pendingAutoMoveStatus = null;
    applyStatusChangeForDraggedTask(status, { keepDraggingState: true });
  }, 160);
}


function cancelScheduledAutoMove(expectedStatus) {
  if (
    pendingAutoMoveStatus &&
    expectedStatus &&
    pendingAutoMoveStatus !== expectedStatus
  ) {
    return;
  }
  if (autoMoveTimeoutId != null) {
    clearTimeout(autoMoveTimeoutId);
  }
  autoMoveTimeoutId = null;
  pendingAutoMoveStatus = null;
}


/* === Column Detection Logic === */
const MAX_VERTICAL_SNAP_DISTANCE = 220;

function findColumnByPointer(clientX, clientY) {
  const columns = Array.from(document.querySelectorAll(".drag-area"));
  let best = null;
  let bestDistance = Infinity;
  for (const col of columns) {
    const rect = col.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right) continue;
    let distanceY = 0;
    if (clientY < rect.top) {
      distanceY = rect.top - clientY;
    } else if (clientY > rect.bottom) {
      distanceY = clientY - rect.bottom;
    }
    if (distanceY < bestDistance) {
      bestDistance = distanceY;
      best = col;
    }
  }
  if (best && bestDistance <= MAX_VERTICAL_SNAP_DISTANCE) {
    return best;
  }
  return null;
}


/* === Dragover Highlight Handling === */
document.addEventListener("dragover", (event) => {
  if (!currentDragCardEl) return;
  const { clientX, clientY } = event;
  if (typeof clientX === "number") {
    if (lastDragPointerX == null) {
      lastDragPointerX = clientX;
    } else {
      const deltaX = clientX - lastDragPointerX;
      if (Math.abs(deltaX) >= 2) {
        currentDragCardEl.classList.remove("tilt-left", "tilt-right");
        currentDragCardEl.classList.add(
          deltaX > 0 ? "tilt-right" : "tilt-left"
        );
        lastDragPointerX = clientX;
      }
    }
  }
  if (typeof clientX !== "number" || typeof clientY !== "number") return;
  let hoveredColumn = event.target?.closest?.(".drag-area") || null;
  if (!hoveredColumn) {
    const direct = document.elementFromPoint(clientX, clientY);
    hoveredColumn = direct?.closest?.(".drag-area") || null;
  }
  if (!hoveredColumn) {
    hoveredColumn = findColumnByPointer(clientX, clientY);
  }
  if (hoveredColumn?.id) {
    highlight(hoveredColumn.id);
  } else if (activeHighlightColumnId) {
    removeHighlight(activeHighlightColumnId);
  }
});


/* === Drag Tilt Animation Handling === */
document.addEventListener("dragover", (event) => {
  if (!currentDragCardEl) return;
  const { clientX } = event;
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
});
