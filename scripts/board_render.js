
/*************************************************
 * 5) Karten-Rendering (+ Nacharbeiten)
 *************************************************/
function renderCard(t) {
    // nutzt dein <template id="tmpl-card"> aus dem HTML
    const tpl = document.getElementById("tmpl-card").content.cloneNode(true);
    const card = tpl.querySelector(".task-card");
  
    // Basis
    card.id = `card-${t.id}`;
    card.draggable = true;
    card.ondragstart = (e) => onCardDragStart(e, t.id);
    card.ondragend = onCardDragEnd;
  
    // Klick -> Modal
    card.onclick = (event) => {
      event.stopPropagation();
      openModalById(Number(t.id));
    };
  
    // Badge
    const badge = tpl.querySelector(".badge");
    if (badge) {
      badge.textContent = t.type;
      badge.classList.add(getBadgeClass(t.type));
    }
  
    // Titel & Beschreibung
    const h3 = tpl.querySelector("h3");
    if (h3) h3.textContent = t.title;
    const p = tpl.querySelector("p");
    if (p) p.textContent = t.description;
  
    // Progress-Balken + Text
    const fill = tpl.querySelector(".progress-fill");
    const st = tpl.querySelector(".subtasks");
    const pct = t.subtasksTotal
      ? Math.round((t.subtasksDone / t.subtasksTotal) * 100)
      : 0;
    if (fill) fill.style.width = pct + "%";
    if (st) st.textContent = `${t.subtasksDone}/${t.subtasksTotal} Subtasks`;
  
    return tpl;
  }

  function buildSubtaskListItem(text) {
    const li = document.createElement("li");
    li.classList.add("subtask-entry-edit");
    li.textContent = text;
    const actions = document.createElement("div");
    actions.classList.add("subtask-actions-addTask_template");
    actions.innerHTML = `
          <img src="../assets/img/edit.svg"   alt="Edit subtask"   class="subtask-edit-addTask_template">
          <div class="subtask-divider-addTask_template"></div>
          <img src="../assets/img/delete.svg" alt="Delete subtask" class="subtask-remove-addTask_template">
        `;
    li.appendChild(actions);
    return li;
  }
  
  function render() {
    // Spalten leeren
    Object.values(nameOfTheCard).forEach(({ id }) =>
      document.getElementById(id)?.replaceChildren()
    );
  
    // Karten in Spalten einfügen
    for (const t of window.tasks) {
      if (!matchesSearch(t)) continue;
      const host = document.getElementById(nameOfTheCard[t.status]?.id);
      if (host) host.appendChild(renderCard(t));
    }
  
    // Leere-Pille, wenn Spalte leer
    for (const { id, empty } of Object.values(nameOfTheCard)) {
      const col = document.getElementById(id);
      if (col && !col.children.length) {
        col.innerHTML = `<div class="empty-pill">${empty}</div>`;
      }
    }
  
    requestAnimationFrame(afterRender);
  }
  
  /** Nach dem Rendern: Avatare + Prio-Icon einsetzen */
  function afterRender() {
    document.querySelectorAll(".task-card").forEach((card) => {
      const task = window.tasks.find((t) => t.id == card.id.replace("card-", ""));
      if (!task) return;
  
      // Assignees
      const assBox = card.querySelector(".assignees");
      if (assBox) {
        assBox.innerHTML = (task.assignedTo || [])
          .map((p) => {
            if (p.img)
              return `<img src="${p.img}" class="assigned-to-picture" alt="${p.name}">`;
            const initials = p.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0]?.toUpperCase() || "")
              .join("");
            const bg = p.color ? `background-color:${p.color};` : "";
            return `<span class="assigned-to-initials" title="${p.name}" style="${bg}">${initials}</span>`;
          })
          .join("");
      }
  
      // Prio-Pille
      const pill = card.querySelector(".priority-pill");
      if (pill) {
        const pr = (task.priority || "low").toLowerCase();
        const iconSrc =
          task.priorityIcon || prioritätIcon[pr] || prioritätIcon.low;
        pill.innerHTML = `<img src="${iconSrc}" alt="${pr}" class="prio-icon">`;
      }
    });
  }
  
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
  
  function getInitialsFromName(name) {
    return String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  }

  function hydrateAssignSection(task) {
    const content = document.getElementById("addtask-content");
    if (!content) return;
  
    // Avatare
    const container = content.querySelector("#assigned-avatars");
    if (container) {
      container.innerHTML = "";
      (task.assignedTo || []).forEach((person) => {
        const initials = getInitialsFromName(person.name);
        const avatar = document.createElement("div");
        avatar.classList.add("assign-avatar-addTask_template");
        avatar.textContent = initials;
        const color = person.color || "#4589ff";
        avatar.style.backgroundColor = color;
        avatar.dataset.fullName = person.name || initials;
        avatar.dataset.color = color;
        avatar.title = person.name || initials;
        container.appendChild(avatar);
      });
    }
  
    // Checkboxen synchronisieren
    const items = content.querySelectorAll(".assign-item-addTask_template");
    items.forEach((item) => {
      const name = item
        .querySelector(".assign-name-addTask_template")
        ?.textContent.trim();
      const checkbox = item.querySelector(".assign-check-addTask_template");
      const selected = (window.selectedUsers || []).includes(name);
      if (checkbox) checkbox.checked = selected;
      item.classList.toggle("selected", selected);
    });
  
    const placeholder = content.querySelector(
      ".assign-placeholder-addTask_template"
    );
    if (placeholder) {
      placeholder.textContent = (window.selectedUsers || []).length
        ? ""
        : "Select contact to assign";
      placeholder.style.color = "black";
    }
  }
  
  /*************************************************
   * 6) Typ-Helfer (für Badges & CSS-Laden)
   *************************************************/
  function normalizeTaskType(type) {
    return String(type || "")
      .trim()
      .toLowerCase();
  }
  function isUserStoryType(type) {
    const n = normalizeTaskType(type);
    return n === "user story" || n === "user-story";
  }
  function isTechnicalType(type) {
    return normalizeTaskType(type) === "technical task";
  }
  function getBadgeClass(type) {
    return isTechnicalType(type) ? "badge-technical" : "badge-user";
  }
  