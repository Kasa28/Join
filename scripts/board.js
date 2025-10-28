window.saved = JSON.parse(localStorage.getItem('checks') || '{}');
const saved = window.saved; 
const tasks = [
  {
    id: 1,
    title: "Kochwelt Page & Recipe Recommender",
    description: "Build start page with recipe recommendation...",
    type: "User Story",
    status: "in-progress",
    dueDate: "10/05/2023",
    priority: "medium",
    subtasksDone: 1,
    subtasksTotal: 2,
    assignedTo: [
      { name: "Emmanuel Mauer", img: "../assets/img/EM.svg" },
      { name: "Marcel Bauer",   img: "../assets/img/mb.svg" },
      { name: "Anton Mayer",    img: "../assets/img/AM.svg" }
    ]
  },
  {
    id: 2,
    title: "CSS Architecture Planning",
    description: "Define CSS naming conventions and structure.",
    type: "Technical Task",
    status: "await-feedback",
    dueDate: "02/09/2023",
    priority: "urgent",
    subtasksDone: 2,
    subtasksTotal: 2,
    assignedTo: [
      { name: "Sofia Müller", img: "../assets/img/AM2.svg" },
      { name: "Sofia Müller", img: "../assets/img/AM2.svg" }
    ]
  }
];

const nameOfTheCard = {
  'todo':           { id: 'drag-area-todo',           empty: 'No tasks To do' },
  'in-progress':    { id: 'drag-area-in-progress',    empty: 'No tasks in Progress' },
  'await-feedback': { id: 'drag-area-await-feedback', empty: 'No tasks in Feedback' },
  'done':           { id: 'drag-area-done',           empty: 'No task in Done' },
};

const prioritätIcon = {
  urgent: '../assets/img/Prio baja-urgent-red.svg',
  medium: '/addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg',
  low:    '../assets/img/Prio baja-low.svg'
};

let currentDraggedId = null;

window.allowDrop = function(event) {
  event.preventDefault();
};
window.highlight = function(whoDivDragAreaTodo) {
  const dropPlace = document.getElementById(whoDivDragAreaTodo);
  if (dropPlace) {
    dropPlace.classList.add('drag-highlight');
  }
};
window.removeHighlight = function(ResetCssEffect) {
  const dropPlace = document.getElementById(ResetCssEffect);
  if (dropPlace) {
    dropPlace.classList.remove('drag-highlight');
  }
};
window.onCardDragStart = function(event, whichTaskId) {
  currentDraggedId = whichTaskId;
  try {
    event.dataTransfer.setData('text/plain', String(whichTaskId));
    event.dataTransfer.effectAllowed = 'move';
  } catch (error) {
  }
  document.body.classList.add('dragging');
};
window.onCardDragEnd = function() {
  document.body.classList.remove('dragging'); 
};
window.moveTo = function(newStatus) {
  if (currentDraggedId == null) return;

  const taskIndex = tasks.findIndex(
    task => task.id === currentDraggedId);

  if (taskIndex > -1) {
    tasks[taskIndex].status = newStatus;
    render(); 
  }
};


function renderCard(t) {
  const tpl = document.getElementById('tmpl-card').content.cloneNode(true);
  const card = tpl.querySelector('.task-card');
  card.id = `card-${t.id}`;
  card.ondragstart = e => onCardDragStart(e, t.id);
  card.ondragend = onCardDragEnd;
  card.onclick = () => openModalById(t.id);

  const badge = tpl.querySelector('.badge');
  if (badge) {
    badge.textContent = t.type;
    badge.classList.add(getBadgeClass(t.type));
  }
  const h3 = tpl.querySelector('h3');
  if (h3) h3.textContent = t.title;

  const p = tpl.querySelector('p');
  if (p) p.textContent = t.description;

  const fill = tpl.querySelector('.progress-fill');
  if (fill) {
    const pct = t.subtasksTotal ? Math.round(t.subtasksDone / t.subtasksTotal * 100) : 0;
    fill.style.width = pct + '%';
  }
  const st = tpl.querySelector('.subtasks');
  if (st) st.textContent = `${t.subtasksDone}/${t.subtasksTotal} Subtasks`;

  return tpl;
}

function render() {
  Object.values(nameOfTheCard).forEach(({ id }) => document.getElementById(id)?.replaceChildren());

  for (const t of tasks) {
    const host = document.getElementById(nameOfTheCard[t.status]?.id);
    if (host) host.appendChild(renderCard(t));
  }
  for (const { id, empty } of Object.values(nameOfTheCard)) {
    const col = document.getElementById(id);
    if (col && !col.children.length) col.innerHTML = `<div class="empty-pill">${empty}</div>`;
  }
  requestAnimationFrame(afterRender);
}

function afterRender() {
  document.querySelectorAll('.task-card').forEach(card => {
    const task = tasks.find(t => t.id == card.id.replace('card-', ''));
    if (!task) return;

    const assBox = card.querySelector('.assignees');
    if (assBox) {
      assBox.innerHTML = (task.assignedTo || []).map(p => {
        if (p.img) return `<img src="${p.img}" class="assigned-to-picture" alt="${p.name}">`;
        const initials = p.name.split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]?.toUpperCase()||'').join('');
        return `<span class="assigned-to-initials" title="${p.name}">${initials}</span>`;
      }).join('');
    }

    const pill = card.querySelector('.priority-pill');
    if (pill) {
      const pr = (task.priority || 'low').toLowerCase();
      pill.innerHTML = `<img src="${prioritätIcon[pr] || prioritätIcon.low}" alt="${pr}" class="prio-icon">`;
    }
  });
}

function getBadgeClass(type) {
  switch (String(type)) {
    case "User Story":     return "badge-user";
    case "Technical Task": return "badge-technical";
    default:               return "badge-user";
  }
}

window.openModalById = (id) => {
  const task = tasks.find(x => x.id === id); if (!task) return;
  const modal = document.getElementById('task-modal');
  const content = document.getElementById('task-modal-content');
  if (!modal || !content) return;

  const isTech = String(task.type).trim().toLowerCase() === 'technical task';
  const html =
    (isTech && typeof getTechnicalTaskTemplate === 'function') ? getTechnicalTaskTemplate(task) :
    (typeof bigCardHtml === 'function')                         ? bigCardHtml(task) :
    fallbackModal(task);

  content.innerHTML = html;
  const s = (typeof saved !== 'undefined') ? saved[id] : null;
  if (s) {
    const boxes = content.querySelectorAll('.subtask-list input[type="checkbox"]');
    boxes.forEach((b, i) => b.checked = !!s[i]);
     if (boxes.length) updateSubtasks(id, boxes[0]);
  }

  modal.style.display = 'flex';
};

function closeModal() {
  const modal = document.getElementById('task-modal');
  if (modal) modal.style.display = 'none';
}
function closeTaskModal(){ closeModal(); }

function openAddTask(){
  const overlay = document.getElementById('addtask-overlay');
  const content = document.getElementById('addtask-content');
  if (!overlay || !content) return;

  if (!document.getElementById('addtask-css')) {
    const link = document.createElement('link');
    link.id = 'addtask-css';
    link.rel = 'stylesheet';
    link.href = './addTask_template.css'; 
    document.head.appendChild(link);
  }
  content.innerHTML = (typeof getAddTaskTemplate === 'function')
    ? getAddTaskTemplate()
    : '<div style="padding:16px">AddTask-Template fehlt.</div>';

  overlay.classList.add('open');

}

function closeAddTask(){
  const overlay = document.getElementById('addtask-overlay');
  const content = document.getElementById('addtask-content');
  if (!overlay || !content) return;

  overlay.classList.remove('open');
  setTimeout(() => {
    content.innerHTML = '';
    const css = document.getElementById('addtask-css');
    if (css) css.remove();
  }, 300);
}

window.updateSubtasks = (id, el) => {
  const subtaskListe = [...el.closest('.subtask-list').querySelectorAll('input[type="checkbox"]')];
  const done = subtaskListe.filter(x=>x.checked).length, total = subtaskListe.length, percent = total ? Math.round(done/total*100) : 0;
  const cardElement = document.getElementById('card-'+id);
  if(cardElement){
    cardElement.querySelector('.progress-fill').style.width = percent+'%';
    cardElement.querySelector('.subtasks').textContent = `${done}/${total} Subtasks`;
  }
  saved[id] = subtaskListe.map(x=>x.checked);
  localStorage.setItem('checks', JSON.stringify(saved));
};
window.onload = () => {
  for (const [taskId, states] of Object.entries(window.saved)) {
    const task = tasks.find(t => t.id == taskId);
    if (task) {
      task.subtasksTotal = states.length;
      task.subtasksDone  = states.filter(Boolean).length;
    }
  }
  render();
};