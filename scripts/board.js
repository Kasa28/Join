
const tasks = [{
  id: 1,
  title: "Kochwelt Page & Recipe Recommender",
  description: "Build start page with recipe recommendation...",
  type: "User Story",
  status: "in-progress",  
  dueDate: "10/05/2023",
  priority: "urgent",
  subtasksDone: 1,
  subtasksTotal: 2
}];


let currentDraggedId = null;// ID der aktuell gezogenen Karte

const nameOfTheCard = {// Definition der Spalten auf dem Board
  'todo':           { id: 'drag-area-todo',           empty: 'No tasks To do' },
  'in-progress':    { id: 'drag-area-in-progress',    empty: 'No tasks in Progress' },
  'await-feedback': { id: 'drag-area-await-feedback', empty: 'No tasks in Feedback' },
  'done':           { id: 'drag-area-done',           empty: 'No task in Done' },
};

window.allowDrop = (e) => { e.preventDefault();//erlaubt das Ablegen von Elementen
   try { e.dataTransfer.dropEffect='move'; }// Setzt den Drop-Effekt
 catch {} };// Ermöglicht das Ablegen von Elementen
window.highlight = (id) => document.getElementById(id)?.classList.add('drag-highlight');// Hebt Drag-Ziele hervor
window.removeHighlight = (id) => document.getElementById(id)?.classList.remove('drag-highlight');// Entfernt die Hervorhebung von Drag-Zielen

window.onCardDragStart = (e, id) => {
  currentDraggedId = id;
  try { e.dataTransfer.setData('text/plain', String(id)); e.dataTransfer.effectAllowed = 'move'; } catch {}
  document.body.classList.add('dragging');
};

window.onCardDragEnd = () => {
  document.body.classList.remove('dragging');
};

window.moveTo = (statusOfCard) => {// Verschiebt die aktuell gezogene Karte in den Zielstatus
  if (currentDraggedId == null) return;// Wenn keine Karte gezogen wird, abbrechen, nur zur sicherheitt
  const i = tasks.findIndex(t => t.id === currentDraggedId);// Index der gezogenen Karte finden
  if (i > -1) { tasks[i].status = statusOfCard; 
    render();// Status aktualisieren und neu rendern
   }
};

//große Karte öffnen
window.openModalById = (id) => {// Öffnet das Task-Modal basierend auf der ID
  const task = tasks.find(x => x.id === id);// Aufgabe anhand der ID finden
  if (!task) return;// Wenn keine Aufgabe gefunden, abbrechen
  const modal = document.getElementById('task-modal');// Hol das Modal-Element
  const cart = document.getElementById('task-modal-content');// Hol das Modal-Content-Element
  cart.innerHTML = bigCardHtml(task); //greift auf template.js zu und holt das HTML Template
  modal.style.display = 'flex';// Modal anzeigen,sichtbar machen,ohne öffnet sich nicht
};
window.closeModal = () => { const modal = document.getElementById('task-modal'); if (modal) modal.style.display='none'; };// Schließt das Task-Modal





function renderCard(t){// Rendert eine einzelne Aufgabenkarte
  const tpl = document.getElementById('tmpl-card').content.cloneNode(true);// Klont die Vorlage
  const card = tpl.querySelector('.task-card');// Holt das Karten-Element
  card.id = `card-${t.id}`;// Setzt die ID der Karte
 
  card.setAttribute('ondragstart', `onCardDragStart(event, ${t.id})`);// Drag-Start-Handler
  card.setAttribute('ondragend',   `onCardDragEnd()`);// Drag-End-Handler
  card.setAttribute('onclick',     `openModalById(${t.id})`);// Klick-Handler zum Öffnen des Modals

  tpl.querySelector('.badge').textContent = t.type;// Setzt den Typ-Badge
  tpl.querySelector('h3').textContent     = t.title;// Setzt den Titel
  tpl.querySelector('p').textContent      = t.description;// Setzt die Beschreibung
  const fill = tpl.querySelector('.progress-fill');// Holt das Fortschrittsfüll-Element
  const pct  = t.subtasksTotal ? Math.round(t.subtasksDone / t.subtasksTotal * 100) : 0;// Berechnet den Fortschrittsprozentsatz
  fill.style.width = pct + '%';// Setzt die Breite des Füll-Elements
  tpl.querySelector('.subtasks').textContent = `${t.subtasksDone}/${t.subtasksTotal} Subtasks`;// Setzt den Subtask-Text

  return tpl;// Gibt das gerenderte Template zurück
}




function appendCardToColumn(task){// Fügt eine Karte zu der entsprechenden Spalte hinzu
  const byStatus = {// Mapping von Status zu Spalten-ID
    'todo':'drag-area-todo',
    'in-progress':'drag-area-in-progress',
    'await-feedback':'drag-area-await-feedback',
    'done':'drag-area-done'
  };
  const host = document.getElementById(byStatus[task.status]);// Hol die Spalte anhand des Status
  if (!host) return;// Wenn die Spalte nicht existiert, überspringen
  host.querySelector('.empty-pill')?.remove();// Entferne den leere Hinweis, falls vorhanden
  host.appendChild(renderCard(task));// Karte rendern und hinzufügen
}

function render(){// Rendert alle Aufgaben auf dem Board
  Object.values(nameOfTheCard).forEach(({ id }) => {// Alle Spalten leeren
    const el = document.getElementById(id);// Hol die Spalte
    el.querySelectorAll('.task-card').forEach(n => n.remove());

  });


  tasks.forEach(t => {// Jede Aufgabe in die richtige Spalte einfügen
    const col = nameOfTheCard[t.status];// Spalte anhand des Status finden
    if (!col) return;// Wenn kein Status gefunden, überspringen
    const host = document.getElementById(col.id);// Hol die Spalte
    if (!host) return;// Wenn die Spalte nicht existiert, überspringen
    host.appendChild(renderCard(t)); // Karte rendern und hinzufügen
  });


  Object.values(nameOfTheCard).forEach(({ id, empty }) => {// Leere Spalten mit Hinweis füllen
    const el = document.getElementById(id);// Hol die Spalte
    if (el && el.children.length === 0) {// Wenn die Spalte leer ist
      el.innerHTML = `<div class="empty-pill">${empty}</div>`;// Füge den Hinweis hinzu
    }
  });
}


window.onload = render;// Initiales Rendern der Aufgaben


function openAddTask(){// Öffnet das Add Task Side Panel
  const overlay = document.getElementById('addtask-overlay');// Hol das Overlay Element
  const content = document.getElementById('addtask-content');// Hol das Content Element
  // load scoped CSS for Add Task to avoid global overrides
  loadAddTaskCss();
  content.innerHTML = getAddTaskTemplate();  // holt das HTML Template
  overlay.classList.add('open');// Overlay öffnen
  //document.body.style.overflow = 'hidden'; // Body scrollen verhindern
}

function closeAddTask(){// Schließt das Add Task Side Panel
  const overlay = document.getElementById('addtask-overlay');// Hol das Overlay Element
  overlay.classList.remove('open');// Overlay schließen
  //document.body.style.overflow = '';// Body scrollen erlauben
  setTimeout(() => {// Warte bis die Animation fertig ist
    document.getElementById('addtask-content').innerHTML = '';// Inhalt leeren
    // remove add task css after closing so board styles are not affected
    unloadAddTaskCss();
  }, 300);// 300ms entspricht der CSS-Übergangszeit
}

// Dynamically load/unload the Add Task CSS (scoped)
function loadAddTaskCss(){
  if (document.getElementById('addtask-css')) return;
  const link = document.createElement('link');
  link.id = 'addtask-css';
  link.rel = 'stylesheet';
  // path relative to board.html (board_code)
  link.href = './addTask_template.css';
  document.head.appendChild(link);
}

function unloadAddTaskCss(){
  const el = document.getElementById('addtask-css');
  if (el) el.remove();
}


function closeTaskModal() {// Schließt das Task-Modal
  const overlay = document.getElementById('task-modal');// Hol das Modal Element
  if (overlay) overlay.style.display = 'none';// Modal ausblenden
  document.body.style.overflow = '';// Body scrollen erlauben
}




function searchTasks() {
  const textofSearch = getSearchText();       // holt den Text aus dem Suchfeld
  if (textofSearch === '') 
    return resetSearch(); 

  const found = findTasks(textofSearch);      // sucht passende Aufgaben
  showSearchResult(found);  
}

function getSearchText() {
  const input = document.querySelector('.board-search-input');
  return input.value.trim().
  toLowerCase(); // leerzeichen weg + kleinbuchstaben
}

function resetSearch() {
  document.getElementById('search-msg').textContent = '';
  render(); // alles wieder anzeigen
}

function findTasks(text) {
  return tasks.filter(t =>
    t.title.toLowerCase().includes(text) ||
    (t.description && t.description.toLowerCase().includes(text))
  );
}

function showSearchResult(list) {
  const msg = document.getElementById('search-msg');
  if (list.length === 0) {
    msg.textContent = 'No tasks found';
    return;
  }
  msg.textContent = ''; // Meldung löschen
  renderFiltered(list); //  zeigen ergebnis
}

function renderFiltered(list) {
  Object.values(nameOfTheCard).forEach(({ id }) => {
    const nameOfTheCard = document.getElementById(id);
    nameOfTheCard?.querySelectorAll('.task-card').forEach(n => n.remove());
  });

  list.forEach(t => {
    const host = document.getElementById(nameOfTheCard[t.status].id);
    host?.appendChild(renderCard(t));
  });
}
