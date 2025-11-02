window.saved = JSON.parse(localStorage.getItem("checks") || "{}");
const saved = window.saved;

const tasks = [
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

window.tasks = tasks;

let whichCardActuellDrop = null;
let searchQuery = "";

const nameOfTheCard = {
  todo: { id: "drag-area-todo", empty: "No tasks To do" },
  "in-progress": { id: "drag-area-in-progress", empty: "No tasks in Progress" },
  "await-feedback": {
    id: "drag-area-await-feedback",
    empty: "No tasks in Feedback",
  },
  done: { id: "drag-area-done", empty: "No task in Done" },
};

const prioritätIcon = {
  urgent: "../assets/img/Prio baja-urgent-red.svg",
  medium: "/addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
  low: "../assets/img/Prio baja-low.svg",
};

window.searchTasks = function () {
  const input = document.getElementById("board-search");
  const msg = document.getElementById("search-msg");
  searchQuery = (input?.value || "").trim().toLowerCase();
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

window.allowDrop = function (event) {
  event.preventDefault();
};
window.highlight = function (id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("drag-highlight");
};
window.removeHighlight = function (id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("drag-highlight");
};
window.onCardDragStart = function (event, whichTaskId) {
  whichCardActuellDrop = whichTaskId;
  try {
    event.dataTransfer.setData("text/plain", String(whichTaskId));
    event.dataTransfer.effectAllowed = "move";
  } catch (e) {}
  document.body.classList.add("dragging");
};
window.onCardDragEnd = function () {
  document.body.classList.remove("dragging");
};
window.moveTo = function (newStatus) {
  if (whichCardActuellDrop == null) return;
  const idx = tasks.findIndex((t) => t.id === whichCardActuellDrop);
  if (idx > -1) {
    tasks[idx].status = newStatus;
    render();
  }
};

function renderCard(t) {
  const tpl = document.getElementById("tmpl-card").content.cloneNode(true);
  const card = tpl.querySelector(".task-card");
  card.id = `card-${t.id}`;
  card.ondragstart = (e) => onCardDragStart(e, t.id);
  card.ondragend = onCardDragEnd;
  card.onclick = (event) => {
    event.stopPropagation();
    openModalById(Number(t.id));
  };

  const badge = tpl.querySelector(".badge");
  if (badge) {
    badge.textContent = t.type;
    badge.classList.add(getBadgeClass(t.type));
  }
  const h3 = tpl.querySelector("h3");
  if (h3) h3.textContent = t.title;
  const p = tpl.querySelector("p");
  if (p) p.textContent = t.description;

  const fill = tpl.querySelector(".progress-fill");
  if (fill) {
    const pct = t.subtasksTotal
      ? Math.round((t.subtasksDone / t.subtasksTotal) * 100)
      : 0;
    fill.style.width = pct + "%";
  }
  const st = tpl.querySelector(".subtasks");
  if (st) st.textContent = `${t.subtasksDone}/${t.subtasksTotal} Subtasks`;

  return tpl;
}

function render() {
  Object.values(nameOfTheCard).forEach(({ id }) =>
    document.getElementById(id)?.replaceChildren()
  );

  for (const t of tasks) {
    if (!matchesSearch(t)) continue;

    const host = document.getElementById(nameOfTheCard[t.status]?.id);
    if (host) host.appendChild(renderCard(t));
  }

  for (const { id, empty } of Object.values(nameOfTheCard)) {
    const col = document.getElementById(id);
    if (col && !col.children.length) {
      col.innerHTML = `<div class="empty-pill">${empty}</div>`;
    }
  }

  requestAnimationFrame(afterRender);
}

function afterRender() {
  document.querySelectorAll(".task-card").forEach((card) => {
    const task = tasks.find((t) => t.id == card.id.replace("card-", ""));
    if (!task) return;

    const assBox = card.querySelector(".assignees");
    if (assBox) {
      assBox.innerHTML = (task.assignedTo || [])
        .map((p) => {
          if (p.img)
            return `<img src="${p.img}" class="assigned-to-picture" alt="${p.name}">`;
          const initials = p.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase() || "")
            .join("");
          const bg = p.color ? `background-color:${p.color};` : "";
          return `<span class="assigned-to-initials" title="${p.name}" style="${bg}">${initials}</span>`;
        })
        .join("");
    }

    const pill = card.querySelector(".priority-pill");
    if (pill) {
      const pr = (task.priority || "low").toLowerCase();
      const iconSrc = task.priorityIcon || prioritätIcon[pr] || prioritätIcon.low;
pill.innerHTML = `<img src="${iconSrc}" alt="${pr}" class="prio-icon">`;
    }
  });
}

function getBadgeClass(type) {
  switch (String(type)) {
    case "User Story":
      return "badge-user";
    case "Technical Task":
      return "badge-technical";
    default:
      return "badge-user";
  }
}

window.openModalById = (id) => {
  const task = tasks.find((x) => x.id === id);
  if (!task) return;
  const modal = document.getElementById("task-modal");
  const content = document.getElementById("task-modal-content");
  if (!modal || !content) return;

  // 🧩 NEUER BLOCK: Dynamische Tasks separat behandeln
  if (task && task.id > 1000 && typeof bigCardDynamicHtml === "function") {
    // 🔹 CSS für User Story laden
    if (task.type === "User Story" && !document.getElementById("user-story-css")) {
      const link = document.createElement("link");
      link.id = "user-story-css";
      link.rel = "stylesheet";
      link.href = "../board_code/user_story_template.css";
      document.head.appendChild(link);
    }
  
    // 🔹 CSS für Technical Task laden
    if (task.type === "Technical Task" && !document.getElementById("technical-css")) {
      const link = document.createElement("link");
      link.id = "technical-css";
      link.rel = "stylesheet";
      link.href = "../styles/board-technical.css";
      document.head.appendChild(link);
    }
  
    if (task.type === "Technical Task" && typeof bigCardDynamicTechnicalHtml === "function") {
      content.innerHTML = bigCardDynamicTechnicalHtml(task);
    } else {
      content.innerHTML = bigCardDynamicHtml(task);
    }
    modal.style.display = "flex";
    document.body.classList.add("no-scroll");
    return;
  }

  // 🧩 Bestehende Demo-Logik bleibt unverändert
  const isTech = String(task.type).trim().toLowerCase() === "technical task";
  const html =
    isTech && typeof getTechnicalTaskTemplate === "function"
      ? getTechnicalTaskTemplate(task)
      : typeof bigCardHtml === "function"
      ? bigCardHtml(task)
      : fallbackModal(task);

  content.innerHTML = html;

  const s = typeof saved !== "undefined" ? saved[id] : null;
  if (s) {
    const boxes = content.querySelectorAll('.subtask-list input[type="checkbox"]');
    boxes.forEach((b, i) => (b.checked = !!s[i]));
    if (boxes.length) updateSubtasks(id, boxes[0]);
  }

  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
};

function closeModal() {
  const modal = document.getElementById("task-modal");
  if (modal) modal.style.display = "none";
  document.body.classList.remove("no-scroll");
}
function closeTaskModal() {
  closeModal();
}

function openAddTask() {
  const overlay = document.getElementById("addtask-overlay");
  const content = document.getElementById("addtask-content");
  if (!overlay || !content) return;

  if (!document.getElementById("addtask-css")) {
    const link = document.createElement("link");
    link.id = "addtask-css";
    link.rel = "stylesheet";
    link.href = "./addTask_template.css";
    document.head.appendChild(link);
  }

  content.innerHTML =
    typeof getAddTaskTemplate === "function"
      ? getAddTaskTemplate()
      : '<div style="padding:16px">AddTask-Template fehlt.</div>';

  overlay.classList.add("open");
  document.body.classList.add("no-scroll"); // Body still

  //Achtung! Neu von Maya eingefügt:  Initialisierung der Event-Handler für das Template
if (typeof initAddTaskTemplateHandlers === "function") {
  initAddTaskTemplateHandlers();
}

const titleInput = content.querySelector("#title");
if (titleInput) titleInput.focus();
}

function closeAddTask() {
  const overlay = document.getElementById("addtask-overlay");
  const content = document.getElementById("addtask-content");
  if (!overlay || !content) return;

  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll"); // Body wieder frei

  setTimeout(() => {
    content.innerHTML = "";
    const css = document.getElementById("addtask-css");
    if (css) css.remove();
  }, 300);
}

window.updateSubtasks = (id, el) => {
  const subtaskListe = [
    ...el.closest(".subtask-list").querySelectorAll('input[type="checkbox"]'),
  ];
  const done = subtaskListe.filter((x) => x.checked).length;
  const total = subtaskListe.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const cardElement = document.getElementById("card-" + id);
  if (cardElement) {
    const fill = cardElement.querySelector(".progress-fill");
    const st = cardElement.querySelector(".subtasks");
    if (fill) fill.style.width = percent + "%";
    if (st) st.textContent = `${done}/${total} Subtasks`;
  }

  saved[id] = subtaskListe.map((x) => x.checked);
  localStorage.setItem("checks", JSON.stringify(saved));
};

const prevOnload = window.onload;
window.onload = () => {
  if (typeof prevOnload === "function") prevOnload();
  for (const [taskId, states] of Object.entries(window.saved)) {
    const task = tasks.find((t) => t.id == taskId);
    if (task) {
      task.subtasksTotal = states.length;
      task.subtasksDone = states.filter(Boolean).length;
    }
  }
  render();
};

function importNewTasksFromLocalStorage() {
  const saved = JSON.parse(localStorage.getItem("newTasks") || "[]");
  if (!saved.length) return;

  // Falls window.tasks noch nicht existiert → initialisieren
  window.tasks = Array.isArray(window.tasks) ? window.tasks : [];

  // Neue Tasks aus dem LocalStorage übernehmen
  for (const t of saved) {
    t.id = Date.now() + Math.floor(Math.random() * 1000);
    // Subtasks-Werte sicherstellen
    t.subtasksDone = t.subtasksDone || 0;
    t.subtasksTotal = t.subtasksTotal || (t.subTasks ? t.subTasks.length : 0);
    window.tasks.push(t);
  }

  // Board neu aufbauen
  render();

  // 🔄 Fortschritt erst nach dem Rendern aktualisieren
  requestAnimationFrame(() => {
    window.tasks.forEach(t => {
      const cardElement = document.getElementById("card-" + t.id);
      if (!cardElement) return;

      const fill = cardElement.querySelector(".progress-fill");
      const st = cardElement.querySelector(".subtasks");

      // Fortschrittsbalken und Text berechnen
      const done = Number(t.subtasksDone) || 0;
      const total = Number(t.subtasksTotal) || 0;
      const percent = total ? Math.round((done / total) * 100) : 0;

      if (fill) fill.style.width = `${percent}%`;
      if (st) st.textContent = `${done}/${total} Subtasks`;
    });
  });

  // Aufräumen – gespeicherte neuen Tasks löschen
  localStorage.removeItem("newTasks");
}

window.addEventListener("load", importNewTasksFromLocalStorage);


//Achtung! Code um dynamisches Overlay aus addTask.html und thumbnail zu erstellen!//
/**
 * Öffnet das Overlay mit dynamischen (neuen) Tasks,
 * ohne bestehende Demo-Logik zu überschreiben.
 */
function openModalDynamic(id) {
  const task = window.tasks?.find(t => t.id === id);
  if (!task) return;

  const modal = document.getElementById("task-modal");
  const content = document.getElementById("task-modal-content");
  if (!modal || !content) return;

  // Dynamisches Template für neue Tasks
  if (typeof bigCardDynamicHtml === "function") {
    content.innerHTML = bigCardDynamicHtml(task);
  } else {
    content.innerHTML = `<p style="padding:16px">Dynamic Template fehlt</p>`;
  }

  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
}