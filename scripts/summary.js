
/**
 * @typedef {"todo"|"in-progress"|"await-feedback"|"done"} TaskStatus
 */

/**
 * @typedef {"urgent"|"medium"|"low"} TaskPriority
 */

/**
 * @typedef {Object} Task
 * @property {number|string} id
 * @property {string} [title]
 * @property {TaskStatus} status
 * @property {TaskPriority|string} priority
 * @property {string} [dueDate] - Format: "dd/mm/yyyy"
 */

/**
 * @typedef {Object} TaskCounts
 * @property {number} total
 * @property {number} urgent
 * @property {number} todo
 * @property {number} inProgress
 * @property {number} feedback
 * @property {number} done
 */
window.addEventListener("DOMContentLoaded", () => {
  updateSummary();
});


/**
 * Loads tasks from Firebase. Normalizes priority to lowercase.
 * Falls back to a minimal demo task if Firebase returns empty.
 * @async
 * @returns {Promise<Task[]>}
 */
async function loadTasks() {
  try {
        if (window.authReady) {
      await window.authReady;
    }

    const token = await window.auth?.currentUser?.getIdToken?.();
    const base =
      window.BASE_URL ||
      "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";
    const authQuery = token ? `?auth=${encodeURIComponent(token)}` : "";

    const response = await fetch(`${base}tasks.json${authQuery}`);
    const data = await response.json();
    const firebaseTasks = Array.isArray(data)
      ? data.filter(Boolean)
      : data
      ? Object.values(data)
      : [];
    firebaseTasks.forEach((t) => {
      if (t && typeof t.priority === "string") {
        t.priority = t.priority.toLowerCase();
      }
    });
    return firebaseTasks;
  } catch (error) {
    console.error("Fehler beim Laden der Tasks aus Firebase:", error);
    return [];
  }
}


/**
 * Calculates task counts for summary KPIs.
 * @param {Task[]} tasks
 * @returns {TaskCounts}
 */
function getTaskCounts(tasks) {
  const counts = {
    total: tasks.length,
    urgent: 0,
    todo: 0,
    inProgress: 0,
    feedback: 0,
    done: 0,
  };
  for (const t of tasks) {
    const prio = String(t.priority || "").toLowerCase();
    if (prio === "urgent") counts.urgent++;
    switch (t.status) {
      case "todo":
        counts.todo++;
        break;
      case "in-progress":
        counts.inProgress++;
        break;
      case "await-feedback":
        counts.feedback++;
        break;
      case "done":
        counts.done++;
        break;
    }
  }
  return counts;
}


/**
 * Returns the closest due date among urgent tasks.
 * @param {Task[]} tasks
 * @returns {Date|null}
 */
function getNextDeadline(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urgentFutureDates = tasks
    .filter(
      (t) =>
        String(t.priority || "").toLowerCase() === "urgent" &&
        t.dueDate
    )
    .map((t) => parseDueDate(t.dueDate))
    .filter((d) => !isNaN(d.getTime()) && d >= today);   // Nur zukünftige Deadlines

  if (!urgentFutureDates.length) return null;

  urgentFutureDates.sort((a, b) => a - b);  // frühestes Datum zuerst
  return urgentFutureDates[0];
}


/**
 * Parses supported due date formats into a Date instance.
 * Supports "dd/mm/yyyy" and "yyyy-mm-dd" (HTML date input default).
 * Returns an invalid Date for unsupported formats.
 * @param {string} dueDate
 * @returns {Date}
 */
function parseDueDate(dueDate) {
  if (dueDate == null) return new Date(NaN);
  const trimmed = String(dueDate).trim();
  if (!trimmed) return new Date(NaN);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split("/");
    return new Date(`${year}-${month}-${day}`);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }
  return new Date(NaN);
}

/**
 * Sets textContent for a selector if element exists.
 * @param {string} selector
 * @param {string|number} value
 * @returns {void}
 */
function setSummaryText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}


/**
 * Loads tasks, computes summary KPIs and renders them into the DOM.
 * @async
 * @returns {Promise<void>}
 */
async function updateSummary() {
  const tasks = await loadTasks();
  const counts = getTaskCounts(tasks);
  const nextDeadline = getNextDeadline(tasks);
  setSummaryText(".urgent-task-card-summary .h2-font-summray", counts.urgent);
  setSummaryText(".tasks-on-board-card-summary .h2-font-summray", counts.total);
  setSummaryText(
    ".summary-section-2-order .summary-card:nth-child(1) .h2-font-summray",
    counts.todo
  );
  setSummaryText(
    ".summary-section-2-order .summary-card:nth-child(2) .h2-font-summray",
    counts.inProgress
  );
  setSummaryText(
    ".summary-section-2-order .summary-card:nth-child(3) .h2-font-summray",
    counts.feedback
  );
  setSummaryText(
    ".summary-section-2-order .summary-card:nth-child(4) .h2-font-summray",
    counts.done
  );
  const deadlineEl = document.querySelector(".date-font-summary");
  if (deadlineEl) {
    if (nextDeadline) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      deadlineEl.textContent = nextDeadline.toLocaleDateString(
        "en-US",
        options
      );
    } else {
      deadlineEl.textContent = "No urgent deadlines";
    }
  }
}

let lastDataString = "";


/**
 * Polls Firebase for changes and updates summary if data differs.
 * @async
 * @returns {Promise<void>}
 */
async function pollSummary() {
  try {
    const res = await fetch(
      "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks.json"
    );
    const data = await res.json();
    const json = JSON.stringify(data);
    if (json !== lastDataString) {
      lastDataString = json;
      await updateSummary();
    }
  } catch (err) {
  }
}


pollSummary();
setInterval(pollSummary, 3000);
