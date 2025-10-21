// Demo-Daten
const tasks = [{
  id: 1,
  title: "Kochwelt Page & Recipe Recommender",
  description: "Build start page with recipe recommendation...",
  type: "User Story",
  status: "in-progress",   // 'todo' | 'in-progress' | 'await-feedback' | 'done'
  dueDate: "10/05/2023",
  priority: "urgent",
  subtasksDone: 1,
  subtasksTotal: 2
}];

let currentDraggedId = null;

const COLS = {
  'todo':           { id: 'drag-area-todo',           empty: 'No tasks To do' },
  'in-progress':    { id: 'drag-area-in-progress',    empty: 'No tasks in Progress' },
  'await-feedback': { id: 'drag-area-await-feedback', empty: 'No tasks in Feedback' },
  'done':           { id: 'drag-area-done',           empty: 'No task in Done' },
};

window.allowDrop = (e) => { e.preventDefault(); try { e.dataTransfer.dropEffect='move'; } catch {} };
window.highlight = (id) => document.getElementById(id)?.classList.add('drag-highlight');
window.removeHighlight = (id) => document.getElementById(id)?.classList.remove('drag-highlight');

window.onCardDragStart = (e, id) => {
  currentDraggedId = id;
  try { e.dataTransfer.setData('text/plain', String(id)); e.dataTransfer.effectAllowed='move'; } catch {}
  document.body.classList.add('dragging');
};
window.onCardDragEnd = () => { document.body.classList.remove('dragging'); };

window.moveTo = (targetStatus) => {
  if (currentDraggedId == null) return;
  const i = tasks.findIndex(t => t.id === currentDraggedId);
  if (i > -1) { tasks[i].status = targetStatus; render(); }
};

window.openModalById = (id) => {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const m = document.getElementById('task-modal');
  const c = document.getElementById('task-modal-content');
  c.innerHTML = bigCardHtml(t); // <-- kommt aus templates.js
  m.style.display = 'flex';
};
window.closeModal = () => { const m = document.getElementById('task-modal'); if (m) m.style.display='none'; };


function renderCard(t){
  const tpl = document.getElementById('tmpl-card').content.cloneNode(true);
  const card = tpl.querySelector('.task-card');
  card.id = `card-${t.id}`;
 
  card.setAttribute('ondragstart', `onCardDragStart(event, ${t.id})`);
  card.setAttribute('ondragend',   `onCardDragEnd()`);
  card.setAttribute('onclick',     `openModalById(${t.id})`);

  tpl.querySelector('.badge').textContent = t.type;
  tpl.querySelector('h3').textContent     = t.title;
  tpl.querySelector('p').textContent      = t.description;
  const fill = tpl.querySelector('.progress-fill');
  const pct  = t.subtasksTotal ? Math.round(t.subtasksDone / t.subtasksTotal * 100) : 0;
  fill.style.width = pct + '%';
  tpl.querySelector('.subtasks').textContent = `${t.subtasksDone}/${t.subtasksTotal} Subtasks`;

  return tpl;
}

function appendCardToColumn(task){
  const byStatus = {
    'todo':'drag-area-todo',
    'in-progress':'drag-area-in-progress',
    'await-feedback':'drag-area-await-feedback',
    'done':'drag-area-done'
  };
  const host = document.getElementById(byStatus[task.status]);
  if (!host) return;
  host.querySelector('.empty-pill')?.remove();
  host.appendChild(renderCard(task));
}

function render(){
  Object.values(COLS).forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });


  tasks.forEach(t => {
    const col = COLS[t.status];
    if (!col) return;
    const host = document.getElementById(col.id);
    if (!host) return;
    host.appendChild(renderCard(t)); 
  });


  Object.values(COLS).forEach(({ id, empty }) => {
    const el = document.getElementById(id);
    if (el && el.children.length === 0) {
      el.innerHTML = `<div class="empty-pill">${empty}</div>`;
    }
  });
}

window.onload = render;
