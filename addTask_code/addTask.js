let selectedUsers = [];
let isDropdownOpen = false;

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

  // Dann den passenden Button färben
  if (priority === 'urgent') {
    urgentBtn.style.backgroundColor = '#ff3d00'; // dieselbe Farbe wie dein Unterstrich
    urgentBtn.style.color = 'white';
  } else if (priority === 'medium') {
    mediumBtn.style.backgroundColor = '#ffa800';
    mediumBtn.style.color = 'white';
  } else if (priority === 'low') {
    lowBtn.style.backgroundColor = '#00c853';
    lowBtn.style.color = 'white';
  }
}
