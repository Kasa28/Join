let assignDropdownVisible = false;

function toggleAssignDropdown(event) {
  event.stopPropagation();
  const assignDropdown = document.querySelector(".assign-dropdown-addTask_page");
  if (!assignDropdown) return;

  assignDropdownVisible = !assignDropdownVisible;
  assignDropdown.style.display = assignDropdownVisible ? "block" : "none";
}

function selectAssignUser(name) {
  const assignPlaceholder = document.querySelector(".assign-placeholder-addTask_page");
  const assignDropdown = document.querySelector(".assign-dropdown-addTask_page");
  const items = document.querySelectorAll(".assign-item-addTask_page");

  // Reset previous selection
  items.forEach(item => item.classList.remove("selected"));

  // Find selected and mark
  items.forEach(item => {
    if (item.textContent.includes(name)) {
      item.classList.add("selected");
    }
  });

  // Update placeholder
  if (assignPlaceholder) {
    assignPlaceholder.textContent = name;
    assignPlaceholder.style.color = "#42526e";
  }

  if (assignDropdown) {
    assignDropdown.style.display = "none";
    assignDropdownVisible = false;
  }
}

function closeAssignDropdown() {
  const assignDropdown = document.querySelector(".assign-dropdown-addTask_page");
  if (assignDropdown) {
    assignDropdown.style.display = "none";
    assignDropdownVisible = false;
  }
}

let selectedUsers = [];

function toggleAssignDropdown(event) {
  event.stopPropagation();
  const dropdown = document.querySelector('.assign-dropdown-addTask_page');
  if (!dropdown) return;

  const isVisible = dropdown.style.display === 'block';
  dropdown.style.display = isVisible ? 'none' : 'block';
}

function selectAssignUser(name, event) {
  event.stopPropagation();

  const item = event.currentTarget;
  const checkbox = item.querySelector('.assign-check-addTask_page');

  // Toggle Checkbox
  checkbox.checked = !checkbox.checked;
  item.classList.toggle('selected', checkbox.checked);

  if (checkbox.checked) {
    if (!selectedUsers.includes(name)) selectedUsers.push(name);
  } else {
    selectedUsers = selectedUsers.filter(user => user !== name);
  }

  // Update Placeholder Text
  const placeholder = document.querySelector('.assign-placeholder-addTask_page');
  placeholder.textContent = selectedUsers.length > 0
    ? selectedUsers.join(', ')
    : 'Select contact to assign';
  placeholder.style.color = selectedUsers.length > 0 ? '#42526e' : '#bfbfbf';
}

// Schließe das Dropdown, wenn außerhalb geklickt wird
document.addEventListener('click', function (e) {
  const dropdown = document.querySelector('.assign-dropdown-addTask_page');
  const assignSelect = document.getElementById('assign-select');
  if (!dropdown || !assignSelect) return;

  if (!assignSelect.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});