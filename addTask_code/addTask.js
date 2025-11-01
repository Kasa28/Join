let selectedUsers = [];
let isDropdownOpen = false;

// === Title Validation ===
document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('title');
  if (!titleInput) return;

  const errorMsg = document.getElementById('title-error');

  function validateTitle() {
    const value = titleInput.value.trim();

    if (value === '') {
      errorMsg.textContent = 'This field is required.';
      titleInput.style.borderBottom = '1px solid red';
    } else {
      errorMsg.textContent = '';
      titleInput.style.borderBottom = '1px solid #d1d1d1';
    }
  }

  titleInput.addEventListener('blur', validateTitle);
  titleInput.addEventListener('input', validateTitle);
});

function toggleAssignDropdown(event) {
  event.stopPropagation();
  const dropdown = document.querySelector(".assign-dropdown-addTask_page");
  const placeholder = document.querySelector(".assign-placeholder-addTask_page");
  const arrow = document.querySelector(".assign-arrow-addTask_page");

  if (!dropdown || !placeholder || !arrow) return;

  isDropdownOpen = dropdown.style.display !== "block";
  dropdown.style.display = isDropdownOpen ? "block" : "none";

  if (isDropdownOpen) {
    // Platzhalter als Eingabefeld aktivieren
    placeholder.contentEditable = true;
    placeholder.textContent = "";
    placeholder.classList.add("typing");
    placeholder.focus();
    arrow.style.transform = "rotate(180deg)"; // Pfeil nach oben
    const items = document.querySelectorAll(".assign-item-addTask_page");
    items.forEach(item => item.style.display = "flex");
  } else {
    // Dropdown wird geschlossen
    placeholder.contentEditable = false;
    placeholder.classList.remove("typing");
    placeholder.blur();
    arrow.style.transform = "rotate(0deg)"; // Pfeil nach unten

    // ✅ Placeholder immer wiederherstellen (egal ob Auswahl oder nicht)
    placeholder.textContent = "Select contact to assign";
    placeholder.style.color = "black";
  }
  if (!isDropdownOpen) {
    renderAssignedAvatars();
  }
}

function selectAssignUser(name, event) {
  if (event && event.stopPropagation) event.stopPropagation();

  let item = event && event.currentTarget ? event.currentTarget : null;
  if (!item) {
    const candidates = document.querySelectorAll(".assign-item-addTask_page");
    candidates.forEach((el) => {
      const label = el.querySelector(".assign-name-addTask_page").textContent.trim();
      if (!item && label === name) item = el;
    });
  }
  if (!item) return;

  const checkbox = item.querySelector(".assign-check-addTask_page");
  item.classList.toggle("selected", checkbox.checked);

  if (checkbox.checked) {
    if (!selectedUsers.includes(name)) selectedUsers.push(name);
  } else {
    selectedUsers = selectedUsers.filter((user) => user !== name);
  }

  updateAssignPlaceholder();
}

function updateAssignPlaceholder() {
  const placeholder = document.querySelector(".assign-placeholder-addTask_page");
  if (selectedUsers.length === 0) {
    placeholder.textContent = "Select contact to assign";
    placeholder.style.color = "black";
  } else {
     // leer lassen, CSS-Placeholder zeigt den Text
     placeholder.textContent = "";
  }
}

// 🔍 Filterfunktion, wenn im Placeholder getippt wird
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("assign-placeholder-addTask_page")) {
    const searchValue = e.target.textContent.toLowerCase();
    const items = document.querySelectorAll(".assign-item-addTask_page");

    // Wenn Eingabe leer ist → alles zeigen
    if (searchValue.trim() === "") {
      items.forEach((item) => (item.style.display = "flex"));
      return;
    }

    // Filterung nach beliebiger Buchstabenkombination
    let anyMatch = false;
    items.forEach((item) => {
      const name = item
        .querySelector(".assign-name-addTask_page")
        .textContent.toLowerCase();
      if (name.includes(searchValue)) {
        item.style.display = "flex";
        anyMatch = true;
      } else {
        item.style.display = "none";
      }
      // Wenn der Nutzer alles gelöscht hat, Placeholder wiederherstellen
      if (
        e.target.classList.contains("assign-placeholder-addTask_page") &&
        e.target.textContent.trim() === ""
      ) {
        updateAssignPlaceholder();
      }
    });

    // Wenn kein Treffer → gesamte Liste wieder einblenden
    if (!anyMatch) {
      items.forEach((item) => (item.style.display = "flex"));
    }
  }
});

// Schließt Dropdown bei Klick außerhalb
document.addEventListener("click", (e) => {
  const dropdown = document.querySelector(".assign-dropdown-addTask_page");
  const assignSelect = document.getElementById("assign-select");
  const placeholder = document.querySelector(
    ".assign-placeholder-addTask_page"
  );
  const arrow = document.querySelector(".assign-arrow-addTask_page");

  if (!dropdown || !assignSelect) return;

  if (!assignSelect.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = "none";
    placeholder.contentEditable = false;
    placeholder.classList.remove("typing");
    arrow.style.transform = "rotate(0deg)";
  }
});

function renderAssignedAvatars() {
  const container = document.getElementById('assigned-avatars');
  if (!container) return;

  container.innerHTML = ''; // vorherige löschen

  selectedUsers.forEach(name => {
    const sourceAvatar = [...document.querySelectorAll('.assign-item-addTask_page')]
      .find(item => item.querySelector('.assign-name-addTask_page').textContent.trim() === name)
      ?.querySelector('.assign-avatar-addTask_page');

    const color = sourceAvatar ? sourceAvatar.style.backgroundColor : '#4589ff';
    const initials = name.split(' ').map(n => n[0].toUpperCase()).join('');

    const avatar = document.createElement('div');
    avatar.textContent = initials;
    avatar.classList.add('assign-avatar-addTask_page');
    avatar.style.backgroundColor = color;

    container.appendChild(avatar);
  });
}

// === Due Date Validation & Input Formatting ===

// Prüft, ob das Datum dem Format dd/mm/yyyy entspricht
function isValidDateFormat(dateString) {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(dateString);
}

// Bereinigt Eingaben und fügt automatisch Schrägstriche hinzu
function sanitizeDueDateInput(e) {
  let v = e.target.value.replace(/[^\d]/g, ''); // nur Ziffern
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length > 4) {
    v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
  } else if (v.length > 2) {
    v = v.slice(0, 2) + '/' + v.slice(2);
  }
  e.target.value = v;
}

// Hauptfunktion zur Prüfung und Anzeige von Fehlern
function validateDueDate() {
  const dueDateInput = document.getElementById('due-date');
  if (!dueDateInput) return false;

  const parent = dueDateInput.parentElement; // .date-field-addTask_page
  const wrapper = dueDateInput.closest('.date-input-wrapper-addTask_page');
  const errorMsg = wrapper.querySelector('#due-date-error');
  const value = dueDateInput.value.trim();

  if (value === '') {
    errorMsg.textContent = 'This field is required.';
    parent.style.borderBottom = '1px solid red';
    return false;
  }

  if (!isValidDateFormat(value)) {
    errorMsg.textContent = 'Please use format dd/mm/yyyy';
    parent.style.borderBottom = '1px solid red';
    return false;
  }
  
  if (!isRealDate(value)) {
    errorMsg.textContent = 'Please enter a valid calendar date';
    parent.style.borderBottom = '1px solid red';
    return false;
  }

  // Alles ok → Fehler zurücksetzen
  errorMsg.textContent = '';
  parent.style.borderBottom = '1px solid #d1d1d1';
  return true;
}

// === Event-Handling ===
const dueDateInput = document.getElementById('due-date');
if (dueDateInput) {
  // Wenn der User tippt → Eingabe bereinigen und prüfen
  dueDateInput.addEventListener('input', (e) => {
    sanitizeDueDateInput(e);
    validateDueDate();
  });

  // Beim Verlassen des Feldes → prüfen
  dueDateInput.addEventListener('blur', validateDueDate);
}

// Prüft, ob das Datum tatsächlich existiert (z. B. 31/02/2025 = false)
function isRealDate(dateString) {
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}


function setPriority(priority) {
  // Alle Buttons holen
  const urgentBtn = document.querySelector('.priority-btn-urgent-addTask_page');
  const mediumBtn = document.querySelector('.priority-btn-medium-addTask_page');
  const lowBtn = document.querySelector('.priority-btn-low-addTask_page');

  // Erst alle zurücksetzen
  urgentBtn.style.backgroundColor = 'white';
  mediumBtn.style.backgroundColor = 'white';
  lowBtn.style.backgroundColor = 'white';
  urgentBtn.style.color = 'black';
  mediumBtn.style.color = 'black';
  lowBtn.style.color = 'black';

    // Reset icons
    urgentBtn.querySelector('img').style.filter = '';
    mediumBtn.querySelector('img').style.filter = 'brightness(0) saturate(100%) invert(68%) sepia(94%) saturate(312%) hue-rotate(360deg) brightness(101%) contrast(102%)'; // orange
    lowBtn.querySelector('img').style.filter = '';

  // Dann den passenden Button färben
  if (priority === 'urgent') {
    urgentBtn.style.backgroundColor = '#ff3d00';
    urgentBtn.style.color = 'white';
    urgentBtn.querySelector('img').style.filter = 'brightness(0) invert(1)';
  } else if (priority === 'medium') {
    mediumBtn.style.backgroundColor = '#ffa800';
    mediumBtn.style.color = 'white';
    mediumBtn.querySelector('img').style.filter = 'brightness(0) invert(1)';
  } else if (priority === 'low') {
    lowBtn.style.backgroundColor = '#00c853';
    lowBtn.style.color = 'white';
    lowBtn.querySelector('img').style.filter = 'brightness(0) invert(1)';
  }
}


// === Subtask Delete ===
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('subtask-delete-addTask_page')) {
    const subtaskInput = document.getElementById('subtask');
    if (subtaskInput) {
      subtaskInput.value = '';
    }
  }
});

// === Subtask Add ===
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('subtask-check-addTask_page')) {
    const subtaskInput = document.getElementById('subtask');
    const subtaskList = document.getElementById('subtask-list');
    const value = subtaskInput.value.trim();

    if (value !== '') {
      const li = document.createElement('li');
      li.textContent = value;

      const actions = document.createElement('div');
      actions.classList.add('subtask-actions-addTask_page');
      actions.innerHTML = `
        <img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_page">
        <div class="subtask-divider-addTask_page"></div>
        <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page">
      `;
      li.appendChild(actions);

      subtaskList.appendChild(li);
      subtaskInput.value = '';
    }
  }
});

// === Subtask Remove ===
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('subtask-remove-addTask_page')) {
    const li = e.target.closest('li');
    if (li) li.remove();
  }
});


// === Subtask Edit (Beginner-friendly, in-place editing) ===
function enableSubtaskEditing(e) {
  if (!e.target.classList.contains('subtask-edit-addTask_page')) return;

  const li = e.target.closest('li');
  if (!li) return;

  const oldText = li.firstChild.textContent;
  li.innerHTML = '';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldText.trim();
  input.classList.add('task-subtask-addTask_page');

  const actions = document.createElement('div');
  actions.classList.add('subtask-actions-addTask_page');
  actions.innerHTML = `
    <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page">
    <div class="subtask-divider-addTask_page"></div>
    <img src="../assets/img/check.svg" alt="Save subtask" class="subtask-save-addTask_page">
  `;

  li.appendChild(input);
  li.appendChild(actions);
}

document.addEventListener('click', enableSubtaskEditing);


// === Subtask Save ===
function saveEditedSubtask(e) {
  if (!e.target.classList.contains('subtask-save-addTask_page')) return;

  const li = e.target.closest('li');
  if (!li) return;

  const input = li.querySelector('input');
  if (!input) return;

  const newText = input.value.trim();
  if (newText === '') return;

  li.innerHTML = '';
  li.textContent = newText;

  const actions = document.createElement('div');
  actions.classList.add('subtask-actions-addTask_page');
  actions.innerHTML = `
    <img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_page">
    <div class="subtask-divider-addTask_page"></div>
    <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_page">
  `;
  li.appendChild(actions);
}

document.addEventListener('click', saveEditedSubtask);

// Checkbox-Klick direkt behandeln
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("assign-check-addTask_page")) {
    e.stopPropagation(); // verhindert Doppeltrigger
    const item = e.target.closest(".assign-item-addTask_page");
    const name = item.querySelector(".assign-name-addTask_page").textContent.trim();
    selectAssignUser(name, e);
  }
});

function clearForm() {
  // Textfelder leeren
  document.getElementById('title').value = '';
  document.getElementById('description').value = '';
  document.getElementById('due-date').value = '';
  document.getElementById('subtask').value = '';

  // Listen und Avatare leeren
  document.getElementById('subtask-list').innerHTML = '';
  document.getElementById('assigned-avatars').innerHTML = '';

  // Dropdowns und Auswahl zurücksetzen
  const category = document.getElementById('category');
  if (category) category.selectedIndex = 0;

  // Priority zurücksetzen
  document.querySelectorAll('.priority-group-addTask_page button').forEach(btn => {
    btn.style.backgroundColor = 'white';
    btn.style.color = 'black';
    const img = btn.querySelector('img');
    if (img) img.style.filter = '';
  });

  // Assign-Auswahl zurücksetzen
  selectedUsers = [];
  const placeholder = document.querySelector('.assign-placeholder-addTask_page');
  placeholder.textContent = 'Select contact to assign';
  placeholder.style.color = 'black';
  document.querySelectorAll('.assign-check-addTask_page').forEach(cb => cb.checked = false);

  // Fehlermeldungen entfernen
  document.querySelectorAll('.error-text').forEach(e => e.textContent = '');
}

function createTask() {
  // 1) Read values (very simple)
  const title = (document.getElementById('title')?.value || '').trim();
  if (!title) { alert('Please enter a title'); return; }
  const description = (document.getElementById('description')?.value || '').trim();
  const dueDate = (document.getElementById('due-date')?.value || '').trim();
  const category = (document.getElementById('category')?.value || '').trim();

  // Priority (fallback to 'medium' if nothing set)
  const priority = (window.currentPriority || 'medium');

  // Assigned users (array of names -> objects with only name; Board builds initials itself)
  const assignedTo = (window.selectedUsers || []).map(name => ({ name }));
  // Subtasks (count only; Board shows progress bar)
  const subtaskItems = document.querySelectorAll('#subtask-list li');
  const subtasksTotal = subtaskItems.length;
  // 2) Build task object (Board will add id and place it into 'todo')
  const task = {
    title,
    description,
    dueDate,
    priority,
    status: 'todo',
    type: category === 'technical' ? 'Technical Task' : 'User Story',
    subtasksDone: 0,
    subtasksTotal,
    assignedTo
  };
  // 3) Save to localStorage for Board import
  const saved = JSON.parse(localStorage.getItem('newTasks') || '[]');
  saved.push(task);
  localStorage.setItem('newTasks', JSON.stringify(saved));

  // 4) Go to the Board so the thumbnail appears
  window.location.href = '../board_code/board.html';
}