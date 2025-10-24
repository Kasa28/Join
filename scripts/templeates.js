function bigCardHtml(t){
  return `
    <header class="header-wrapper-addTask_template">
  <h1 class="h1-addTask_template">Add Task</h1>
  <button class="close-btn-addTask_template">x</button>
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
    </section>

    <section>
      <label for="category" class="label-addTask_template">Category</label>
      <p class="section-heading-addTask_template"><strong>Category</strong></p>
      <select id="category" class="task-select-addTask_template" name="category">
        <option value="">Select task category</option>
      </select>
    </section>

    <section>
      <label for="subtask" class="label-addTask_template">Subtasks</label>
      <p class="section-heading-addTask_template"><strong>Subtasks</strong> (optional)</p>
      <input type="text" id="subtask" class="task-subtask-addTask_template" name="subtask" placeholder="Add new subtask">
    </section>

  </main>
  <div class="btn-done-wrapper-addTask_template">
  <button class="btn-done-addTask_template btn-with-svg-addTask_template" onclick="createTask()">Create Task
    <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/check.svg" alt="Check icon" class="check-icon-addTask_template">
  </button>
</div>
  `;
}

function getAddTaskTemplate() {
  return `
  <div class="div-test">
   <header class="header-wrapper-addTask_template">
  <h1 class="h1-addTask_template">Add Task</h1>
  <button class="close-btn-addTask_template">x</button>
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
    </section>

    <section>
      <label for="category" class="label-addTask_template">Category</label>
      <p class="section-heading-addTask_template"><strong>Category</strong></p>
      <select id="category" class="task-select-addTask_template" name="category">
        <option value="">Select task category</option>
      </select>
    </section>

    <section>
      <label for="subtask" class="label-addTask_template">Subtasks</label>
      <p class="section-heading-addTask_template"><strong>Subtasks</strong> (optional)</p>
      <input type="text" id="subtask" class="task-subtask-addTask_template" name="subtask" placeholder="Add new subtask">
    </section>

  </main>
  <div class="btn-done-wrapper-addTask_template">
  <button class="btn-done-addTask_template btn-with-svg-addTask_template" onclick="createTask()">Create Task
    <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/check.svg" alt="Check icon" class="check-icon-addTask_template">
  </button>
   </div>
     </div>
   `;
}
