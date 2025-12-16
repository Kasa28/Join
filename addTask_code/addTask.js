window.selectedUsers = window.selectedUsers || [];
window.isDropdownOpen = window.isDropdownOpen || false;

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("title"); if (!input) return;
  const msg = document.getElementById("title-error");
  const validate = () => { const ok = !!input.value.trim(); msg.textContent = ok ? "" : "This field is required."; input.style.borderBottom = ok ? "1px solid #d1d1d1" : "1px solid red"; };
  input.addEventListener("blur", validate); input.addEventListener("input", validate);
});

let hiddenDatePicker = document.createElement("input");
hiddenDatePicker.type = "date"; hiddenDatePicker.id = "hidden-date-picker"; hiddenDatePicker.name = "hidden-date-picker";
Object.assign(hiddenDatePicker.style, { position: "fixed", opacity: "0", pointerEvents: "none", height: "0", width: "0", zIndex: "1100" });
document.body.appendChild(hiddenDatePicker);

/** @param {string} dateString @returns {boolean} */
function isValidDateFormat(dateString) { return /^\d{2}\/\d{2}\/\d{4}$/.test(dateString); }

/** @param {InputEvent} e */
function sanitizeDueDateInput(e) {
  let v = e.target.value.replace(/[^\d]/g, ""); if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4);
  else if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  e.target.value = v;
}

/** @param {string} dateString @returns {boolean} */
function isRealDate(dateString) {
  const [d, m, y] = dateString.split("/").map(Number); const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** @param {HTMLElement} msg @param {HTMLElement} parent @param {string} text @returns {boolean} */
function setDueDateError(msg, parent, text) { msg.textContent = text; parent.style.borderBottom = "1px solid red"; return false; }

/** @returns {boolean} */
function validateDueDate() {
  const input = document.getElementById("due-date"); if (!input) return false;
  const wrap = input.closest(".date-input-wrapper-addTask_page"); const msg = wrap?.querySelector("#due-date-error"); const parent = input.parentElement;
  if (!msg || !parent) return false; const v = input.value.trim();
  if (!v) return setDueDateError(msg, parent, "This field is required.");
  if (!isValidDateFormat(v)) return setDueDateError(msg, parent, "Please use format dd/mm/yyyy");
  if (!isRealDate(v)) return setDueDateError(msg, parent, "Please enter a valid calendar date");
  msg.textContent = ""; parent.style.borderBottom = "1px solid #d1d1d1"; return true;
}

/** @param {HTMLInputElement} dueInput */
function positionPicker(dueInput) {
  const field = dueInput.closest(".date-field-addTask_page") || dueInput; const r = field.getBoundingClientRect();
  Object.assign(hiddenDatePicker.style, { pointerEvents: "auto", width: r.width + "px", height: r.height + "px", left: r.left + "px", top: r.top + "px" });
}

function setPickerMinToday() {
  const t = new Date(), y = t.getFullYear(), m = String(t.getMonth() + 1).padStart(2, "0"), d = String(t.getDate()).padStart(2, "0");
  hiddenDatePicker.min = `${y}-${m}-${d}`;
}

function resetPickerValue() { hiddenDatePicker.removeAttribute("value"); hiddenDatePicker.value = ""; }

let pickerSyncId = null, pickerLast = "";

/** @param {HTMLInputElement} dueInput */
function syncPickerToDue(dueInput) {
  const v = hiddenDatePicker.value || "";
  if (v === pickerLast) return; pickerLast = v;
  if (!v) { dueInput.value = ""; validateDueDate(); return; }
  const [y, m, d] = v.split("-"); dueInput.value = `${d}/${m}/${y}`; validateDueDate();
}

/** @param {HTMLInputElement} dueInput */
function startPickerSync(dueInput) {
  pickerLast = hiddenDatePicker.value || "";
  clearInterval(pickerSyncId); pickerSyncId = setInterval(() => syncPickerToDue(dueInput), 80);
}

/** @param {HTMLInputElement} dueInput */
function attachPickerChange(dueInput) {
  const h = () => syncPickerToDue(dueInput);
  hiddenDatePicker.oninput = h; hiddenDatePicker.onchange = h;
  startPickerSync(dueInput);
}


function showPickerNow() {
  hiddenDatePicker.focus();
  setTimeout(() => { if (hiddenDatePicker.showPicker) hiddenDatePicker.showPicker(); else hiddenDatePicker.click(); }, 0);
}

function openPickerSimple() {
  const dueInput = document.getElementById("due-date"); if (!dueInput) return;
  positionPicker(dueInput); setPickerMinToday(); resetPickerValue(); attachPickerChange(dueInput); showPickerNow();
}
window.openPickerSimple = openPickerSimple;

hiddenDatePicker.addEventListener("blur", () => {
  hiddenDatePicker.style.pointerEvents = "none";
  clearInterval(pickerSyncId); pickerSyncId = null;
});


const dueDateInput = document.getElementById("due-date");
if (dueDateInput) {
  dueDateInput.readOnly = true; dueDateInput.addEventListener("click", openPickerSimple);
  dueDateInput.addEventListener("input", (e) => { sanitizeDueDateInput(e); validateDueDate(); });
  dueDateInput.addEventListener("blur", validateDueDate);
}

/** @param {string} priority */
function setPriorityAddTask(priority) {
  const u = document.querySelector(".priority-btn-urgent-addTask_page"), m = document.querySelector(".priority-btn-medium-addTask_page"), l = document.querySelector(".priority-btn-low-addTask_page");
  [u, m, l].forEach((b) => { b.style.backgroundColor = "white"; b.style.color = "black"; const img = b.querySelector("img"); if (img) img.style.filter = ""; });
  m.querySelector("img").style.filter = "brightness(0) saturate(100%) invert(68%) sepia(94%) saturate(312%) hue-rotate(360deg) brightness(101%) contrast(102%)";
  const map = { urgent: [u, "#ff3d00"], medium: [m, "#ffa800"], low: [l, "#00c853"] }, t = map[priority];
  if (t) { t[0].style.backgroundColor = t[1]; t[0].style.color = "white"; t[0].querySelector("img").style.filter = "brightness(0) invert(1)"; }
  window.currentPriority = priority; window.currentPrio = priority;
}

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("subtask-delete-addTask_page")) return;
  const input = document.getElementById("subtask"); if (input) input.value = "";
});

document.addEventListener("keyup", (e) => {
  if (e.key !== "Enter") return;
  const input = document.getElementById("subtask");
  if (!input || document.activeElement !== input) return;
  const v = input.value.trim(); if (!v) return;
  e.preventDefault(); const icon = document.querySelector(".subtask-check-addTask_page"); if (icon) icon.click();
});

/** @param {HTMLElement} list @param {string} value */
function appendSubtaskItem(list, value) {
  if (!list) return;
  const li = document.createElement("li"); li.textContent = value;
  const a = document.createElement("div"); a.classList.add("subtask-actions-addTask_page");
  a.innerHTML = `<img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_page"><div class="subtask-divider-addTask_page"></div><img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page">`;
  li.appendChild(a); list.appendChild(li);
}

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("subtask-check-addTask_page")) return;
  const input = document.getElementById("subtask"), list = document.getElementById("subtask-list");
  const v = input?.value.trim() || ""; if (!v) return;
  appendSubtaskItem(list, v); input.value = "";
});

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("subtask-remove-addTask_page")) return;
  const li = e.target.closest("li"); if (li) li.remove();
});

/** @param {string} value @returns {HTMLInputElement} */
function createSubtaskEditInput(value) {
  const i = document.createElement("input");
  i.type = "text"; i.value = value; i.classList.add("task-subtask-addTask_page"); i.name = "subtask-edit"; i.setAttribute("aria-label", "Edit subtask");
  return i;
}

/** @returns {HTMLDivElement} */
function createSubtaskEditActions() {
  const a = document.createElement("div"); a.classList.add("subtask-actions-addTask_page");
  a.innerHTML = `<img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page"><div class="subtask-divider-addTask_page"></div><img src="../assets/img/check.svg" alt="Save subtask" class="subtask-save-addTask_page">`;
  return a;
}

/** @param {HTMLInputElement} input @param {HTMLLIElement} li */
function attachSubtaskEditKeyup(input, li) {
  input.addEventListener("keyup", (ev) => {
    if (ev.key !== "Enter") return;
    const v = input.value.trim(); if (!v) return;
    ev.preventDefault(); const save = li.querySelector(".subtask-save-addTask_page"); if (save) save.click();
  });
}

/** @param {MouseEvent} e */
function enableSubtaskEditing(e) {
  if (!e.target.classList.contains("subtask-edit-addTask_page")) return;
  const li = e.target.closest("li"); if (!li || !li.firstChild) return;
  const oldText = li.firstChild.textContent.trim(); li.innerHTML = "";
  const input = createSubtaskEditInput(oldText), actions = createSubtaskEditActions();
  li.append(input, actions); attachSubtaskEditKeyup(input, li);
}
document.addEventListener("click", enableSubtaskEditing);

/** @returns {HTMLDivElement} */
function createSubtaskDisplayActions() {
  const a = document.createElement("div"); a.classList.add("subtask-actions-addTask_page");
  a.innerHTML = `<img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_page"><div class="subtask-divider-addTask_page"></div><img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page">`;
  return a;
}

/** @param {MouseEvent} e */
function saveEditedSubtask(e) {
  if (!e.target.classList.contains("subtask-save-addTask_page")) return;
  const li = e.target.closest("li"); if (!li) return;
  const input = li.querySelector("input"); if (!input) return;
  const v = input.value.trim(); if (!v) { li.remove(); return; }
  li.innerHTML = ""; li.textContent = v; li.appendChild(createSubtaskDisplayActions());
}
document.addEventListener("click", saveEditedSubtask);

function clearBasicFields() {
  ["title", "description", "due-date", "subtask"].forEach((id) => { const el = document.getElementById(id); if (el) el.value = ""; });
  const list = document.getElementById("subtask-list"); if (list) list.innerHTML = "";
}

function resetCategory() { const c = document.getElementById("category"); if (c) c.selectedIndex = 0; }

function resetPriorityButtons() {
  document.querySelectorAll(".priority-group-addTask_page button").forEach((btn) => { btn.style.backgroundColor = "white"; btn.style.color = "black"; const img = btn.querySelector("img"); if (img) img.style.filter = ""; });
  setPriorityAddTask("medium");
}

function resetAssignSection() {
  window.selectedUsers = [];
  const p = document.querySelector(".assign-placeholder-addTask_page");
  if (p) { p.textContent = "Select contact to assign"; p.style.color = "black"; }
  document.querySelectorAll(".assign-check-addTask_page").forEach((cb) => (cb.checked = false));
  const av = document.getElementById("assigned-avatars"); if (av) av.innerHTML = "";
}

function clearErrors() { document.querySelectorAll(".error-text").forEach((e) => (e.textContent = "")); }

function clearForm() { clearBasicFields(); resetCategory(); resetPriorityButtons(); resetAssignSection(); clearErrors(); }

/** @returns {HTMLElement} */
function ensureToastRoot() {
  let root = document.getElementById("toast-root");
  if (!root) { root = document.createElement("div"); root.id = "toast-root"; document.body.appendChild(root); }
  return root;
}

/** @param {HTMLElement} el */
function hideToast(el) {
  el.classList.remove("toast--show"); el.classList.add("toast--hide");
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

/** @param {string} text @param {{variant?: "ok"|"error", duration?: number}} [options] */
function showToast(text, { variant = "ok", duration = 1000 } = {}) {
  const root = ensureToastRoot(); const el = document.createElement("div");
  el.className = "toast toast--show" + (variant === "error" ? " toast--error" : "");
  el.innerHTML = `<span>${text}</span><span class="toast-icon" aria-hidden="true"></span>`;
  root.appendChild(el); setTimeout(() => hideToast(el), duration);
}
window.showToast = showToast;

/**
 * @returns {{
 *  title:string, dueDate:string, description:string, category:string, priority:string
 * } | null}
 */
function readTaskForm() {
  const title = (document.getElementById("title")?.value || "").trim();
  const dueDate = (document.getElementById("due-date")?.value || "").trim();
  const description = (document.getElementById("description")?.value || "").trim();
  const category = (document.getElementById("category")?.value || "").trim();
  if (!title) { showToast("Please enter a title", { variant: "error", duration: 1600 }); return null; }
  if (!dueDate) { showToast("Please enter a due date", { variant: "error", duration: 1600 }); return null; }
  if (!isValidDateFormat(dueDate) || !isRealDate(dueDate)) { showToast("Please enter a valid date in format dd/mm/yyyy", { variant: "error", duration: 1600 }); return null; }
  if (!category) { showToast("Please select a category.", { variant: "error", duration: 1600 }); return null; }
  return { title, dueDate, description, category, priority: (window.currentPrio || "medium").toLowerCase() };
}

/** @returns {{name:string,color:string}[]} */
function getAssignedUsers() {
  const items = [...document.querySelectorAll(".assign-item-addTask_page")], selected = window.selectedUsers || [];
  return selected.map((name) => {
    const item = items.find((el) => el.querySelector(".assign-name-addTask_page").textContent.trim() === name);
    const av = item?.querySelector(".assign-avatar-addTask_page"); return { name, color: av ? av.style.backgroundColor : "#4589ff" };
  });
}

/** @returns {string[]} */
function getSubtasks() {
  return Array.from(document.querySelectorAll("#subtask-list li"))
    .map((li) => li.firstChild?.textContent?.trim() || "").filter((t) => t !== "");
}

/** @param {{title:string,dueDate:string,description:string,category:string,priority:string}} data @returns {Object} */
function buildTask(data) {
  const icons = { urgent: "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg", medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg", low: "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg" };
  const subTasks = getSubtasks(), status = window.nextTaskTargetStatus || "todo";
  return { id: Date.now(), title: data.title, description: data.description, dueDate: data.dueDate, priority: data.priority, priorityIcon: icons[data.priority] || icons.low, status, type: data.category === "technical" ? "Technical Task" : "User Story", subTasks, subtasksDone: 0, subtasksTotal: subTasks.length, assignedTo: getAssignedUsers() };
}

function redirectToBoard() { window.location.href = "../board_code/board.html"; }

/** @returns {Promise<void>} */
async function createTask() {
  const data = readTaskForm(); if (!data) return;
  const task = buildTask(data);
  try { await saveTask(task.id, task); showToast("Task added to board", { duration: 1600 }); setTimeout(redirectToBoard, 1700); }
  catch (err) { console.error("Error saving task:", err); showToast("Error saving task", { variant: "error", duration: 2000 }); }
}
window.createTask = createTask;
