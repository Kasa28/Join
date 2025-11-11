/* === template_functions.js | Functions handling dynamic template generation === */

function bigCardDynamicHtml(t) {
  const title = t.title || "No title";
  const description = t.description || "No description provided.";
  const dueDate = t.dueDate || "No due date";
  const priority = (t.priority || "low").toLowerCase();
  const priorityIcons = {
    urgent:
      "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg",
    medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
    low: "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg",
  };
  const priorityIcon =
    t.priorityIcon || priorityIcons[priority] || priorityIcons.low;
  const type = t.type || "User Story";
  const assignedHTML =
    (t.assignedTo || [])
      .map((p) => {
        const initials = p.name
          .split(" ")
          .map((n) => n[0]?.toUpperCase())
          .join("");
        const bg = p.color ? `background-color:${p.color};` : "";
        return `
          <div class="user-badge_user-story">
            <span class="span-user-badge_user-story" style="${bg}">${initials}</span>
            <p class="p-user-badge_user-story">${p.name}</p>
          </div>`;
      })
      .join("") || "<p>No one assigned.</p>";
  const subtasksHTML =
    (t.subTasks || [])
      .map((sub, i) => {
        const checked = i < (t.subtasksDone || 0) ? "checked" : "";
        return `
          <label class="label_user-story">
            <input type="checkbox" class="checkbox_user-story"
                   onchange="updateSubtasks(${t.id}, this)" ${checked}>
            ${sub}
          </label>`;
      })
      .join("") || "<p>No subtasks added.</p>";
  return getBigCardDynamicHtml({
    id: t.id,
    title,
    description,
    dueDate,
    priority,
    priorityIcon,
    type,
    assignedHTML,
    subtasksHTML,
  });
}

function bigCardDynamicTechnicalHtml(t) {
  const title = t.title || "No title";
  const description = t.description || "No description provided.";
  const dueDate = t.dueDate || "No due date";
  const priority = (t.priority || "low").toLowerCase();
  const priorityIcons = {
    urgent:
      "../addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg",
    medium: "../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg",
    low: "../addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg",
  };
  const priorityIcon =
    t.priorityIcon || priorityIcons[priority] || priorityIcons.low;
  const priorityText = priority.charAt(0).toUpperCase() + priority.slice(1);
  const assignedHTML =
    (t.assignedTo || [])
      .map((p) => {
        const initials = p.name
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0]?.toUpperCase())
          .join("");
        const bg = p.color ? `background-color:${p.color};` : "";
        return ` 
                  <div class="user-container-technical-task">
                    <div class="user-badge-and-name">
                      <div class="name-letter-ball-technical-task" style="${bg}">
                        <span class="name-letter-ball-font-technical-task name-letter-ball-font-position-technical-task">${initials}</span>
                      </div>
                      <span class="a-user-bagde-font-position-technical-task">${p.name}</span>
                    </div>
                    <input type="checkbox" class="checkbox-technical-task border-white-technical-task" disabled>
                  </div>`;
      })
      .join("") ||
    '<p class="description-font-technical-task">No one assigned.</p>';
  const subtasksHTML =
    (t.subTasks || [])
      .map((sub, i) => {
        const checked = i < (t.subtasksDone || 0) ? "checked" : "";
        return `
                  <label class="label-font-technical-task">
                    <input type="checkbox" class="checkbox-technical-task border-blue-technical-task"
                           onchange="updateSubtasks(${t.id}, this)" ${checked}>
                    ${sub}
                  </label>`;
      })
      .join("<br>") ||
    '<p class="description-font-technical-task">No subtasks added.</p>';
  return getBigCardDynamicTechnicalHtml({
    id: t.id,
    title,
    description,
    dueDate,
    priority,
    priorityIcon,
    priorityText,
    assignedHTML,
    subtasksHTML,
  });
}
