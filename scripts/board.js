/* === board.js | Data management and Firebase synchronization === */

/* === Persistente Daten (Subtask-Checkboxen) === */
window.saved = JSON.parse(localStorage.getItem("checks") || "{}");
const saved = window.saved;

/* === Demo-Tasks & Firebase Loading === */
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
    priority: "urgent",
    subtasksDone: 2,
    subtasksTotal: 2,
    assignedTo: [
      { name: "Sofia Müller", img: "../assets/img/AM2.svg" },
      { name: "Benedikt Ziegler", img: "../assets/img/BZ.svg" },
    ],
  },
];

/* === Firebase: Tasks laden === */
async function loadTasksFromFirebase() {
  try {
    const response = await fetch(
      "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks.json"
    );
    const data = await response.json();
    const firebaseTasks = data ? Object.values(data) : [];
    if (firebaseTasks.length === 0) {
      console.log("Firebase leer – lade Demo-Tasks hoch...");
      const demoObject = demoTasks.reduce(
        (acc, t) => ({ ...acc, [t.id]: t }),
        {}
      );
      await fetch(
        "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks.json",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(demoObject),
        }
      );
      window.tasks = demoTasks.map((t) => ({ ...t }));
    } else {
      window.tasks = firebaseTasks;
    }
    render();
  } catch (error) {
    console.error("Fehler beim Laden der Tasks aus Firebase:", error);
    window.tasks = demoTasks.map((t) => ({ ...t }));
    render();
  }
}

let updateTimeout;
subscribeToFirebaseUpdates((data) => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    if (!data) return;
    window.tasks = Object.values(data);
    render();
    console.log("🔄 Board updated via Firebase realtime");
  }, 200);
});

function isDemoTask(taskOrId) {
  const idValue =
    typeof taskOrId === "object" && taskOrId !== null ? taskOrId.id : taskOrId;
  const numericId = Number.parseInt(idValue, 10);
  return Number.isFinite(numericId) && numericId > 0 && numericId <= 1000;
}

/* === Globale Zustände & Mappings === */
let whichCardActuellDrop = null;
let searchQuery = "";
let currentDragCardEl = null;
let lastDragPointerX = null;
let autoMoveTimeoutId = null;
let pendingAutoMoveStatus = null;
let needsDraggingClassAfterRender = false;
let pendingDragTiltClass = null;
let activeHighlightColumnId = null;

function updateSearchClearButtonState(inputEl) {
  const clearBtn = document.getElementById("board-search-clear");
  if (!clearBtn) return;
  const value = (inputEl?.value || "").trim();
  const shouldShow = value.length > 0;
  clearBtn.classList.toggle("is-visible", shouldShow);
  clearBtn.setAttribute("aria-hidden", shouldShow ? "false" : "true");
}

const nameOfTheCard = {
  todo: { id: "drag-area-todo", empty: "No tasks To do" },
  "in-progress": { id: "drag-area-in-progress", empty: "No tasks in Progress" },
  "await-feedback": {
    id: "drag-area-await-feedback",
    empty: "No tasks in Feedback",
  },
  done: { id: "drag-area-done", empty: "No task in Done" },
};

const statusByColumnId = Object.fromEntries(
  Object.entries(nameOfTheCard).map(([status, { id }]) => [id, status])
);

const prioritätIcon = {
  urgent: "../assets/img/Prio baja-urgent-red.svg",
  medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
  low: "../assets/img/Prio baja-low.svg",
};

window.STATUS = window.STATUS || {
  TODO: "todo",
  INPROGRESS: "in-progress",
  AWAIT: "await-feedback",
  DONE: "done",
};

window.nextTaskTargetStatus = window.nextTaskTargetStatus || window.STATUS.TODO;
window.currentPrio = window.currentPrio || "low";
window.selectedUserColors = window.selectedUserColors || {};

async function persistTasks() {
  try {
    for (const t of window.tasks) {
      await fetch(
        `https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks/${t.id}.json`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(t),
        }
      );
    }
    if (typeof updateSummary === "function") {
      await updateSummary();
    }
  } catch (e) {
    console.warn("Could not update tasks in Firebase:", e);
  }
}
