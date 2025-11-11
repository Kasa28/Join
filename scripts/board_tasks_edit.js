/* === board_tasks_edit.js | Handles editing, creation, and form logic === */

/* === Dynamic Modal Handling (open, delete) === */
function openModalDynamic(id) {
  const task = window.tasks?.find((t) => t.id === id);
  if (!task) return;
  const modal = document.getElementById("task-modal");
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

async function deleteDynamicTask(id) {
  const allTasks = Array.isArray(window.tasks) ? window.tasks : [];
  const task = allTasks.find((t) => t.id === id);
  if (!task) {
    alert("Task not found.");
    return;
  }
  if (isDemoTask(task)) {
    alert("Demo tasks can only be moved.");
    return;
  }
  window.tasks = allTasks.filter((t) => t.id !== id);
  const cardEl = document.getElementById("card-" + id);
  if (cardEl && cardEl.parentNode) cardEl.parentNode.removeChild(cardEl);
  closeTaskModal();
  requestAnimationFrame(() => {
    if (typeof render === "function") render();
  });
  await fetch(
    `https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks/${id}.json`,
    {
      method: "DELETE",
    }
  );
  persistTasks();
}

/* === Edit Overlay Setup === */
function readSubtasksFromForm() {
  const list = document.getElementById("subtask-list");
  if (!list) return [];
  return Array.from(list.querySelectorAll("li"))
    .map((li) => {
      const input = li.querySelector("input");
      const raw = input
        ? input.value
        : li.firstChild?.textContent || li.textContent;
      return String(raw || "").trim();
    })
    .filter(Boolean);
}

function populateEditOverlay(task) {
  const content = document.getElementById("addtask-content");
  if (!content) return;
  const heading = content.querySelector(".h1-addTask_template");
  if (heading) heading.textContent = "Edit Task";
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
    const value =
      String(task.type).toLowerCase() === "technical task"
        ? "technical"
        : "user-story";
    categorySelect.value = value;
  }
  const priority = String(task.priority || "low").toLowerCase();
  window.currentPrio = priority;
  if (typeof setPriorityAddTask === "function") setPriorityAddTask(priority);
  window.selectedUsers = (task.assignedTo || []).map((p) => p.name);
  window.selectedUserColors = (task.assignedTo || []).reduce((acc, person) => {
    if (person && person.name) acc[person.name] = person.color || "#4589ff";
    return acc;
  }, {});
  hydrateAssignSection(task);
  const subtaskList = content.querySelector("#subtask-list");
  if (subtaskList) {
    subtaskList.innerHTML = "";
    (task.subTasks || []).filter(Boolean).forEach((text) => {
      subtaskList.appendChild(buildSubtaskListItem(text));
    });
  }
  const subtaskInput = content.querySelector("#subtask");
  if (subtaskInput) subtaskInput.value = "";
  const submitBtn = content.querySelector(".btn-done-addTask_template");
  if (submitBtn) {
    submitBtn.removeAttribute("onclick");
    submitBtn.onclick = () => saveTaskEdits(task.id);
    submitBtn.innerHTML = `OK <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/check.svg" alt="Check icon" class="check-icon-addTask_template">`;
  }
}

/* === Subtask Progress Normalization === */
function normaliseSubtaskProgress(task) {
  if (!task) return;
  const total = Array.isArray(task.subTasks) ? task.subTasks.length : 0;
  task.subtasksTotal = total;
  const done = Math.min(Number(task.subtasksDone) || 0, total);
  task.subtasksDone = done;
  if (window.saved) {
    const prev = Array.isArray(window.saved[task.id])
      ? window.saved[task.id]
      : [];
    const next = prev.slice(0, total);
    while (next.length < total) next.push(false);
    window.saved[task.id] = next;
    try {
      localStorage.setItem("checks", JSON.stringify(window.saved));
    } catch (e) {
      console.warn("Could not persist checkbox states", e);
    }
  }
}

/* === Edit and Save Task Logic === */
function saveTaskEdits(id) {
  const task = Array.isArray(window.tasks)
    ? window.tasks.find((t) => t.id === id)
    : null;
  if (!task) {
    alert("Task not found.");
    return;
  }
  if (isDemoTask(task)) {
    alert("Demo tasks can only be moved.");
    return;
  }
  const titleInput = document.getElementById("title");
  const title = titleInput ? titleInput.value.trim() : "";
  if (!title) {
    alert("Please enter a title.");
    titleInput?.focus();
    return;
  }
  const description =
    document.getElementById("description")?.value.trim() || "";
  const dueDate = document.getElementById("due-date")?.value.trim() || "";
  const isDueDateValid =
    typeof validateDueDate === "function" ? validateDueDate() : true;
  if (!isDueDateValid) return;
  const categorySelect = document.getElementById("category");
  const categoryValue = categorySelect ? categorySelect.value : "";
  const priority = String(
    window.currentPrio || task.priority || "low"
  ).toLowerCase();
  const assigned =
    typeof assignedToDataExtractSafe === "function"
      ? assignedToDataExtractSafe()
      : task.assignedTo || [];

  const subtasks = readSubtasksFromForm();
  task.title = title;
  task.description = description;
  task.dueDate = dueDate;
  task.type = categoryValue === "technical" ? "Technical Task" : "User Story";
  task.priority = priority;
  const priorityIcons = {
    urgent:
      "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg",
    medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
    low: "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg",
  };
  task.priorityIcon = priorityIcons[priority] || task.priorityIcon;
  task.assignedTo = assigned;
  task.subTasks = subtasks;
  normaliseSubtaskProgress(task);
  persistTasks();
  if (typeof render === "function") render();
  closeAddTask();
}

function startEditTask(id) {
  const task = Array.isArray(window.tasks)
    ? window.tasks.find((t) => t.id === id)
    : null;
  if (!task) {
    alert("Task not found.");
    return;
  }
  if (isDemoTask(task)) {
    alert("Demo tasks can only be moved.");
    return;
  }
  closeTaskModal();
  window.taskBeingEdited = id;
  window.nextTaskTargetStatus = task.status || window.STATUS?.TODO || "todo";

  if (typeof openAddTask === "function") {
    openAddTask();
    requestAnimationFrame(() => populateEditOverlay(task));
  }
}

window.startEditTask = startEditTask;

/* === Add Task Shortcuts and Creation === */
if (!window.openAddTaskWithStatus) {
  window.openAddTaskWithStatus = function (status) {
    window.nextTaskTargetStatus = status || window.STATUS.TODO;
    if (typeof openAddTask === "function") openAddTask();
  };
}

if (!window.openAddTaskFromPlus) {
  window.openAddTaskFromPlus = function (e) {
    const s = e?.currentTarget?.dataset?.target || window.STATUS.TODO;
    window.openAddTaskWithStatus(s);
  };
}

function mapCategoryToType(value) {
  return value === "technical" ? "Technical Task" : "User Story";
}

function assignedToDataExtractSafe() {
  if (typeof assignedToDataExtract === "function")
    return assignedToDataExtract();
  const assigned = [];
  const avatars = document.querySelectorAll(
    "#assigned-avatars .assign-avatar-addTask_template, #assigned-avatars .assign-avatar-addTask_page"
  );

  avatars.forEach((el) => {
    const initials = el.textContent.trim();
    const dataName = el.dataset?.fullName;
    const nameFromList = (window.selectedUsers || []).find(
      (n) => n === dataName || (!dataName && n && n.startsWith(initials))
    );
    const fullName = dataName || nameFromList || initials;
    const color =
      el.dataset?.color ||
      (window.selectedUserColors && fullName
        ? window.selectedUserColors[fullName]
        : null) ||
      el.style.backgroundColor ||
      "#4589ff";
    assigned.push({ name: fullName, color });
  });

  return assigned;
}

function getSubtasksSafe() {
  if (typeof getSubtasks === "function") return getSubtasks();
  const v = (document.getElementById("subtask")?.value || "").trim();
  return v ? [v] : [];
}

function generateTaskId() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function collectTaskFromForm() {
  const title = (document.getElementById("title")?.value || "").trim();
  const description = (
    document.getElementById("description")?.value || ""
  ).trim();
  const dueDate = (document.getElementById("due-date")?.value || "").trim();
  const categoryVal = document.getElementById("category")?.value || "";
  const subtasks = getSubtasksSafe();

  return {
    id: generateTaskId(),
    title,
    description,
    type: mapCategoryToType(categoryVal),
    status: window.nextTaskTargetStatus,
    dueDate,
    priority: window.currentPrio,
    assignedTo: assignedToDataExtractSafe(),
    subtasksDone: 0,
    subtasksTotal: subtasks.length,
    subTasks: subtasks,
  };
}

function createTask(event) {
  if (event && event.preventDefault) event.preventDefault();
  const task = collectTaskFromForm();
  if (!task.title) {
    alert("Bitte Titel eingeben!");
    return;
  }

  window.tasks = Array.isArray(window.tasks) ? window.tasks : [];
  window.tasks.push(task);
  persistTasks();
  if (typeof render === "function") render();

  if (typeof closeAddTask === "function") closeAddTask();
  window.nextTaskTargetStatus = window.STATUS.TODO;
}

window.createTask = createTask;

/* === Priority Button Handling === */
window.currentPrio = window.currentPrio || "low";
window.setPriority = function (prio) {
  window.currentPrio = String(prio || "low").toLowerCase();
  const wrap = document.querySelector(
    ".priority-group-addTask_template, .priority-group-addTask_page"
  );
  if (!wrap) return;
  wrap
    .querySelectorAll("button")
    .forEach((btn) => btn.classList.remove("active-prio"));
  const map = {
    urgent:
      ".priority-btn-urgent-addTask_template, .priority-btn-urgent-addTask_page",
    medium:
      ".priority-btn-medium-addTask_template, .priority-btn-medium-addTask_page",
    low: ".priority-btn-low-addTask_template,    .priority-btn-low-addTask_page",
  };
  const active = wrap.querySelector(map[window.currentPrio]);
  if (active) active.classList.add("active-prio");
};

/* === Modal Fallback Template === */
function fallbackModal(task) {
  return `
      <div style="padding:24px">
        <h2>${task?.title || "Task"}</h2>
        <p>${task?.description || ""}</p>
        <p><em>No template found.</em></p>
        <button onclick="closeTaskModal()">Close</button>
      </div>`;
}
