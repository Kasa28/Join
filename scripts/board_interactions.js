/**
 * Performs a live search on all task cards, updates the UI and result count message.
 */
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

/**
 * Clears the board search input and triggers a fresh search render.
 */
window.clearBoardSearch = function () {
  const input = document.getElementById("board-search");
  if (!input) return;
  input.value = "";
  input.focus();
  searchTasks();
};

/**
 * Initializes the search clear button state once the board has loaded.
 */
window.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("board-search");
  if (input) updateSearchClearButtonState(input);
});

/* === Search Helper Function === */
/**
 * Checks whether a task object matches the active search query.
 * @param {Object} t - The task object.
 * @returns {boolean} True if the task matches search terms.
 */
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

let longPressTimer = null;
let longPressActive = false;

/**
 * Handles long‑press detection on mobile to initiate drag mode for a task card.
 */
document.addEventListener(
  "touchstart",
  (e) => {
    const card = e.target.closest(".task-card");
    if (!card) return;

    longPressTimer = setTimeout(() => {
      longPressActive = true;
      whichCardActuellDrop = Number(
        card.dataset.id || card.getAttribute("data-id")
      );
      currentDragCardEl = card;
      card.classList.add("is-dragging");
      document.body.classList.add("dragging");
    }, 300);
  },
  { passive: false }
);


/**
 * Updates drag hover highlighting while dragging a task on mobile.
 */
document.addEventListener("touchmove", (e) => {
    if (!longPressActive || !currentDragCardEl) return;
    const touch = e.touches[0];
    const hoverCol = document
      .elementFromPoint(touch.clientX, touch.clientY)
      ?.closest(".drag-area");
    if (hoverCol?.id) {
      highlight(hoverCol.id);
    }
  },
  { passive: false }
);


/**
 * Finalizes long‑press drag actions on mobile and drops the card if applicable.
 */
document.addEventListener("touchend", (e) => {
    clearTimeout(longPressTimer);
    if (longPressActive && currentDragCardEl) {
      const touch = e.changedTouches[0];
      const dropCol = document
        .elementFromPoint(touch.clientX, touch.clientY)
        ?.closest(".drag-area");
      if (dropCol) {
        const status = statusByColumnId[dropCol.id];
        if (status) {
          moveTo(status);
        }
      }
      currentDragCardEl.classList.remove("is-dragging");
      document.body.classList.remove("dragging");
    }
    longPressActive = false;
    currentDragCardEl = null;
  },
  { passive: false }
);


/**
 * Allows dropping of dragged items onto valid drop zones.
 * @param {DragEvent} e - The dragover event.
 */
window.allowDrop = (e) => e.preventDefault();

/**
 * Highlights a drag-area column while dragging a task card.
 * @param {string} id - The ID of the column to highlight.
 */
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


/**
 * Removes highlight styling from a drag-area column.
 * @param {string} id - The ID of the column to remove highlight from.
 */
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


/**
 * Removes highlight styling from all drag-area columns.
 */
function clearAllColumnHighlights() {
  document
    .querySelectorAll(".drag-area.drag-highlight")
    .forEach((el) => el.classList.remove("drag-highlight"));
  activeHighlightColumnId = null;
}


/**
 * Starts desktop drag-and-drop behavior for a task card.
 * @param {DragEvent} event - The dragstart event.
 * @param {number} whichTaskId - ID of the dragged task.
 */
window.onCardDragStart = function (event, whichTaskId) {
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
  if (currentDragCardEl) {
    currentDragCardEl.classList.add("is-dragging");
  }
};


/**
 * Finalizes drag behavior and resets all drag UI states.
 */
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


/**
 * Moves the dragged task to a new status column.
 * @param {string} newStatus - Target status for the task.
 */
window.moveTo = function (newStatus) {
  cancelScheduledAutoMove();
  applyStatusChangeForDraggedTask(newStatus, { keepDraggingState: false });
  clearAllColumnHighlights();
};


/**
 * Retrieves the task object currently being dragged.
 * @returns {Object|null} The dragged task or null.
 */
function getDraggedTask() {
  if (whichCardActuellDrop == null || !Array.isArray(window.tasks)) return null;
  return window.tasks.find((t) => t.id === whichCardActuellDrop) || null;
}


/* === Task Status Update on Drop === */
/**
 * Applies a status update to the dragged task and triggers re-rendering.
 * @param {string} newStatus - The new status to apply.
 * @param {Object} options - Optional configuration.
 * @returns {boolean} True if the status changed.
 */
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
/**
 * Schedules an automatic move of a dragged task when hovering over a column.
 * @param {string} status - The status associated with the hovered column.
 */
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


/**
 * Cancels any scheduled automatic task move action.
 * @param {string} [expectedStatus] - Optional status to verify before canceling.
 */
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

/**
 * Determines the closest valid drop column based on pointer coordinates.
 * @param {number} clientX - Pointer X coordinate.
 * @param {number} clientY - Pointer Y coordinate.
 * @returns {HTMLElement|null} The matched column or null.
 */
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
/**
 * Handles card tilt animation and hover detection during desktop drag operations.
 */
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
/**
 * Updates drag tilt animation based on horizontal pointer movement.
 */
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
