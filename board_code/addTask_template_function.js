window.selectedUsers = window.selectedUsers || [];
window.isDropdownOpen = window.isDropdownOpen || false;
window.selectedUserColors = window.selectedUserColors || {};
/** @param {"urgent"|"medium"|"low"|string} p @returns {void} */
window.setPriority = function (p) { setPriorityAddTask(p); };

let hiddenDatePickerTemplate = createHiddenDatePickerTemplate();
hiddenDatePickerTemplate.addEventListener("change", syncTemplateDueDateFromHidden);
hiddenDatePickerTemplate.addEventListener("input", syncTemplateDueDateFromHidden);

document.addEventListener("input", handleAssignFilterInput);
document.addEventListener("click", handleAssignOutsideClick);
document.addEventListener("click", handleSubtaskClick);
document.addEventListener("keyup", handleSubtaskEnter);

/** @returns {HTMLInputElement} */
function createHiddenDatePickerTemplate() {
  const i = document.createElement("input"); i.type = "date"; i.id = "hidden-date-picker-template"; i.name = "hidden-date-picker-template";
  Object.assign(i.style, { position: "absolute", opacity: "0", pointerEvents: "none", height: "0", width: "0" }); document.body.appendChild(i); return i;
}

/** @returns {void} */
function syncTemplateDueDateFromHidden() {
  const dueInput = document.getElementById("due-date"); if (!dueInput) return;
  if (!hiddenDatePickerTemplate.value) { dueInput.value = ""; validateDueDate(); return; }
  const [y, m, d] = hiddenDatePickerTemplate.value.split("-"); dueInput.value = `${d}/${m}/${y}`; validateDueDate();
}

/** @returns {void} */
function initAddTaskTemplateHandlers() {
  initTitleValidation(); initDueDateField(); setPriorityAddTask("medium");
}

/** @returns {void} */
function initTitleValidation() {
  const input = document.getElementById("title"), msg = document.getElementById("title-error"); if (!input || !msg) return;
  input.addEventListener("blur", validateTitle); input.addEventListener("input", validateTitle); validateTitle();
}

/** @returns {void} */
function validateTitle() {
  const input = document.getElementById("title"), msg = document.getElementById("title-error"); if (!input || !msg) return;
  const ok = !!input.value.trim(); msg.textContent = ok ? "" : "This field is required."; input.style.borderBottom = ok ? "1px solid #d1d1d1" : "1px solid red";
}

/** @returns {void} */
function initDueDateField() {
  const input = document.getElementById("due-date"); if (!input) return;
  input.readOnly = true; input.addEventListener("click", openPickerTemplate);
  input.addEventListener("input", (e) => { sanitizeDueDateInput(e); validateDueDate(); }); input.addEventListener("blur", validateDueDate);
}

/** @returns {void} */
function openPickerTemplate() {
  const dueInput = document.getElementById("due-date"); if (!dueInput) return;
  positionPickerToInput(dueInput, hiddenDatePickerTemplate); hiddenDatePickerTemplate.min = getTodayYMD();
  setHiddenPickerFromDueValue(dueInput.value.trim()); openNativePicker(hiddenDatePickerTemplate);
}

/** @param {HTMLElement} input @param {HTMLElement} picker @returns {void} */
function positionPickerToInput(input, picker) {
  const r = input.getBoundingClientRect(), sl = window.pageXOffset || document.documentElement.scrollLeft, st = window.pageYOffset || document.documentElement.scrollTop;
  picker.style.left = r.left + sl + "px"; picker.style.top = r.bottom + st + -3 + "px";
}

/** @returns {string} */
function getTodayYMD() {
  const t = new Date(), y = t.getFullYear(), m = String(t.getMonth() + 1).padStart(2, "0"), d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** @param {string} value @returns {void} */
function setHiddenPickerFromDueValue(value) {
  if (isValidDateFormat(value)) { const [d, m, y] = value.split("/"); hiddenDatePickerTemplate.value = `${y}-${m}-${d}`; return; }
  hiddenDatePickerTemplate.value = "";
}

/** @param {HTMLInputElement} picker @returns {void} */
function openNativePicker(picker) {
  setTimeout(() => { picker.showPicker ? picker.showPicker() : picker.click(); }, 0);
}

/** @param {Event} event @returns {void} */
function toggleAssignDropdown(event) {
  event.stopPropagation();
  const dropdown = document.querySelector(".assign-dropdown-addTask_template");
  const placeholder = document.querySelector(".assign-placeholder-addTask_template");
  const arrow = document.querySelector(".assign-arrow-addTask_template");
  if (!dropdown || !placeholder || !arrow) return;
  window.isDropdownOpen = dropdown.style.display !== "block"; dropdown.style.display = window.isDropdownOpen ? "block" : "none";
  if (window.isDropdownOpen) { placeholder.contentEditable = true; placeholder.textContent = ""; placeholder.classList.add("typing"); placeholder.focus(); arrow.style.transform = "rotate(180deg)";
    document.querySelectorAll(".assign-item-addTask_template").forEach((i) => (i.style.display = "flex")); return; }
  placeholder.contentEditable = false; placeholder.classList.remove("typing"); placeholder.blur(); arrow.style.transform = "rotate(0deg)";
  placeholder.textContent = "Select contact to assign"; placeholder.style.color = "black"; renderAssignedAvatars();
}

/** @param {HTMLElement} item @returns {string} */
function getColorFromItem(item) {
  if (!item) return "#4589ff";
  const avatarEl = item.querySelector(".assign-avatar-addTask_template") || item.querySelector(".assign-avatar-addTask_page");
  if (avatarEl) {
    let c = avatarEl.style.backgroundColor || getComputedStyle(avatarEl).backgroundColor;
    if (c && c !== "transparent" && c !== "rgba(0, 0, 0, 0)") return c;
    const v = getComputedStyle(avatarEl).getPropertyValue("--avatar-color").trim(); if (v) return v;
  }
  const colorEl = item.querySelector('[class*="color"]') || item.querySelector('[class*="avatar"]') || item;
  if (colorEl) {
    const c = colorEl.style.backgroundColor || getComputedStyle(colorEl).backgroundColor;
    if (c && c !== "transparent" && c !== "rgba(0, 0, 0, 0)") return c;
  }
  return item.getAttribute("data-color") || "#4589ff";
}

/** @param {string} name @param {Event} event @returns {void} */
function selectAssignUser(name, event) {
  const item = resolveAssignItem(name, event); if (!item) return;
  const checkbox = item.querySelector(".assign-check-addTask_template"); if (!checkbox) return;
  if (event.target === checkbox) item.classList.toggle("selected", checkbox.checked);
  else { checkbox.checked = !checkbox.checked; item.classList.toggle("selected", checkbox.checked); }
  if (checkbox.checked) { if (!window.selectedUsers.includes(name)) window.selectedUsers.push(name);
    if (window.selectedUserColors) window.selectedUserColors[name] = getColorFromItem(item) || "#4589ff"; }
  else { window.selectedUsers = window.selectedUsers.filter((u) => u !== name); if (window.selectedUserColors) delete window.selectedUserColors[name]; }
  updateAssignPlaceholder();
}

/** @param {string} name @param {Event} event @returns {HTMLElement|null} */
function resolveAssignItem(name, event) {
  const t = event?.target, el = t && t.nodeType === Node.TEXT_NODE ? t.parentElement : t;
  let item = (el?.closest && el.closest(".assign-item-addTask_template")) || (event?.currentTarget?.closest && event.currentTarget.closest(".assign-item-addTask_template")) || null;
  if (item) return item;
  return [...document.querySelectorAll(".assign-item-addTask_template")].find((x) => x.querySelector(".assign-name-addTask_template")?.textContent.trim() === name) || null;
}

/** @returns {void} */
function updateAssignPlaceholder() {
  const placeholder = document.querySelector(".assign-placeholder-addTask_template"); if (!placeholder) return;
  if (window.selectedUsers.length === 0) { placeholder.textContent = "Select contact to assign"; placeholder.style.color = "black"; return; }
  placeholder.textContent = "";
}

/** @param {InputEvent} e @returns {void} */
function handleAssignFilterInput(e) {
  const t = e.target; if (!t?.classList?.contains("assign-placeholder-addTask_template")) return;
  const search = String(t.textContent || "").toLowerCase(), items = document.querySelectorAll(".assign-item-addTask_template");
  if (!search.trim()) { items.forEach((i) => (i.style.display = "flex")); updateAssignPlaceholder(); return; }
  let anyMatch = false;
  items.forEach((item) => { const n = item.querySelector(".assign-name-addTask_template")?.textContent.toLowerCase() || "";
    const ok = n.includes(search); item.style.display = ok ? "flex" : "none"; if (ok) anyMatch = true; });
  if (!anyMatch) items.forEach((i) => (i.style.display = "flex"));
}

/** @param {MouseEvent} e @returns {void} */
function handleAssignOutsideClick(e) {
  const dropdown = document.querySelector(".assign-dropdown-addTask_template");
  const assignSelect = document.getElementById("assign-select");
  const placeholder = document.querySelector(".assign-placeholder-addTask_template");
  const arrow = document.querySelector(".assign-arrow-addTask_template");
  if (!dropdown || !assignSelect || !placeholder || !arrow) return;
  if (assignSelect.contains(e.target) || dropdown.contains(e.target)) return;
  dropdown.style.display = "none"; window.isDropdownOpen = false;
  placeholder.contentEditable = false; placeholder.classList.remove("typing"); placeholder.blur();
  arrow.style.transform = "rotate(0deg)"; renderAssignedAvatars();
}

/** @returns {void} */
function renderAssignedAvatars() {
  const container = document.getElementById("assigned-avatars"); if (!container) return;
  container.innerHTML = ""; const maxVisible = 3, users = window.selectedUsers || [], visible = users.slice(0, maxVisible);
  visible.forEach((name) => container.appendChild(buildAssignedAvatar(name)));
  if (users.length > maxVisible) container.appendChild(buildExtraAvatar(users.length - maxVisible));
}

/** @param {string} name @returns {HTMLDivElement} */
function buildAssignedAvatar(name) {
  const item = [...document.querySelectorAll(".assign-item-addTask_template")].find((el) => el.querySelector(".assign-name-addTask_template")?.textContent.trim() === name);
  let color = window.selectedUserColors?.[name]; if (!color) { color = getColorFromItem(item) || "#4589ff"; if (window.selectedUserColors) window.selectedUserColors[name] = color; }
  const initials = String(name).split(" ").map((n) => n[0]?.toUpperCase()).join("");
  const a = document.createElement("div"); a.textContent = initials; a.classList.add("assign-avatar-addTask_template"); a.style.backgroundColor = color; a.title = name; return a;
}

/** @param {number} extra @returns {HTMLDivElement} */
function buildExtraAvatar(extra) {
  const b = document.createElement("div"); b.classList.add("assign-avatar-addTask_template");
  b.style.backgroundColor = "#d1d1d1"; b.style.color = "black"; b.style.fontWeight = "bold"; b.textContent = `+${extra}`; return b;
}

/** @param {"urgent"|"medium"|"low"|string} priority @returns {void} */
function setPriorityAddTask(priority) {
  const urgentBtn = document.querySelector(".priority-btn-urgent-addTask_template");
  const mediumBtn = document.querySelector(".priority-btn-medium-addTask_template");
  const lowBtn = document.querySelector(".priority-btn-low-addTask_template");
  urgentBtn.style.backgroundColor = "white"; mediumBtn.style.backgroundColor = "white"; lowBtn.style.backgroundColor = "white";
  urgentBtn.style.color = "black"; mediumBtn.style.color = "black"; lowBtn.style.color = "black";
  urgentBtn.querySelector("img").style.filter = ""; mediumBtn.querySelector("img").style.filter = "brightness(0) saturate(100%) invert(68%) sepia(94%) saturate(312%) hue-rotate(360deg) brightness(101%) contrast(102%)"; lowBtn.querySelector("img").style.filter = "";
  if (priority === "urgent") { urgentBtn.style.backgroundColor = "#ff3d00"; urgentBtn.style.color = "white"; urgentBtn.querySelector("img").style.filter = "brightness(0) invert(1)"; }
  else if (priority === "medium") { mediumBtn.style.backgroundColor = "#ffa800"; mediumBtn.style.color = "white"; mediumBtn.querySelector("img").style.filter = "brightness(0) invert(1)"; }
  else if (priority === "low") { lowBtn.style.backgroundColor = "#00c853"; lowBtn.style.color = "white"; lowBtn.querySelector("img").style.filter = "brightness(0) invert(1)"; }
  window.currentPriority = priority; window.currentPrio = priority;
}

/** @param {MouseEvent} e @returns {void} */
function handleSubtaskClick(e) {
  const t = e.target; if (!t?.classList) return;
  if (t.classList.contains("subtask-delete-addTask_template")) return clearSubtaskInput();
  if (t.classList.contains("subtask-check-addTask_template")) return addSubtaskFromInput();
  if (t.classList.contains("subtask-remove-addTask_template")) return removeSubtaskItem(t);
  if (t.classList.contains("subtask-edit-addTask_template")) return startSubtaskEdit(t);
  if (t.classList.contains("subtask-save-addTask_template")) return saveSubtaskEdit(t);
}

/** @returns {void} */
function clearSubtaskInput() {
  const subtaskInput = document.getElementById("subtask"); if (subtaskInput) subtaskInput.value = "";
}

/** @returns {void} */
function addSubtaskFromInput() {
  const input = document.getElementById("subtask"), list = document.getElementById("subtask-list");
  if (!input || !list) return; const value = input.value.trim(); if (!value) return;
  const li = document.createElement("li"); li.textContent = value; li.appendChild(buildSubtaskActionsView()); list.appendChild(li); input.value = "";
}

/** @returns {HTMLDivElement} */
function buildSubtaskActionsView() {
  const actions = document.createElement("div"); actions.classList.add("subtask-actions-addTask_template");
  actions.innerHTML = `<img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_template"><div class="subtask-divider-addTask_template"></div><img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_template">`;
  return actions;
}

/** @param {HTMLElement} target @returns {void} */
function removeSubtaskItem(target) {
  const li = target.closest("li"); if (li) li.remove();
}

/** @param {HTMLElement} target @returns {void} */
function startSubtaskEdit(target) {
  const li = target.closest("li"); if (!li) return;
  const oldText = li.firstChild?.textContent || ""; li.innerHTML = "";
  const input = document.createElement("input"); input.type = "text"; input.value = oldText.trim(); input.classList.add("task-subtask-addTask_template");
  const id = "subtask-edit-" + Date.now(); input.id = id; input.name = id; li.appendChild(input); li.appendChild(buildSubtaskActionsEdit());
  input.addEventListener("keyup", (event) => { if (event.key !== "Enter") return; const v = input.value.trim(); if (!v) return; event.preventDefault(); li.querySelector(".subtask-save-addTask_template")?.click(); });
}

/** @returns {HTMLDivElement} */
function buildSubtaskActionsEdit() {
  const actions = document.createElement("div"); actions.classList.add("subtask-actions-addTask_template");
  actions.innerHTML = `<img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_template"><div class="subtask-divider-addTask_template"></div><img src="../assets/img/check.svg" alt="Save subtask" class="subtask-save-addTask_template">`;
  return actions;
}

/** @param {HTMLElement} target @returns {void} */
function saveSubtaskEdit(target) {
  const li = target.closest("li"); if (!li) return;
  const input = li.querySelector("input"); if (!input) return;
  const newText = input.value.trim(); if (!newText) return;
  li.innerHTML = ""; li.textContent = newText; li.appendChild(buildSubtaskActionsView());
}

/** @param {KeyboardEvent} e @returns {void} */
function handleSubtaskEnter(e) {
  if (e.key !== "Enter") return;
  const input = document.getElementById("subtask"); if (!input) return;
  if (document.activeElement !== input) return;
  const v = input.value.trim(); if (!v) return;
  e.preventDefault(); document.querySelector(".subtask-check-addTask_template")?.click();
}

/** @param {InputEvent} e @returns {void} */
function sanitizeDueDateInput(e) {
  const input = e.target; input.value = input.value.replace(/[^0-9/]/g, "").slice(0, 10);
}

/** @param {string} dateString @returns {boolean} */
function isValidDateFormat(dateString) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(dateString);
}

/** @param {string} dateString @returns {boolean} */
function isRealDate(dateString) {
  const [d, m, y] = dateString.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  return date && date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y;
}

/** @returns {boolean|undefined} */
function validateDueDate() {
  const dueDateInput = document.getElementById("due-date");
  const errorMsg = document.getElementById("due-date-error");
  if (!dueDateInput || !errorMsg) return;
  const value = dueDateInput.value.trim();
  if (!value) { errorMsg.textContent = "This field is required."; dueDateInput.style.borderBottom = "1px solid red"; return false; }
  if (!isValidDateFormat(value)) { errorMsg.textContent = "Use format dd/mm/yyyy."; dueDateInput.style.borderBottom = "1px solid red"; return false; }
  if (!isRealDate(value)) { errorMsg.textContent = "Invalid date."; dueDateInput.style.borderBottom = "1px solid red"; return false; }
  errorMsg.textContent = ""; dueDateInput.style.borderBottom = "1px solid #d1d1d1"; return true;
}
