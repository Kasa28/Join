function bigCardHtml(t) {
  return `
 <header class="header-wrapper_user-story">
        <span class="label_user_story">User Story</span>
               <button class="close-btn_user-story" onclick="closeTaskModal()">x</button>
    </header>
    <h1 class="title_user-story">Kochwelt Page & Recipe Recommender</h1>
    <h3 class="h3_user-story">Build start page with recipe recommendation.</h3>

    <main class="main_content_user_story">
        <div class="date-input-wrapper_user-story">
            <p class="section-heading_user-story"><strong>Due date:</strong></p>
            <p class="task-date-display_user-story">10/05/2023</p>
        </div>

        <section class="task-input_user-story">
            <div class="priority-row_user-story">
                <p class="section-heading_user-story"><strong>Priority:</strong></p>
                <button type="button" class="priority-btn-medium_user-story" onclick="setPriority('medium')">Medium
                    <img class="addTask-icons_user-story" src="/addTask_code/icons_addTask/separatedAddTaskIcons/sum_icon.svg"
                        alt="sum icon">
                </button>
            </div>
        </section>

        <section class="task-input_user-story">
            <p class="section-heading_user-story"><strong>Asigned To:</strong></p>
        </section>

        <div class="assigned-users_user-story">
            <div class="user-badge_user-story">
                <span class="span-user-badge_user-story" style="background-color: #FF7A00;">EM</span>
                <p class="p-user-badge_user-story">Emmanuel Mauer</p>
            </div>
            <div class="user-badge_user-story">
                <span class="span-user-badge_user-story" style="background-color: #4589FF;">MB</span>
                <p class="p-user-badge_user-story">Marcel Bauer</p>
            </div>
            <div class="user-badge_user-story">
                <span class="span-user-badge_user-story" style="background-color: #02B875;">AM</span>
                <p class="p-user-badge_user-story">Anton Mayer</p>
            </div>
        </div>

        <section class="task-input_user-story">
         <p class="section-heading_user-story"><strong>Subtasks</strong></p>
        <div class="subtask-list">
       <label class="label_user-story">
      <input type="checkbox" class="checkbox_user-story" onchange="updateSubtasks(${t.id}, this)">
      Implement Recipe Recommendation
      </label>
      <label class="label_user-story">
      <input type="checkbox" class="checkbox_user-story" onchange="updateSubtasks(${t.id}, this)">
      Start Page Layout
    </label>
      </div>
      </section>


        <div class="action-buttons_user-story">
            <div class="action-btn_user-story">
                <img src="../assets/img/delete.svg" alt="Delete" class="action-icon_user-story">
                <span>Delete</span>
            </div>
            <div class="divider_user-story"></div>
            <div class="action-btn_user-story">
                <img src="../assets/img/edit.svg" alt="Edit" class="action-icon_user-story">
                <span>Edit</span>
            </div>
        </div>
    </main>
  `;
}

function getAddTaskTemplate() {
  return `
   <header class="header-wrapper-addTask_template">
  <h1 class="h1-addTask_template">Add Task</h1>
   <button class="close-btn-addTask_template" onclick="closeAddTask()">x</button>
</header>

  <main class="main-addTask_template">

    <section>
      <label for="title" class="label-addTask_template">Title</label>
      <input type="text" class="task-title-addTask_template" name="title" placeholder="Enter a title">
    </section>

    <section>
      <label for="description" class="label-addTask_template">Description</label>
      <p class="section-heading-addTask_template"><strong>Description</strong> (optional)</p>
      <textarea id="description" class="task-description-addTask_template" name="description"
        placeholder="Enter a description"></textarea>
    </section>

    <div class="date-input-wrapper-addTask_template">
      <p class="section-heading-addTask_template"><strong>Due date</strong></p>
      <div class="date-field-addTask_template">
        <input type="text" id="due-date" class="task-date-addTask_template" name="due-date" placeholder="dd/mm/yyyy"
          pattern="\d{2}/\d{2}/\d{4}" inputmode="numeric">
        <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/event.svg" alt="Event Icon" class="event-icon-addTask_template">
      </div>
    </div>

    <section>
      <label class="label-addTask_template">Priority</label>
      <p class="section-heading-addTask_template"><strong>Priority</strong></p>
      <div class="priority-group-addTask_template">
        <button type="button" class="priority-btn-urgent-addTask_template" onclick="setPriority('urgent')">Urgent
          <img class="addTask-icons-addTask_template" src="/addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg" alt="urgent icon">
        </button>
        <button type="button" class="priority-btn-medium-addTask_template" onclick="setPriority('medium')">Medium
          <img class="addTask-icons-addTask_template" src="/addTask_code/icons_addTask/separatedAddTaskIcons/sum_icon.svg" alt="sum icon">
        </button>
        <button type="button" class="priority-btn-low-addTask_template" onclick="setPriority('low')">Low
          <img class="addTask-icons-addTask_template" src="/addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg"
            alt="2 arrows in green showing up">
        </button>
      </div>
    </section>





    


    <section>
      <label for="assign" class="label-addTask_template">Assign to</label>
      <p class="section-heading-addTask_template"><strong>Asigned to</strong> (optional)</p>
      <select id="assign" class="task-select-addTask_template" name="assign">
        <option value="">Select contact to assign</option>
      </select>
 
 <div class="assign-select-addTask_template" id="assign-select" onclick="toggleAssignDropdown(event)">
        <span class="assign-placeholder-addTask_template">Select contact to assign</span>
        <img src="./icons_addTask/separatedAddTaskIcons/arrow_drop_down.svg" alt="Open assign menu"
          class="assign-arrow-addTask_template">
      </div>

     <div class="assign-dropdown-addTask_template" aria-label="Assign to options" role="listbox">
        <div class="assign-item-addTask_template" onclick="selectAssignUser('Nils Becker')">
          <span class="assign-avatar-addTask_template" style="background-color: #4589ff;">NB</span>
          <span class="assign-name-addTask_template">Nils Becker</span>
          <input type="checkbox" class="assign-check-addTask_template">
        </div>

        <div class="assign-item-addTask_template" onclick="selectAssignUser('Lara König')">
          <span class="assign-avatar-addTask_template" style="background-color: #ff7eb6;">LK</span>
          <span class="assign-name-addTask_template">Lara König</span>
          <input type="checkbox" class="assign-check-addTask_template">
        </div>

        <div class="assign-item-addTask_template" onclick="selectAssignUser('Omar Said')">
          <span class="assign-avatar-addTask_template" style="background-color: #00bfa5;">OS</span>
          <span class="assign-name-addTask_template">Omar Said</span>
          <input type="checkbox" class="assign-check-addTask_template">
        </div>
      </div>
      </section>








    <section>
      <label for="category" class="label-addTask_template">Category</label>
      <p class="section-heading-addTask_template"><strong>Category</strong></p>
      <select id="category" class="task-select-addTask_template" name="category">
        <option value="">Select task category</option>
        <option value="technical">Technical Task</option>
        <option value="user-story">User Story</option>     
        </select>
    </section>

    <section>
      <label for="subtask" class="label-addTask_template">Subtasks</label>
      <p class="section-heading-addTask_template"><strong>Subtasks</strong> (optional)</p>
      <div class="subtask-wrapper-addTask_template">
        <input type="text" id="subtask" class="task-subtask-addTask_template" name="subtask" placeholder="Add new subtask">
        <div class="subtask-icons-addTask_template">
          <img src="../assets/img/close-blue.svg" alt="Close subtask" class="subtask-delete-addTask_template">
          <div class="subtask-divider-addTask_template"></div>
          <img src="../assets/img/check.svg" alt="Confirm subtask" class="subtask-check-addTask_template">
        </div>
      </div>
      </section>

  </main>
  <div class="btn-done-wrapper-addTask_template">
  <button class="btn-done-addTask_template btn-with-svg-addTask_template" onclick="createTask()">Create Task
    <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/check.svg" alt="Check icon" class="check-icon-addTask_template">
  </button>
</div>
   `;
}

function getTechnicalTaskTemplate() {
  return `
    <main class="main-container-technical-task">

        <div class="head-bar-technical-task">
            <div class="head-sign-technical-task">
                <a class="a-font-style-technical-task">Technical Task</a>
            </div>
            <button class="close-button-technical-task" onclick="closeAddTask()">x</button>
        </div>

        <div class="headline-container-technical-task">
            <h1 class="h1-technical-task">CSS Architecture Planning</h1>
        </div>

        <div class="describtion-conatainer-technical-task">
            <p class="description-font-technical-task">define CSS naming conversations and structure.</p>
        </div>

        <div class="date-container-technical-task">
            <a class="status-font-technical-task">Due Date:</a>
                <a lass="date-container-technical-task">02/09/2023</a>
        </div>

        <div class="priority-container-technical-task">
            <a class="status-font-technical-task">Priority:</a>
            <div class="actual-priority-container-technical-task">
                <a>Urgent</a>
                <img src="../assets/img/Prio baja-urgent-red.svg" alt="baja">
            </div>
        </div>

        <div class="assigned-to-container-technical-task">
            <a class="status-font-technical-task">Assigned To:</a>
            <div class="">
                <div class="user-container-technical-task">
                    <div class="user-badge-and-name">
                        <div class="name-letter-ball-technical-task">
                            <a class="name-letter-ball-font-technical-task name-letter-ball-font-position-technical-task">SM</a>
                        </div>
                        Sofia Müller (You)
                    </div>
                    <input type="checkbox" class="checkbox-technical-task border-white-technical-task">
                </div>
                
                <div class="user-container-technical-task">
                    <div class="user-badge-and-name">
                        <div class="name-letter-ball-technical-task">
                            <a class="name-letter-ball-font-technical-task name-letter-ball-font-position-technical-task">SM</a>
                        </div>
                        Sofia Müller (You)
                    </div>
                    <input type="checkbox" class="checkbox-technical-task border-white-technical-task">
                </div>


            </div>
        </div>

        <div class="subtasks-container-technical-task">
            <a class="status-font-technical-task">Subtasks:</a>
            <div class="subtasks-task-container-technical-task">
                    <div>
                        <label class="label-font-technical-task"><input type="checkbox" class="checkbox-technical-task border-blue-technical-task"> Establish CSS Mythology</label><br>
                        <label class="label-font-technical-task"><input type="checkbox" class="checkbox-technical-task border-blue-technical-task"> Setup Base Styles</label>
                    </div>
            </div>
            <div class="delete-edit-section-technical-task">
            <div class="delete-edit-container-technical-task">
                <img src="../assets/img/delete.svg" alt="Delete" class="delete-edit-icon-technical-task">
                <span>Delete</span>
            </div>
            <div class="separator-technical-task"></div>
            <div class="delete-edit-container-technical-task">
                <img src="../assets/img/edit.svg" alt="Edit" class="delete-edit-icon-technical-task">
                <span>Edit</span>
            </div>
        </div>
        </div>

        
        

    </main>
  `;
}
