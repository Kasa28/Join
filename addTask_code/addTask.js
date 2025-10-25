function toggleAssignDropdown() {
  const dropdown = document.getElementById('assignDropdown');
  dropdown.classList.toggle('active');
}

const category = document.getElementById('category').value;
console.log(category); // "technical" oder "user-story"