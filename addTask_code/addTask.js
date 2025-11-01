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
}

function selectAssignUser(name, event) {
   // Support both cases: with inline event or without it (only name passed)
   if (event && event.stopPropagation) event.stopPropagation();
  checkbox.checked = !checkbox.checked;
  item.classList.toggle("selected", checkbox.checked);
    // Find the clicked item reliably even if no event is provided
  let item = event && event.currentTarget ? event.currentTarget : null;
  if (!item) {
    const candidates = document.querySelectorAll(".assign-item-addTask_page");
    candidates.forEach((el) => {
      const label = el
        .querySelector(".assign-name-addTask_page")
        .textContent.trim();
      if (!item && label === name) item = el;
    });
  }
  if (!item) return;

  const checkbox = item.querySelector(".assign-check-addTask_page");

  if (checkbox.checked) {
    if (!selectedUsers.includes(name)) selectedUsers.push(name);
  } else {
    selectedUsers = selectedUsers.filter((user) => user !== name);
  }

  updateAssignPlaceholder();
}

function updateAssignPlaceholder() {
  const placeholder = document.querySelector(
    ".assign-placeholder-addTask_page"
  );
  if (selectedUsers.length > 0) {
    placeholder.textContent = selectedUsers.join(", ");
    placeholder.style.color = "#42526e";
  } else {
     // leer lassen, CSS-Placeholder zeigt den Text
     placeholder.textContent = "";
     placeholder.style.color = "black";
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