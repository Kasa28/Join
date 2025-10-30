
const Firebase_URL = 'https://'; 

let currentPrio = 'low';
window.setPriority = function (prio) { currentPrio = prio; };

window.createTask = createNewTask;

function assignedToDataExtract() {
  const items = document.querySelectorAll('.assign-dropdown-addTask_template .assign-item-addTask_template');
  const selected = [];
  items.forEach(el => {
    const chk = el.querySelector('.assign-check-addTask_template');
    const nameEl = el.querySelector('.assign-name-addTask_template');
    if (chk && chk.checked && nameEl) {
      selected.push({ name: nameEl.textContent.trim(), img: '' });
    }
  });
  return selected;
}
