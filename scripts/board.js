/*************************************************
 * 0) Persistente Daten (Subtask-Checkboxen)
 *************************************************/
window.saved = JSON.parse(localStorage.getItem("checks") || "{}");
const saved = window.saved;

/*************************************************
 * 1) Demo-Tasks (id <= 1000). Neue Tasks kommen
 *    später zusätzlich aus LocalStorage rein.
 *************************************************/
const demoTasks = [
  {
    id: 1,
    title: "Kochwelt Page & Recipe Recommender",
    description: "Build start page with recipe recommendation...",
    type: "User Story",
    status: "in-progress",
    dueDate: "10/05/2023",
    priority: "medium",
    priorityIcon: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
    subtasksDone: 1,
    subtasksTotal: 2,
    assignedTo: [
      { name: "Emmanuel Mauer", img: "../assets/img/EM.svg" },
      { name: "Marcel Bauer",   img: "../assets/img/mb.svg" },
      { name: "Anton Mayer",    img: "../assets/img/AM.svg" },
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
      { name: "Sofia Müller",      img: "../assets/img/AM2.svg" },
      { name: "Benedikt Ziegler",  img: "../assets/img/BZ.svg"  },
    ],
  },
];
const persistedTasksRaw = JSON.parse(localStorage.getItem("tasks") || "[]");
const hasPersistedTasks = Array.isArray(persistedTasksRaw) && persistedTasksRaw.length > 0;
const initialTasks = hasPersistedTasks
  ? persistedTasksRaw
  : demoTasks.map((task) => ({ ...task }));

window.tasks = initialTasks;

if (!hasPersistedTasks) {
  try {
    localStorage.setItem("tasks", JSON.stringify(window.tasks));
  } catch (e) {
    console.warn("Could not initialise tasks in localStorage:", e);
  }
}

/*************************************************
 * 2) Globale Zustände & Mappings
 *************************************************/
let whichCardActuellDrop = null;     // gerade gezogene Karte
let searchQuery = "";                // Suchstring (klein geschrieben)

const nameOfTheCard = {
  todo:             { id: "drag-area-todo",           empty: "No tasks To do" },
  "in-progress":    { id: "drag-area-in-progress",    empty: "No tasks in Progress" },
  "await-feedback": { id: "drag-area-await-feedback", empty: "No tasks in Feedback" },
  done:             { id: "drag-area-done",           empty: "No task in Done" },
};

const prioritätIcon = {
  urgent: "../assets/img/Prio baja-urgent-red.svg",
  medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
  low:    "../assets/img/Prio baja-low.svg",
};

window.STATUS = window.STATUS || {
  TODO: 'todo',
  INPROGRESS: 'in-progress',
  AWAIT: 'await-feedback',
  DONE: 'done'
};
window.nextTaskTargetStatus = window.nextTaskTargetStatus || window.STATUS.TODO;
window.currentPrio          = window.currentPrio || 'low';
window.selectedUserColors   = window.selectedUserColors || {};


function persistTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(window.tasks));
  } catch (e) {
    console.warn("Could not update tasks in localStorage:", e);
  }
}

/*************************************************
 * 3) Suche: Eingabe -> render() -> Trefferanzeige
 *************************************************/
window.searchTasks = function () {
  const input = document.getElementById("board-search");
  const msg   = document.getElementById("search-msg");

  searchQuery = (input?.value || "").trim().toLowerCase();
  render();

  if (!msg) return;
  if (!searchQuery) { msg.textContent = ""; msg.className = ""; return; }

  const count = document.querySelectorAll(".task-card").length;
  msg.textContent = count === 0 ? "Keine Treffer."
                  : count === 1 ? "1 Treffer."
                  : count + " Treffer.";
  msg.className = count === 0 ? "msg-red" : "msg-green";
};

/** prüft, ob Task zum Suchbegriff passt */
function matchesSearch(t) {
  if (!searchQuery) return true;
  const title = String(t.title || "").toLowerCase();
  const desc  = String(t.description || "").toLowerCase();
  const type  = String(t.type || "").toLowerCase();
  const prio  = String(t.priority || "").toLowerCase();
  const ass   = (t.assignedTo || []).map(p => String(p.name || "").toLowerCase()).join(" ");
  const idStr = String(t.id);

  return (
    title.includes(searchQuery) ||
    desc.includes(searchQuery)  ||
    type.includes(searchQuery)  ||
    prio.includes(searchQuery)  ||
    ass.includes(searchQuery)   ||
    idStr.includes(searchQuery)
  );
}

/*************************************************
 * 4) Drag & Drop
 *************************************************/
window.allowDrop = (e) => e.preventDefault();

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
  } catch (e) { /* Safari etc. */ }
  document.body.classList.add("dragging");
};
window.onCardDragEnd = function () {
  document.body.classList.remove("dragging");
};
window.moveTo = function (newStatus) {
  if (whichCardActuellDrop == null) return;
    const idx = Array.isArray(window.tasks)
    ? window.tasks.findIndex((t) => t.id === whichCardActuellDrop)
    : -1;
  if (idx > -1) {
        window.tasks[idx].status = newStatus;
    persistTasks();
    render();
  }
};

/*************************************************
 * 5) Karten-Rendering (+ Nacharbeiten)
 *************************************************/
function renderCard(t) {
  // nutzt dein <template id="tmpl-card"> aus dem HTML
  const tpl  = document.getElementById("tmpl-card").content.cloneNode(true);
  const card = tpl.querySelector(".task-card");

  // Basis
  card.id = `card-${t.id}`;
  card.draggable = true;
  card.ondragstart = (e) => onCardDragStart(e, t.id);
  card.ondragend   = onCardDragEnd;

  // Klick -> Modal
  card.onclick = (event) => {
    event.stopPropagation();
    openModalById(Number(t.id));
  };

  // Badge
  const badge = tpl.querySelector(".badge");
  if (badge) {
    badge.textContent = t.type;
    badge.classList.add(getBadgeClass(t.type));
  }

  // Titel & Beschreibung
  const h3 = tpl.querySelector("h3");
  if (h3) h3.textContent = t.title;
  const p = tpl.querySelector("p");
  if (p)  p.textContent = t.description;

  // Progress-Balken + Text
  const fill = tpl.querySelector(".progress-fill");
  const st   = tpl.querySelector(".subtasks");
  const pct  = t.subtasksTotal ? Math.round((t.subtasksDone / t.subtasksTotal) * 100) : 0;
  if (fill) fill.style.width = pct + "%";
  if (st)   st.textContent = `${t.subtasksDone}/${t.subtasksTotal} Subtasks`;

  return tpl;
}

function render() {
  // Spalten leeren
  Object.values(nameOfTheCard).forEach(({ id }) =>
    document.getElementById(id)?.replaceChildren()
  );

  // Karten in Spalten einfügen
  for (const t of window.tasks) {
    if (!matchesSearch(t)) continue;
    const host = document.getElementById(nameOfTheCard[t.status]?.id);
    if (host) host.appendChild(renderCard(t));
  }

  // Leere-Pille, wenn Spalte leer
  for (const { id, empty } of Object.values(nameOfTheCard)) {
    const col = document.getElementById(id);
    if (col && !col.children.length) {
      col.innerHTML = `<div class="empty-pill">${empty}</div>`;
    }
  }

  requestAnimationFrame(afterRender);
}

/** Nach dem Rendern: Avatare + Prio-Icon einsetzen */
function afterRender() {
  document.querySelectorAll(".task-card").forEach((card) => {
    const task = window.tasks.find(t => t.id == card.id.replace("card-", ""));
    if (!task) return;

    // Assignees
    const assBox = card.querySelector(".assignees");
    if (assBox) {
      assBox.innerHTML = (task.assignedTo || [])
        .map((p) => {
          if (p.img)
            return `<img src="${p.img}" class="assigned-to-picture" alt="${p.name}">`;
          const initials = p.name
            .split(/\s+/).filter(Boolean).slice(0, 2)
            .map(n => n[0]?.toUpperCase() || "").join("");
          const bg = p.color ? `background-color:${p.color};` : "";
          return `<span class="assigned-to-initials" title="${p.name}" style="${bg}">${initials}</span>`;
        })
        .join("");
    }

    // Prio-Pille
    const pill = card.querySelector(".priority-pill");
    if (pill) {
      const pr = (task.priority || "low").toLowerCase();
      const iconSrc = task.priorityIcon || prioritätIcon[pr] || prioritätIcon.low;
      pill.innerHTML = `<img src="${iconSrc}" alt="${pr}" class="prio-icon">`;
    }
  });
}

/*************************************************
 * 6) Typ-Helfer (für Badges & CSS-Laden)
 *************************************************/
function normalizeTaskType(type) {
  return String(type || "").trim().toLowerCase();
}
function isUserStoryType(type) {
  const n = normalizeTaskType(type);
  return n === "user story" || n === "user-story";
}
function isTechnicalType(type) {
  return normalizeTaskType(type) === "technical task";
}
function getBadgeClass(type) {
  return isTechnicalType(type) ? "badge-technical" : "badge-user";
}

/*************************************************
 * 7) Modal öffnen (fixe Klammern & Scopes!)
 *************************************************/
window.openModalById = (id) => {
    const task = Array.isArray(window.tasks)
    ? window.tasks.find((x) => x.id === id)
    : null;
  if (!task) return;

  const modal   = document.getElementById("task-modal");
  const content = document.getElementById("task-modal-content");
  if (!modal || !content) return;

  const taskType    = task.type;
  const isTechnical = isTechnicalType(taskType);
  const isUserStory = isUserStoryType(taskType);

  /* ===== DYNAMISCHE TASKS (id > 1000) ===== */
  if (task.id > 1000 && typeof bigCardDynamicHtml === "function") {
    // Styles nachladen
    if (isUserStory && !document.getElementById("user-story-css")) {
      const link = document.createElement("link");
      link.id = "user-story-css";
      link.rel = "stylesheet";
      link.href = "../board_code/user_story_template.css";
      document.head.appendChild(link);
    }
    if (isTechnical && !document.getElementById("technical-css")) {
      const link = document.createElement("link");
      link.id = "technical-css";
      link.rel = "stylesheet";
      link.href = "../styles/board-technical.css";
      document.head.appendChild(link);
    }

    // Inhalt rendern
    if (isTechnical && typeof bigCardDynamicTechnicalHtml === "function") {
      content.innerHTML = bigCardDynamicTechnicalHtml(task);
    } else {
      content.innerHTML = bigCardDynamicHtml(task);
    }

    modal.style.display = "flex";
    document.body.classList.add("no-scroll");
    return; // dynamic-Fall fertig
  }

  /* ===== DEMO-TASKS (id <= 1000) ===== */
  if (!isTechnical && !document.getElementById("user-story-css")) {
    const link = document.createElement("link");
    link.id = "user-story-css";
    link.rel = "stylesheet";
    link.href = "../board_code/user_story_template.css"; // relativ zu board.html
    document.head.appendChild(link);
  }
  if (isTechnical && !document.getElementById("technical-css")) {
    const link = document.createElement("link");
    link.id = "technical-css";
    link.rel = "stylesheet";
    link.href = "../styles/board-technical.css";
    document.head.appendChild(link);
  }

  // HTML aus Templates oder Fallback
  const html =
    isTechnical && typeof getTechnicalTaskTemplate === "function"
      ? getTechnicalTaskTemplate(task)
      : typeof bigCardHtml === "function"
      ? bigCardHtml(task)
      : fallbackModal(task);

  content.innerHTML = html;

  // gespeicherte Checkbox-Stände wiederherstellen
  const s = typeof saved !== "undefined" ? saved[id] : null;
  if (s) {
    const boxes = content.querySelectorAll('.subtask-list input[type="checkbox"]');
    boxes.forEach((b, i) => (b.checked = !!s[i]));
    if (boxes.length) updateSubtasks(id, boxes[0]);
  }

  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
};

/** Modal schließen (global, vom Template-Button aufrufbar) */
function closeModal() {
  const modal = document.getElementById("task-modal");
  if (modal) modal.style.display = "none";
  document.body.classList.remove("no-scroll");
}
function closeTaskModal() { closeModal(); }

/*************************************************
 * 8) Add-Task Overlay öffnen/schließen
 *************************************************/
function openAddTask() {
  const overlay = document.getElementById("addtask-overlay");
  const content = document.getElementById("addtask-content");
  if (!overlay || !content) return;

  // Styles einmalig laden
  if (!document.getElementById("addtask-css")) {
    const link = document.createElement("link");
    link.id = "addtask-css";
    link.rel = "stylesheet";
    link.href = "./addTask_template.css";
    document.head.appendChild(link);
  }

  // Template einsetzen
  content.innerHTML =
    typeof getAddTaskTemplate === "function"
      ? getAddTaskTemplate()
      : '<div style="padding:16px">AddTask-Template fehlt.</div>';

  overlay.classList.add("open");
  document.body.classList.add("no-scroll");

  // Event-Handler initialisieren (falls vorhanden)
  if (typeof initAddTaskTemplateHandlers === "function") {
    initAddTaskTemplateHandlers();
  }

  // Fokus
  const titleInput = content.querySelector("#title");
  if (titleInput) titleInput.focus();
}
function closeAddTask() {
  const overlay = document.getElementById("addtask-overlay");
  const content = document.getElementById("addtask-content");
  if (!overlay || !content) return;

  overlay.classList.remove("open");
  document.body.classList.remove("no-scroll");

  // Zustände resetten
  window.taskBeingEdited    = null;
  window.selectedUsers      = [];
  window.selectedUserColors = {};
  window.isDropdownOpen     = false;

  // Inhalt etwas später leeren & CSS entfernen
  setTimeout(() => {
    content.innerHTML = "";
    const css = document.getElementById("addtask-css");
    if (css) css.remove();
  }, 300);
}

/*************************************************
 * 9) Subtasks-Progress aktualisieren + speichern
 *************************************************/
window.updateSubtasks = (id, el) => {
  const subtaskListe = [
    ...el.closest(".subtask-list").querySelectorAll('input[type="checkbox"]'),
  ];
  const done    = subtaskListe.filter((x) => x.checked).length;
  const total   = subtaskListe.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  // Fortschritt in Board-Karte
  const cardElement = document.getElementById("card-" + id);
  if (cardElement) {
    const fill = cardElement.querySelector(".progress-fill");
    const st   = cardElement.querySelector(".subtasks");
    if (fill) fill.style.width = percent + "%";
    if (st)   st.textContent = `${done}/${total} Subtasks`;
  }

  // Checkbox-Stände persistieren
  saved[id] = subtaskListe.map((x) => x.checked);
  localStorage.setItem("checks", JSON.stringify(saved));
};

/*************************************************
 * 10) Onload: gespeicherte Subtask-Stände anwenden
 *************************************************/
const prevOnload = window.onload;
window.onload = () => {
  if (typeof prevOnload === "function") prevOnload();

  for (const [taskId, states] of Object.entries(window.saved)) {
        const task = Array.isArray(window.tasks)
      ? window.tasks.find((t) => t.id == taskId)
      : null;
    if (task) {
      task.subtasksTotal = states.length;
      task.subtasksDone  = states.filter(Boolean).length;
    }
  }
  persistTasks();
  render();
  };

/*************************************************
 * 12) Dynamisches Modal (Fallback), löschen, editieren
 *************************************************/
function openModalDynamic(id) {
  const task = window.tasks?.find(t => t.id === id);
  if (!task) return;

  const modal   = document.getElementById("task-modal");
  const content = document.getElementById("task-modal-content");
  if (!modal || !content) return;

  if (typeof bigCardDynamicHtml === "function") {
    content.innerHTML = bigCardDynamicHtml(task);
  } else {
    content.innerHTML = `<p style="padding:16px">Dynamic Template fehlt</p>`;
  }

  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
}

function deleteDynamicTask(id) {
  const allTasks = Array.isArray(window.tasks) ? window.tasks : [];
  const task     = allTasks.find(t => t.id === id);
  if (!task) { alert("Task not found."); return; }

  // Demos schützen
  if (task.id === 1 || task.id === 2) {
    alert("Demo tasks cannot be deleted.");
    return;
  }

  window.tasks = allTasks.filter(t => t.id !== id);

  const cardEl = document.getElementById("card-" + id);
  if (cardEl && cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);

  closeTaskModal();
  requestAnimationFrame(() => { if (typeof render === "function") render(); });

  persistTasks();
}

/* ---- Edit-Overlay Helfer ---- */
function getInitialsFromName(name) {
  return String(name || "")
    .split(/\s+/).filter(Boolean)
    .map(part => part[0]?.toUpperCase() || "")
    .slice(0, 2).join("");
}
function buildSubtaskListItem(text) {
  const li = document.createElement("li");
  li.classList.add("subtask-entry-edit");
  li.textContent = text;
  const actions = document.createElement("div");
  actions.classList.add("subtask-actions-addTask_template");
  actions.innerHTML = `
      <img src="../assets/img/edit.svg"   alt="Edit subtask"   class="subtask-edit-addTask_template">
      <div class="subtask-divider-addTask_template"></div>
      <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_template">
    `;
  li.appendChild(actions);
  return li;
}
function readSubtasksFromForm() {
  const list = document.getElementById("subtask-list");
  if (!list) return [];
  return Array.from(list.querySelectorAll("li"))
    .map((li) => {
      const input = li.querySelector("input");
      const raw   = input ? input.value : li.firstChild?.textContent || li.textContent;
      return String(raw || "").trim();
    })
    .filter(Boolean);
}
function hydrateAssignSection(task) {
  const content = document.getElementById("addtask-content");
  if (!content) return;

  // Avatare
  const container = content.querySelector("#assigned-avatars");
  if (container) {
    container.innerHTML = "";
    (task.assignedTo || []).forEach((person) => {
      const initials = getInitialsFromName(person.name);
      const avatar = document.createElement("div");
      avatar.classList.add("assign-avatar-addTask_template");
      avatar.textContent = initials;
      const color = person.color || "#4589ff";
      avatar.style.backgroundColor = color;
      avatar.dataset.fullName = person.name || initials;
      avatar.dataset.color    = color;
      avatar.title            = person.name || initials;
      container.appendChild(avatar);
    });
  }

  // Checkboxen synchronisieren
  const items = content.querySelectorAll(".assign-item-addTask_template");
  items.forEach((item) => {
    const name = item.querySelector(".assign-name-addTask_template")?.textContent.trim();
    const checkbox = item.querySelector(".assign-check-addTask_template");
    const selected = (window.selectedUsers || []).includes(name);
    if (checkbox) checkbox.checked = selected;
    item.classList.toggle("selected", selected);
  });

  const placeholder = content.querySelector(".assign-placeholder-addTask_template");
  if (placeholder) {
    placeholder.textContent = (window.selectedUsers || []).length ? "" : "Select contact to assign";
    placeholder.style.color = "black";
  }
}
function populateEditOverlay(task) {
  const content = document.getElementById("addtask-content");
  if (!content) return;

  // Überschrift
  const heading = content.querySelector(".h1-addTask_template");
  if (heading) heading.textContent = "Edit Task";

  // Basisfelder
  const titleInput = content.querySelector("#title");
  if (titleInput) {
    titleInput.value = task.title || "";
    titleInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  const descriptionInput = content.querySelector("#description");
  if (descriptionInput) descriptionInput.value = task.description || "";

  const dueDateInput = content.querySelector("#due-date");
  if (dueDateInput) {
    dueDateInput.value = task.dueDate || "";
    if (typeof validateDueDate === "function") {
      requestAnimationFrame(() => validateDueDate());
    }
  }

  const categorySelect = content.querySelector("#category");
  if (categorySelect) {
    const value = String(task.type).toLowerCase() === "technical task" ? "technical" : "user-story";
    categorySelect.value = value;
  }

  // Prio & Assignees
  const priority = String(task.priority || "low").toLowerCase();
  window.currentPrio = priority;
  if (typeof setPriorityAddTask === "function") setPriorityAddTask(priority);

  window.selectedUsers = (task.assignedTo || []).map((p) => p.name);
  window.selectedUserColors = (task.assignedTo || []).reduce((acc, person) => {
    if (person && person.name) acc[person.name] = person.color || "#4589ff";
    return acc;
  }, {});
  hydrateAssignSection(task);

  // Subtasks
  const subtaskList = content.querySelector("#subtask-list");
  if (subtaskList) {
    subtaskList.innerHTML = "";
    (task.subTasks || []).filter(Boolean).forEach((text) => {
      subtaskList.appendChild(buildSubtaskListItem(text));
    });
  }
  const subtaskInput = content.querySelector("#subtask");
  if (subtaskInput) subtaskInput.value = "";

  // Button: Speichern
  const submitBtn = content.querySelector(".btn-done-addTask_template");
  if (submitBtn) {
    submitBtn.removeAttribute("onclick");
    submitBtn.onclick = () => saveTaskEdits(task.id);
    submitBtn.innerHTML =
      `Save Changes <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/check.svg" alt="Check icon" class="check-icon-addTask_template">`;
  }
}
function normaliseSubtaskProgress(task) {
  if (!task) return;
  const total = Array.isArray(task.subTasks) ? task.subTasks.length : 0;
  task.subtasksTotal = total;
  const done = Math.min(Number(task.subtasksDone) || 0, total);
  task.subtasksDone  = done;

  if (window.saved) {
    const prev = Array.isArray(window.saved[task.id]) ? window.saved[task.id] : [];
    const next = prev.slice(0, total);
    while (next.length < total) next.push(false);
    window.saved[task.id] = next;
    try { localStorage.setItem("checks", JSON.stringify(window.saved)); }
    catch (e) { console.warn("Could not persist checkbox states", e); }
  }
}
function saveTaskEdits(id) {
  const task = Array.isArray(window.tasks) ? window.tasks.find((t) => t.id === id) : null;
  if (!task) { alert("Task not found."); return; }

  const titleInput = document.getElementById("title");
  const title = titleInput ? titleInput.value.trim() : "";
  if (!title) { alert("Please enter a title."); titleInput?.focus(); return; }

  const description    = document.getElementById("description")?.value.trim() || "";
  const dueDate        = document.getElementById("due-date")?.value.trim() || "";
  const isDueDateValid = typeof validateDueDate === "function" ? validateDueDate() : true;
  if (!isDueDateValid) return;

  const categorySelect = document.getElementById("category");
  const categoryValue  = categorySelect ? categorySelect.value : "";
  const priority       = String(window.currentPrio || task.priority || "low").toLowerCase();

  const assigned = typeof assignedToDataExtractSafe === "function"
    ? assignedToDataExtractSafe()
    : task.assignedTo || [];

  const subtasks = readSubtasksFromForm();

  task.title       = title;
  task.description = description;
  task.dueDate     = dueDate;
  task.type        = categoryValue === "technical" ? "Technical Task" : "User Story";
  task.priority    = priority;

  const priorityIcons = {
    urgent: "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg",
    medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
    low:    "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg",
  };
  task.priorityIcon = priorityIcons[priority] || task.priorityIcon;

  task.assignedTo = assigned;
  task.subTasks   = subtasks;

  normaliseSubtaskProgress(task);

   persistTasks();

  if (typeof render === "function") render();
  closeAddTask();
}
function startEditTask(id) {
  const task = Array.isArray(window.tasks) ? window.tasks.find((t) => t.id === id) : null;
  if (!task) { alert("Task not found."); return; }

  closeTaskModal();
  window.taskBeingEdited      = id;
  window.nextTaskTargetStatus = task.status || window.STATUS?.TODO || "todo";

  if (typeof openAddTask === "function") {
    openAddTask();
    requestAnimationFrame(() => populateEditOverlay(task));
  }
}
window.startEditTask = startEditTask;

/*************************************************
 * 13) Add-Task Shortcuts & Erzeugung
 *************************************************/
if (!window.openAddTaskWithStatus) {
  window.openAddTaskWithStatus = function (status) {
    window.nextTaskTargetStatus = status || window.STATUS.TODO;
    if (typeof openAddTask === 'function') openAddTask();
  };
}
if (!window.openAddTaskFromPlus) {
  window.openAddTaskFromPlus = function (e) {
    const s = e?.currentTarget?.dataset?.target || window.STATUS.TODO;
    window.openAddTaskWithStatus(s);
  };
}

function mapCategoryToType(value){ return value === 'technical' ? 'Technical Task' : 'User Story'; }

function assignedToDataExtractSafe(){
  if (typeof assignedToDataExtract === 'function') return assignedToDataExtract();

  const assigned = [];
  const avatars = document.querySelectorAll(
    "#assigned-avatars .assign-avatar-addTask_template, #assigned-avatars .assign-avatar-addTask_page"
  );

  avatars.forEach(el => {
    const initials = el.textContent.trim();
    const dataName = el.dataset?.fullName;
    const nameFromList = (window.selectedUsers || []).find(
      (n) => n === dataName || (!dataName && n && n.startsWith(initials))
    );
    const fullName = dataName || nameFromList || initials;
    const color = el.dataset?.color ||
                  (window.selectedUserColors && fullName ? window.selectedUserColors[fullName] : null) ||
                  el.style.backgroundColor || "#4589ff";
    assigned.push({ name: fullName, color });
  });

  return assigned;
}
function getSubtasksSafe(){
  if (typeof getSubtasks === 'function') return getSubtasks();
  const v = (document.getElementById('subtask')?.value || '').trim();
  return v ? [v] : [];
}

function generateTaskId() {
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function collectTaskFromForm(){
  const title       = (document.getElementById('title')?.value || '').trim();
  const description = (document.getElementById('description')?.value || '').trim();
  const dueDate     = (document.getElementById('due-date')?.value || '').trim();
  const categoryVal = document.getElementById('category')?.value || '';
   const subtasks    = getSubtasksSafe();

  return {
    id: generateTaskId(),
    title,
    description,
    type:   mapCategoryToType(categoryVal),
    status: window.nextTaskTargetStatus,
    dueDate,
    priority: window.currentPrio,
    assignedTo: assignedToDataExtractSafe(),
    subtasksDone: 0,
    subtasksTotal: subtasks.length,
    subTasks: subtasks
  };
}
function createTask(event){
  if (event && event.preventDefault) event.preventDefault();

  const task = collectTaskFromForm();
  if (!task.title){ alert('Bitte Titel eingeben!'); return; }

  window.tasks = Array.isArray(window.tasks) ? window.tasks : [];
  window.tasks.push(task);
 persistTasks();
  if (typeof render === 'function') render();

  if (typeof closeAddTask === 'function') closeAddTask();
  window.nextTaskTargetStatus = window.STATUS.TODO;
}
window.createTask = createTask;

/*************************************************
 * 14) Prio-Buttons im Add-Task Template
 *************************************************/
window.currentPrio = window.currentPrio || 'low';
window.setPriority = function (prio) {
  window.currentPrio = String(prio || 'low').toLowerCase();

  const wrap = document.querySelector('.priority-group-addTask_template, .priority-group-addTask_page');
  if (!wrap) return;

  wrap.querySelectorAll('button').forEach(btn => btn.classList.remove('active-prio'));
  const map = {
    urgent: '.priority-btn-urgent-addTask_template, .priority-btn-urgent-addTask_page',
    medium: '.priority-btn-medium-addTask_template, .priority-btn-medium-addTask_page',
    low:    '.priority-btn-low-addTask_template,    .priority-btn-low-addTask_page'
  };
  const active = wrap.querySelector(map[window.currentPrio]);
  if (active) active.classList.add('active-prio');
};

/*************************************************
 * 15) (Optional) Fallback für das Modal
 *************************************************/
function fallbackModal(task){
  return `
    <div style="padding:24px">
      <h2>${task?.title || "Task"}</h2>
      <p>${task?.description || ""}</p>
      <p><em>No template found.</em></p>
      <button onclick="closeTaskModal()">Close</button>
    </div>`;
}