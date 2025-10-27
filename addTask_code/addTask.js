let selectedUsers = [];
let isDropdownOpen = false;

function toggleAssignDropdown(event) {
  event.stopPropagation();
  const dropdown = document.querySelector('.assign-dropdown-addTask_page');
  const placeholder = document.querySelector('.assign-placeholder-addTask_page');
  const arrow = document.querySelector('.assign-arrow-addTask_page');

  if (!dropdown || !placeholder || !arrow) return;

  isDropdownOpen = dropdown.style.display !== 'block';
  dropdown.style.display = isDropdownOpen ? 'block' : 'none';

  if (isDropdownOpen) {
    // Platzhalter als Eingabefeld aktivieren
    placeholder.contentEditable = true;
    placeholder.textContent = '';
    placeholder.focus();
    arrow.style.transform = 'rotate(180deg)'; // Pfeil nach oben
  } else {
    // Dropdown wird geschlossen
    placeholder.contentEditable = false;
    placeholder.blur();
    arrow.style.transform = 'rotate(0deg)'; // Pfeil nach unten
  
    // ✅ Placeholder wiederherstellen
    if (selectedUsers.length === 0) {
      placeholder.textContent = 'Select contact to assign';
      placeholder.style.color = '#bfbfbf';
    } else {
      placeholder.textContent = selectedUsers.join(', ');
      placeholder.style.color = '#42526e';
    }
  }
}

function selectAssignUser(name, event) {
  event.stopPropagation();
  const item = event.currentTarget;
  const checkbox = item.querySelector('.assign-check-addTask_page');

  checkbox.checked = !checkbox.checked;
  item.classList.toggle('selected', checkbox.checked);

  if (checkbox.checked) {
    if (!selectedUsers.includes(name)) selectedUsers.push(name);
  } else {
    selectedUsers = selectedUsers.filter(user => user !== name);
  }

  updateAssignPlaceholder();
}

function updateAssignPlaceholder() {
  const placeholder = document.querySelector('.assign-placeholder-addTask_page');
  if (selectedUsers.length > 0) {
    placeholder.textContent = selectedUsers.join(', ');
    placeholder.style.color = '#42526e';
  } else {
    placeholder.textContent = 'Select contact to assign';
    placeholder.style.color = '#bfbfbf';
  }
}

// 🔍 Filterfunktion, wenn im Placeholder getippt wird
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('assign-placeholder-addTask_page')) {
    const searchValue = e.target.textContent.toLowerCase();
    const items = document.querySelectorAll('.assign-item-addTask_page');

    items.forEach(item => {
      const name = item.querySelector('.assign-name-addTask_page').textContent.toLowerCase();
      item.style.display = name.includes(searchValue) || searchValue === '' ? 'flex' : 'none';
    });
  }
});

// Schließt Dropdown bei Klick außerhalb
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.assign-dropdown-addTask_page');
  const assignSelect = document.getElementById('assign-select');
  const placeholder = document.querySelector('.assign-placeholder-addTask_page');
  const arrow = document.querySelector('.assign-arrow-addTask_page');

  if (!dropdown || !assignSelect) return;

  if (!assignSelect.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
    placeholder.contentEditable = false;
    arrow.style.transform = 'rotate(0deg)';
  }
});