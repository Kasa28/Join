
window.STATUS = window.STATUS || {
  TODO: 'todo',
  INPROGRESS: 'in-progress',
  AWAIT: 'await-feedback',
  DONE: 'done'
};
window.nextTaskTargetStatus = window.nextTaskTargetStatus || window.STATUS.TODO;
window.currentPrio = window.currentPrio || 'low';

if (!window.openAddTaskWithStatus) {
  window.openAddTaskWithStatus = function (status) {
    window.nextTaskTargetStatus = status || window.STATUS.TODO;
    if (typeof openAddTask === 'function') openAddTask();   
  };
}
if (!window.openAddTaskFromPlus) {
  window.openAddTaskFromPlus = function (e) {
    const s = e?.currentTarget?.dataset?.target || window.STATUS.TODO;
    window.openAddTaskWithStatus(s);
  };
}

function mapCategoryToType(value){
  return value === 'technical' ? 'Technical Task' : 'User Story';
}
function assignedToDataExtractSafe(){
  if (typeof assignedToDataExtract === 'function') return assignedToDataExtract();
  const items = document.querySelectorAll('.assign-item-addTask_template');
  const out = [];
  items.forEach(el => {
    const chk = el.querySelector('.assign-check-addTask_template');
    const nameEl = el.querySelector('.assign-name-addTask_template');
    if (chk && chk.checked && nameEl) out.push({ name: nameEl.textContent.trim(), img: '' });
  });
  return out;
}
function getSubtasksSafe(){
  if (typeof getSubtasks === 'function') return getSubtasks();
  const v = (document.getElementById('subtask')?.value || '').trim();
  return v ? [v] : [];
}
function collectTaskFromForm(){
  const title       = (document.getElementById('title')?.value || '').trim();
  const description = (document.getElementById('description')?.value || '').trim();
  const dueDate     = (document.getElementById('due-date')?.value || '').trim();
  const categoryVal = document.getElementById('category')?.value || '';

  return {
    id: Date.now(),
    title,
    description,
    type:   mapCategoryToType(categoryVal),
    status: window.nextTaskTargetStatus,
    dueDate,
    priority: window.currentPrio,
    assignedTo: assignedToDataExtractSafe(),
    subtasksDone: 0,
    subtasksTotal: getSubtasksSafe().length,
    subTasks: getSubtasksSafe()
  };
}

function createTask(event){
  if (event && event.preventDefault) event.preventDefault();

  const task = collectTaskFromForm();
  if (!task.title){ alert('Bitte Titel eingeben!'); return; }

  window.tasks = Array.isArray(window.tasks) ? window.tasks : [];
  window.tasks.push(task);

  if (typeof render === 'function') render();

  if (typeof closeAddTask === 'function') closeAddTask();
  window.nextTaskTargetStatus = window.STATUS.TODO; 
}
window.createTask = createTask;



window.currentPrio = window.currentPrio || 'low';

window.setPriority = function (prio) {
  window.currentPrio = String(prio || 'low').toLowerCase();

  const wrap = document.querySelector('.priority-group-addTask_template, .priority-group-addTask_page');
  if (!wrap) return;

  wrap.querySelectorAll('button').forEach(btn => btn.classList.remove('active-prio'));
  const map = {
    urgent: '.priority-btn-urgent-addTask_template, .priority-btn-urgent-addTask_page',
    medium: '.priority-btn-medium-addTask_template, .priority-btn-medium-addTask_page',
    low:    '.priority-btn-low-addTask_template,    .priority-btn-low-addTask_page'
  };
  const active = wrap.querySelector(map[window.currentPrio]);
  if (active) active.classList.add('active-prio');
};
