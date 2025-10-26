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