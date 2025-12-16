/**
 * @typedef {Object} AssignedUser
 * @property {string} name
 * @property {string} [img]
 * @property {string} [color]
 */
/**
 * @typedef {"todo"|"in-progress"|"await-feedback"|"done"} TaskStatus
 */
/**
 * @typedef {"urgent"|"medium"|"low"} TaskPriority
 */
/**
 * @typedef {Object} Task
 * @property {number|string} id
 * @property {string} title
 * @property {string} description
 * @property {string} type
 * @property {TaskStatus} status
 * @property {string} dueDate
 * @property {TaskPriority} priority
 * @property {string} [priorityIcon]
 * @property {number} subtasksDone
 * @property {number} subtasksTotal
 * @property {AssignedUser[]} assignedTo
 * @property {string[]} [subTasks]
 */
/**
 * Renders a single task into a cloned card template.
 * @param {Task} t
 * @returns {DocumentFragment}
 */
function renderCard(t){const tpl=document.getElementById("tmpl-card").content.cloneNode(true);
const card=tpl.querySelector(".task-card"),menuBtn=document.createElement("button");
menuBtn.classList.add("mobile-move-btn");menuBtn.innerHTML="⋮";menuBtn.onclick=(ev)=>openMoveMenu(ev,t.id);
if(isTouchDevice){menuBtn.style.display="grid";}
card.appendChild(menuBtn);card.id=`card-${t.id}`;card.draggable=true;
card.ondragstart=(e)=>onCardDragStart(e,t.id);card.ondragend=onCardDragEnd;
card.onclick=(event)=>{event.stopPropagation();openModalById(Number(t.id));};
const badge=tpl.querySelector(".badge");if(badge){badge.textContent=t.type;badge.classList.add(getBadgeClass(t.type));}
const h3=tpl.querySelector("h3");if(h3)h3.textContent=t.title;
const p=tpl.querySelector("p");if(p)p.textContent=t.description;
const fill=tpl.querySelector(".progress-fill"),track=tpl.querySelector(".progress-track"),st=tpl.querySelector(".subtasks");
const total=Number(t.subtasksTotal)||0,hasSubtasks=total>0,pct=hasSubtasks?Math.round((t.subtasksDone/total)*100):0;
if(track)track.style.display=hasSubtasks?"":"none";if(fill)fill.style.width=pct+"%";
if(st){st.style.display=hasSubtasks?"":"none";st.textContent=hasSubtasks?`${t.subtasksDone}/${total} Subtasks`:"";}return tpl;}

/**
 * Builds a subtask list <li> element for edit UI.
 * @param {string} text
 * @returns {HTMLLIElement}
 */
function buildSubtaskListItem(text){
const li=document.createElement("li");
li.classList.add("subtask-entry-edit");li.textContent=text;
const actions=document.createElement("div");
actions.classList.add("subtask-actions-addTask_template");
actions.innerHTML='<img src="../assets/img/edit.svg" alt="Edit subtask" class="subtask-edit-addTask_template"><div class="subtask-divider-addTask_template"></div><img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_template">';
li.appendChild(actions);
return li;}

/**
 * Renders all board columns and visible task cards.
 * Respects current search filter and empty-column pills.
 * @returns {void}
 */
function render(){const tasks=Array.isArray(window.tasks)?window.tasks:[];
Object.values(nameOfTheCard).forEach(({id})=>document.getElementById(id)?.replaceChildren());
for(const t of tasks){
if(!matchesSearch(t))continue;
const host=document.getElementById(nameOfTheCard[t.status]?.id);
if(host)host.appendChild(renderCard(t));}
for(const {id,empty}of Object.values(nameOfTheCard)){
const col=document.getElementById(id);
if(col&&!col.children.length){col.innerHTML=`<div class="empty-pill">${empty}</div>`;}}
requestAnimationFrame(afterRender);}

/**
 * Post-render pass to inject assignee avatars/initials and priority icons.
 * @returns {void}
 */
function afterRender(){
const tasks=Array.isArray(window.tasks)?window.tasks:[];
document.querySelectorAll(".task-card").forEach((card)=>{
const task=tasks.find((t)=>t.id==card.id.replace("card-",""));
if(task)updateCardAfterRender(card,task);
});}

function updateCardAfterRender(card,task){
const assBox=card.querySelector(".assignees");
if(assBox)fillAssignees(assBox,task);
const pill=card.querySelector(".priority-pill");
if(pill)fillPriorityPill(pill,task);}

function fillAssignees(assBox,task){
const people=task.assignedTo||[],maxVisible=3,visible=people.slice(0,maxVisible);
assBox.innerHTML=visible.map((p)=>{const initials=getInitialsFromName(p.name);
const bg=p.color?`background-color:${p.color};`:"";
return `<span class="assigned-to-initials" title="${p.name}" style="${bg}">${initials}</span>`;}).join("");
if(people.length>maxVisible){const extra=people.length-maxVisible;
assBox.innerHTML+=`<span class="assigned-to-initials" style="background-color: #d1d1d1;color: black;font-weight: 600;">+${extra}</span>`;}}

function fillPriorityPill(pill,task){
const pr=(task.priority||"low").toLowerCase();
const iconSrc=task.priorityIcon||prioritätIcon[pr]||prioritätIcon.low;
pill.innerHTML=`<img src="${iconSrc}" alt="${pr}" class="prio-icon">`;}

if (needsDraggingClassAfterRender && whichCardActuellDrop != null) {
  const card = document.getElementById(`card-${whichCardActuellDrop}`);
  if (card) {
    currentDragCardEl = card;
    card.classList.add("is-dragging");
    if (pendingDragTiltClass) {
      card.classList.add(pendingDragTiltClass);
    }
  }
  needsDraggingClassAfterRender = false;
  pendingDragTiltClass = null;
}

/**
 * Creates initials from a full name (max 2 letters).
 * @param {string} name
 * @returns {string}
 */
function getInitialsFromName(name){
return String(name||"")
.split(/\s+/)
.filter(Boolean)
.map((part)=>part[0]?.toUpperCase()||"")
.slice(0,2)
.join("");}


/**
 * Hydrates the assign section in AddTask overlay based on task data.
 * @param {Task} task
 * @returns {void}
 */
function hydrateAssignSection(task){
const content=document.getElementById("addtask-content");
if(!content)return;
renderAssignAvatars(content,task);
syncAssignCheckboxes(content);
updateAssignPlaceholder(content);}

function renderAssignAvatars(content,task){
const container=content.querySelector("#assigned-avatars");
if(!container)return;
container.innerHTML="";
(task.assignedTo||[]).forEach((person)=>{
const name=person?.name||"",color=person?.color||"#4589ff",initials=getInitialsFromName(name);
const avatar=document.createElement("div");
avatar.textContent=initials;
avatar.classList.add("assign-avatar-addTask_template","assign-avatar-addTask_page");
avatar.style.backgroundColor=color;
avatar.dataset.fullName=name;avatar.dataset.color=color;avatar.title=name;
container.appendChild(avatar);});}

function syncAssignCheckboxes(content){
const items=content.querySelectorAll(".assign-item-addTask_template");
items.forEach((item)=>{
const name=item.querySelector(".assign-name-addTask_template")?.textContent.trim();
const checkbox=item.querySelector(".assign-check-addTask_template");
const selected=(window.selectedUsers||[]).includes(name);
if(checkbox)checkbox.checked=selected;
item.classList.toggle("selected",selected);
});}

function updateAssignPlaceholder(content){
const placeholder=content.querySelector(".assign-placeholder-addTask_template");
if(!placeholder)return;
const count=(window.selectedUsers||[]).length;
placeholder.textContent=count?"":"Select contact to assign";
placeholder.style.color="black";}

/**
 * Normalizes a task type string for comparisons.
 * @param {string} type
 * @returns {string}
 */
function normalizeTaskType(type){
return String(type||"")
.trim()
.toLowerCase();}

/**
 * Checks if type represents a user story.
 * @param {string} type
 * @returns {boolean}
 */
function isUserStoryType(type){
const n=normalizeTaskType(type);
return n==="user story"||n==="user-story";}

/**
 * Checks if type represents a technical task.
 * @param {string} type
 * @returns {boolean}
 */
function isTechnicalType(type){
return normalizeTaskType(type)==="technical task";}

/**
 * Returns badge CSS class based on type.
 * @param {string} type
 * @returns {"badge-technical"|"badge-user"}
 */
function getBadgeClass(type){
return isTechnicalType(type)?"badge-technical":"badge-user";}
