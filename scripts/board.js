/**
 * @type {Record<string, boolean[]>}
 */
window.saved = JSON.parse(localStorage.getItem("checks") || "{}");
const saved = window.saved;

/**
 * @type {Task[]}
 */
const demoTasks = [
  {
    id: 1,
    title: "Kochwelt Page & Recipe Recommender",
    description: "Build start page with recipe recommendation...",
    type: "User Story",
    status: "in-progress",
    dueDate: "10/05/2023",
    priority: "medium",
    subtasksDone: 1,
    subtasksTotal: 2,
    assignedTo: [
      { name: "Emmanuel Mauer", img: "../assets/img/EM.svg" },
      { name: "Marcel Bauer", img: "../assets/img/mb.svg" },
      { name: "Anton Mayer", img: "../assets/img/AM.svg" },
    ],
  },
  {
    id: 2,
    title: "CSS Architecture Planning",
    description: "Define CSS naming conventions and structure.",
    type: "Technical Task",
    status: "await-feedback",
    dueDate: "02/09/2023",
    priority: "medium",
    subtasksDone: 2,
    subtasksTotal: 2,
    assignedTo: [
      { name: "Sofia Müller", img: "../assets/img/AM2.svg" },
      { name: "Benedikt Ziegler", img: "../assets/img/BZ.svg" },
    ],
  },
];

/**
 * Ensures there is an authenticated Firebase user (anonymous fallback).
 * @returns {Promise<import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js").User|null>}
 */
async function ensureBoardAuth() {
  if (window.authReady) await window.authReady;
  if (!window.currentUser && typeof window.signInAnonymously === "function") {
    await window.signInAnonymously();
    if (window.authReady) await window.authReady;
  }
  return window.currentUser || null;
}

/**
 * Returns an auth query param for Realtime DB requests if available.
 * @returns {Promise<string>}
 */
async function getBoardAuthQuery() {
  await ensureBoardAuth();
  const token = await window.auth?.currentUser?.getIdToken?.();
  return token ? `?auth=${encodeURIComponent(token)}` : "";
}

/**
 * Wrapper for auth-protected task requests.
 * @param {string} pathSuffix
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
async function fetchBoardTasks(pathSuffix, options) {
  const base =
    window.BASE_URL ||
    "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";
  const authQuery = await getBoardAuthQuery();
  const url = authQuery
    ? `${base}tasks${pathSuffix}.json${authQuery}`
    : `${base}tasks${pathSuffix}.json`;
  return fetch(url, options);
}

/**
 * Loads tasks from Firebase or falls back to demo data.
 * @async
 * @returns {Promise<void>}
 */
async function loadTasksFromFirebase() {
  try {
    window.tasks = await downloadTasksOrDemo();
    render();
  } catch (error) {
    handleFirebaseFallback(error);
  }
}

/**
 * Downloads tasks from Firebase or returns demo tasks if none exist.
 * @async
 * @returns {Promise<Task[]>}
 */
async function downloadTasksOrDemo() {
  const response = await fetchBoardTasks("");
  if (!response.ok) throw new Error(`Firebase responded ${response.status}`);
  const firebaseTasks = extractFirebaseTasks(await response.json());
  if (firebaseTasks.length) return firebaseTasks;
  await seedDemoTasks();
  return demoTasks.map((t) => ({ ...t }));
}

/**
 * Extracts task objects from Firebase response.
 * @param {unknown} data
 * @returns {Task[]}
 */
function extractFirebaseTasks(data) {
  if (!data || typeof data !== "object") return [];
  return Object.values(data).filter(
    (t) => t && typeof t === "object" && "status" in t
  );
}

/**
 * Seeds demo tasks into Firebase.
 * @async
 * @returns {Promise<void>}
 */
async function seedDemoTasks() {
  const demoObject = demoTasks.reduce((acc, t) => ({ ...acc, [t.id]: t }), {});
  await fetchBoardTasks("", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(demoObject),
  });
}

/**
 * Handles Firebase load errors by applying demo tasks.
 * @param {unknown} error
 * @returns {void}
 */
function handleFirebaseFallback(error) {
  console.error("Fehler beim Laden der Tasks aus Firebase:", error);
  window.tasks = demoTasks.map((t) => ({ ...t }));
  render();
}

/**
 * @type {number|undefined}
 */
let updateTimeout;

/**
 * Detects whether a task is a demo task by id.
 * @param {Task|number|string} taskOrId
 * @returns {boolean}
 */
function isDemoTask(taskOrId) {
  const idValue =
    typeof taskOrId === "object" && taskOrId !== null ? taskOrId.id : taskOrId;
  const numericId = Number.parseInt(idValue, 10);
  return Number.isFinite(numericId) && numericId > 0 && numericId <= 1000;
}

/**
 * @type {string|null}
 */
let whichCardActuellDrop = null;
/**
 * @type {string}
 */
let searchQuery = "";
/**
 * @type {HTMLElement|null}
 */
let currentDragCardEl = null;
/**
 * @type {number|null}
 */
let lastDragPointerX = null;
/**
 * @type {number|null}
 */
let autoMoveTimeoutId = null;
/**
 * @type {TaskStatus|null}
 */
let pendingAutoMoveStatus = null;
/**
 * @type {boolean}
 */
let needsDraggingClassAfterRender = false;
/**
 * @type {string|null}
 */
let pendingDragTiltClass = null;
/**
 * @type {string|null}
 */
let activeHighlightColumnId = null;

/**
 * Updates visibility and ARIA state of the clear search button.
 * @param {HTMLInputElement|null} inputEl
 * @returns {void}
 */
function updateSearchClearButtonState(inputEl) {
  const clearBtn = document.getElementById("board-search-clear");
  if (!clearBtn) return;
  const value = (inputEl?.value || "").trim();
  const shouldShow = value.length > 0;
  clearBtn.classList.toggle("is-visible", shouldShow);
  clearBtn.setAttribute("aria-hidden", shouldShow ? "false" : "true");
}

/**
 * @type {Record<TaskStatus, {id: string, empty: string}>}
 */
const nameOfTheCard = {
  todo: { id: "drag-area-todo", empty: "No tasks To do" },
  "in-progress": { id: "drag-area-in-progress", empty: "No tasks in Progress" },
  "await-feedback": {
    id: "drag-area-await-feedback",
    empty: "No tasks in Feedback",
  },
  done: { id: "drag-area-done", empty: "No task in Done" },
};

/**
 * @type {Record<string, TaskStatus>}
 */
const statusByColumnId = Object.fromEntries(
  Object.entries(nameOfTheCard).map(([status, { id }]) => [id, status])
);

/**
 * @type {Record<TaskPriority, string>}
 */
const prioritätIcon = {
  urgent: "../assets/img/Prio baja-urgent-red.svg",
  medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
  low: "../assets/img/Prio baja-low.svg",
};

/**
 * @type {{TODO: TaskStatus, INPROGRESS: TaskStatus, AWAIT: TaskStatus, DONE: TaskStatus}}
 */
window.STATUS = window.STATUS || {
  TODO: "todo",
  INPROGRESS: "in-progress",
  AWAIT: "await-feedback",
  DONE: "done",
};

/**
 * @type {TaskStatus}
 */
window.nextTaskTargetStatus = window.nextTaskTargetStatus || window.STATUS.TODO;
/**
 * @type {TaskPriority}
 */
window.currentPrio = window.currentPrio || "low";
/**
 * @type {Record<string, string>}
 */
window.selectedUserColors = window.selectedUserColors || {};

/**
 * Persists all tasks to Firebase and updates summary if available.
 * @async
 * @returns {Promise<void>}
 */
async function persistTasks() {
  try {
    for (const t of window.tasks) {
      await fetchBoardTasks(`/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
    }
    if (typeof updateSummary === "function") {
      await updateSummary();
    }
  } catch (e) {
    console.warn("Could not update tasks in Firebase:", e);
  }
}

/**
 * Updates subtasks progress for a given task and syncs to Firebase.
 * @param {number|string} id
 * @param {HTMLElement} el
 * @returns {void}
 */
window.updateSubtasks = (id, el) => {
  const list = el?.closest?.(
    ".subtask-list, .subtasks-task-container-technical-task"
  );
  if (!list) {
    return;
  }
  const subtaskListe = [...list.querySelectorAll('input[type="checkbox"]')];
  const done = subtaskListe.filter((x) => x.checked).length;
  const total = subtaskListe.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const cardElement = document.getElementById("card-" + id);
  if (cardElement) {
    const track = cardElement.querySelector(".progress-track");
    const fill = cardElement.querySelector(".progress-fill");
    const st = cardElement.querySelector(".subtasks");
    const hasSubtasks = total > 0;
    if (track) track.style.display = hasSubtasks ? "" : "none";
    if (fill) fill.style.width = (hasSubtasks ? percent : 0) + "%";
    if (st) {
      st.style.display = hasSubtasks ? "" : "none";
      st.textContent = hasSubtasks ? `${done}/${total} Subtasks` : "";
    }
  }
  saved[id] = subtaskListe.map((x) => x.checked);
  localStorage.setItem("checks", JSON.stringify(saved));
  const task = window.tasks.find((t) => t.id == id);
  if (task) {
    task.subtasksDone = done;
    task.subtasksTotal = total;
    fetchBoardTasks(`/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subtasksDone: done,
        subtasksTotal: total,
      }),
    });
  }
};

/**
 * @type {((this: Window, ev: Event) => any)|null}
 */
const prevOnload = window.onload;

/**
 * Window onload handler to initialize tasks and restore subtasks.
 * @async
 * @returns {Promise<void>}
 */
window.onload = async () => {
  if (typeof prevOnload === "function") prevOnload();
  await loadTasksFromFirebase();
  for (const [taskId, states] of Object.entries(window.saved)) {
    const task = Array.isArray(window.tasks)
      ? window.tasks.find((t) => t.id == taskId)
      : null;
    if (task) {
      task.subtasksTotal = states.length;
      task.subtasksDone = states.filter(Boolean).length;
    }
  }
};
