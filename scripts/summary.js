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
  initSummaryPage();
});

async function initSummaryPage() {
  await waitForAuthGlobals();
  await updateSummary();
  startSummaryPolling();
}

/**
 * @param {any} data
 * @returns {Task[]}
 */
function toTaskArray(data) {
  if (Array.isArray(data)) return data.filter(Boolean);
  if (data && typeof data === "object") {
    return Object.values(data).filter(
      (t) => t && typeof t === "object" && "status" in t
    );
  }
  return [];
}

/**
 * @param {Task[]} tasks
 */
function normalizeTaskPriorities(tasks) {
  tasks.forEach((t) => {
    if (t && typeof t.priority === "string") {
      t.priority = t.priority.toLowerCase();
    }
  });
}

/**
 * Loads tasks from Firebase. Normalizes priority to lowercase.
 * Falls back to an empty list if Firebase returns empty.
 * @async
 * @returns {Promise<Task[]>}
 */
async function loadTasks() {
  try {
    const { base, authQuery } = await getSummaryFetchConfig();
    const response = await fetch(`${base}tasks.json${authQuery}`);
    const data = await response.json();
    const firebaseTasks = toTaskArray(data);
    normalizeTaskPriorities(firebaseTasks);
    return firebaseTasks;
  } catch (error) {
    console.error("Error while loading tasks from Firebase:", error);
    return [];
  }
}

/**
 * @param {TaskStatus} status
 * @returns {keyof TaskCounts | ""}
 */
function getStatusKey(status) {
  if (status === "todo") return "todo";
  if (status === "in-progress") return "inProgress";
  if (status === "await-feedback") return "feedback";
  if (status === "done") return "done";
  return "";
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
    const key = getStatusKey(t.status);
    if (key) counts[key]++;
  }
  return counts;
}

/**
 * @param {Task[]} tasks
 * @returns {Date[]}
 */
function getUrgentDueDates(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tasks
    .filter(
      (t) =>
        String(t.priority || "").toLowerCase() === "urgent" && t.dueDate
    )
    .map((t) => parseDueDate(t.dueDate))
    .filter((d) => !isNaN(d.getTime()) && d >= today);
}

/**
 * Returns the closest due date among urgent tasks.
 * @param {Task[]} tasks
 * @returns {Date|null}
 */
function getNextDeadline(tasks) {
  const urgentFutureDates = getUrgentDueDates(tasks);
  if (!urgentFutureDates.length) return null;
  urgentFutureDates.sort((a, b) => a - b);
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
 * @param {TaskCounts} counts
 */
function renderSummaryCounts(counts) {
  const targets = [
    [".urgent-task-card-summary .h2-font-summray", counts.urgent],
    [".tasks-on-board-card-summary .h2-font-summray", counts.total],
    [".summary-section-2-order .summary-card:nth-child(1) .h2-font-summray", counts.todo],
    [".summary-section-2-order .summary-card:nth-child(2) .h2-font-summray", counts.inProgress],
    [".summary-section-2-order .summary-card:nth-child(3) .h2-font-summray", counts.feedback],
    [".summary-section-2-order .summary-card:nth-child(4) .h2-font-summray", counts.done]
  ];
  for (const [selector, value] of targets) setSummaryText(selector, value);
}

/**
 * @param {Date|null} nextDeadline
 */
function renderSummaryDeadline(nextDeadline) {
  const deadlineEl = document.querySelector(".date-font-summary");
  if (!deadlineEl) return;
  if (nextDeadline) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    deadlineEl.textContent = nextDeadline.toLocaleDateString("en-US", options);
  } else {
    deadlineEl.textContent = "No urgent deadlines";
  }
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
  renderSummaryCounts(counts);
  renderSummaryDeadline(nextDeadline);
}

let lastDataString = "";

/**
 * Polls Firebase for changes and updates summary if data differs.
 * @async
 * @returns {Promise<void>}
 */
async function pollSummary() {
  try {
    const { base, authQuery } = await getSummaryFetchConfig();
    const res = await fetch(`${base}tasks.json${authQuery}`);
    const data = await res.json();
    const json = JSON.stringify(data);
    if (json !== lastDataString) {
      lastDataString = json;
      await updateSummary();
    }
  } catch (err) {}
}

let pollIntervalId;

/**
 * Starts a polling interval for summary updates if not already running.
 * Uses a 5 second interval to keep the dashboard in sync with backend changes.
 * @returns {void}
 */
function startSummaryPolling() {
  if (pollIntervalId) return;
  pollIntervalId = setInterval(pollSummary, 5000);
}

/**
 * Ensures authentication has run (anonymous if needed) and returns
 * the configured Firebase base URL plus auth query string.
 * @returns {Promise<{base: string, authQuery: string}>}
 */
async function getSummaryFetchConfig() {
  await ensureSummaryAuth();
  const token = await window.auth?.currentUser?.getIdToken?.();
  const base =
    window.BASE_URL ||
    "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";
  const authQuery = token ? `?auth=${encodeURIComponent(token)}` : "";
  return { base, authQuery };
}

/**
 * @returns {Promise<void>}
 */
async function ensureSummaryAuth() {
  await waitForAuthGlobals();
  if (window.authReady) await window.authReady;
  if (!window.auth?.currentUser && typeof window.signInAnonymously === "function") {
    try {
      await window.signInAnonymously();
    } catch (err) {
      console.warn("Anonymous sign-in for summary failed", err);
    }
  }
}

let authGlobalsPromise;

/**
 * Waits until global auth helpers are available (authReady/signInAnonymously).
 * @returns {Promise<void>}
 */
function waitForAuthGlobals() {
  if (!authGlobalsPromise) {
    authGlobalsPromise = new Promise((resolve) => {
      if (window.authReady || window.signInAnonymously) {
        resolve();
        return;
      }
      const deadline = Date.now() + 3000;
      const interval = setInterval(() => {
        if (window.authReady || window.signInAnonymously || Date.now() > deadline) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }
  return authGlobalsPromise;
}
