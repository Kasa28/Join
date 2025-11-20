/* === board_modals_core.js | Handles opening and closing of task and add-task modals === */


/* === Task Modal: Open by ID === */
/**
 * Opens the task modal for a given task ID, loads the appropriate template,
 * applies user-story or technical styling, restores subtask states, and
 * prevents background scrolling.
 * @param {number} id - The ID of the task to open in the modal.
 */
window.openModalById = (id) => {
    const task = Array.isArray(window.tasks)
      ? window.tasks.find((x) => x.id === id)
      : null;
    if (!task) return;
    const modal = document.getElementById("task-modal");
    const content = document.getElementById("task-modal-content");
    if (!modal || !content) return;
    const taskType = task.type;
    const isTechnical = isTechnicalType(taskType);
    const isUserStory = isUserStoryType(taskType);
    if (task.id > 1000 && typeof bigCardDynamicHtml === "function") {
      if (isUserStory && !document.getElementById("user-story-css")) {
        const link = document.createElement("link");
        link.id = "user-story-css";
        link.rel = "stylesheet";
        link.href = "../board_code/user_story_template.css";
        document.head.appendChild(link);
      }
      if (isTechnical && !document.getElementById("technical-css")) {
        const link = document.createElement("link");
        link.id = "technical-css";
        link.rel = "stylesheet";
        link.href = "../styles/board-technical.css";
        document.head.appendChild(link);
      }
      if (isTechnical && typeof bigCardDynamicTechnicalHtml === "function") {
        content.innerHTML = bigCardDynamicTechnicalHtml(task);
      } else {
        content.innerHTML = bigCardDynamicHtml(task);
      }
      modal.style.display = "flex";
      document.body.classList.add("no-scroll");
      return; 
    }
    if (!isTechnical && !document.getElementById("user-story-css")) {
      const link = document.createElement("link");
      link.id = "user-story-css";
      link.rel = "stylesheet";
      link.href = "../board_code/user_story_template.css"; 
      document.head.appendChild(link);
    }
    if (isTechnical && !document.getElementById("technical-css")) {
      const link = document.createElement("link");
      link.id = "technical-css";
      link.rel = "stylesheet";
      link.href = "../styles/board-technical.css";
      document.head.appendChild(link);
    }
    const html =
      isTechnical && typeof getTechnicalTaskTemplate === "function"
        ? getTechnicalTaskTemplate(task)
        : typeof bigCardHtml === "function"
        ? bigCardHtml(task)
        : fallbackModal(task);
    content.innerHTML = html;
    const s = typeof saved !== "undefined" ? saved[id] : null;
    if (s) {
      const boxes = content.querySelectorAll(
        '.subtask-list input[type="checkbox"]'
      );
      boxes.forEach((b, i) => (b.checked = !!s[i]));
      if (boxes.length) updateSubtasks(id, boxes[0]);
    }
    modal.style.display = "flex";
    document.body.classList.add("no-scroll");
  };
  

    /* === Close Task Modal === */
  /**
 * Closes the task modal and restores page scrolling.
 */
function closeModal() {
    const modal = document.getElementById("task-modal");
    if (modal) modal.style.display = "none";
    document.body.classList.remove("no-scroll");
  }


    /* === Alias: Close Task Modal Wrapper === */
  /**
 * Wrapper function for closing the task modal.
 */
function closeTaskModal() {
    closeModal();
  }
  

  /* === Add Task Overlay: Open and Close === */
/**
 * Opens the Add Task overlay, loads its template, initializes handlers,
 * renders contacts, injects required CSS, and focuses the title input.
 */
function openAddTask() {
    const overlay = document.getElementById("addtask-overlay");
    const content = document.getElementById("addtask-content");
    if (!overlay || !content) return;
    if (!document.getElementById("addtask-css")) {
      const link = document.createElement("link");
      link.id = "addtask-css";
      link.rel = "stylesheet";
      link.href = "./addTask_template.css";
      document.head.appendChild(link);
    }
    content.innerHTML =
      typeof getAddTaskTemplate === "function"
        ? getAddTaskTemplate()
        : '<div style="padding:16px">AddTask-Template fehlt.</div>';
        renderContactsInDropdown();
        overlay.classList.add("open");
    document.body.classList.add("no-scroll");
    if (typeof initAddTaskTemplateHandlers === "function") {
      initAddTaskTemplateHandlers();
    }
    const titleInput = content.querySelector("#title");
    if (titleInput) titleInput.focus();
  }

  
  /**
 * Closes the Add Task overlay, resets global task-editing state,
 * clears selected users, removes injected CSS, and restores scroll.
 */
function closeAddTask() {
    const overlay = document.getElementById("addtask-overlay");
    const content = document.getElementById("addtask-content");
    if (!overlay || !content) return;
    overlay.classList.remove("open");
    document.body.classList.remove("no-scroll");
    window.taskBeingEdited = null;
    window.selectedUsers = [];
    window.selectedUserColors = {};
    window.isDropdownOpen = false;
    setTimeout(() => {
      content.innerHTML = "";
      const css = document.getElementById("addtask-css");
      if (css) css.remove();
    }, 300);
  }
