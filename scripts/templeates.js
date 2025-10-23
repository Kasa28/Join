function bigCardHtml(t){
  return `
   <div class="overall-contant">
    <header class="header-wrapper">
        <span class="label_user_story">User Story</span>
        <button class="close-btn">x</button>

    </header>
    <h1 class="h1-title">Kochwelt Page & Recipe Recommender</h1>
    <h3>Build start page with recipe recommendation.</h3>

    <main>
        <div class="date-input-wrapper">
            <p class="section-heading"><strong>Due date:</strong></p>
            <p class="task-date-display">10/05/2023</p>
        </div>

        <section class="task-input">
            <div class="priority-row">
                <p class="section-heading"><strong>Priority:</strong></p>
                <button type="button" class="priority-btn-medium" onclick="setPriority('medium')">Medium
                    <img class="addTask-icons" src="/addTask_code/icons_addTask/separatedAddTaskIcons/sum_icon.svg"
                        alt="sum icon">
                </button>
            </div>
        </section>

        <section class="task-input">
            <p class="section-heading"><strong>Asigned To:</strong></p>
        </section>

        <div class="assigned-users">
            <div class="user-badge">
                <span style="background-color: #FF7A00;">EM</span>
                <p>Emmanuel Mauer</p>
            </div>
            <div class="user-badge">
                <span style="background-color: #4589FF;">MB</span>
                <p>Marcel Bauer</p>
            </div>
            <div class="user-badge">
                <span style="background-color: #02B875;">AM</span>
                <p>Anton Mayer</p>
            </div>
        </div>


        <section class="task-input">
            <p class="section-heading"><strong>Subtasks</strong></p>
            <div>
                <label><input type="checkbox"> Implement Recipe Recommendation</label><br>
                <label><input type="checkbox"> Start Page Layout</label>
            </div>
        </section>

        <div class="action-buttons">
            <div class="action-btn">
                <img src="../assets/img/delete.svg" alt="Delete" class="action-icon">
                <span>Delete</span>
            </div>
            <div class="divider"></div>
            <div class="action-btn">
                <img src="../assets/img/edit.svg" alt="Edit" class="action-icon">
                <span>Edit</span>
            </div>
        </div>
    </main>
    </div>
  `;
}

function getAddTaskTemplate() {
  return `
<header class="header-wrapper">
  <h1>Add Task</h1>
  <button class="close-btn">x</button>
</header>

  <main>

    <section class="task-input">
      <label for="title">Title</label>
      <input type="text" id="title" class="task-title" name="title" placeholder="Enter a title">
    </section>

    <section class="task-input">
      <label for="description">Description</label>
      <p class="section-heading"><strong>Description</strong> (optional)</p>
      <textarea id="description" class="task-description" name="description"
        placeholder="Enter a description"></textarea>
    </section>

    <div class="date-input-wrapper">
      <p class="section-heading"><strong>Due date</strong></p>
      <div class="date-field">
        <input type="text" id="due-date" class="task-date" name="due-date" placeholder="dd/mm/yyyy"
          pattern="\d{2}/\d{2}/\d{4}" inputmode="numeric">
        <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/event.svg" alt="Event Icon" class="event-icon">
      </div>
    </div>

    <section class="task-input">
      <label>Priority</label>
      <p class="section-heading"><strong>Priority</strong></p>
      <div class="priority-group">
        <button type="button" class="priority-btn-urgent" onclick="setPriority('urgent')">Urgent
          <img class="addTask-icons" src="/addTask_code/icons_addTask/separatedAddTaskIcons/urgent_icon.svg" alt="urgent icon">
        </button>
        <button type="button" class="priority-btn-medium" onclick="setPriority('medium')">Medium
          <img class="addTask-icons" src="/addTask_code/icons_addTask/separatedAddTaskIcons/sum_icon.svg" alt="sum icon">
        </button>
        <button type="button" class="priority-btn-low" onclick="setPriority('low')">Low
          <img class="addTask-icons" src="/addTask_code/icons_addTask/separatedAddTaskIcons/low_icon.svg"
            alt="2 arrows in green showing up">
        </button>
      </div>
    </section>

    <section class="task-input">
      <label for="assign">Assign to</label>
      <p class="section-heading"><strong>Asigned to</strong> (optional)</p>
      <select id="assign" class="task-select" name="assign">
        <option value="">Select contact to assign</option>
      </select>
    </section>

    <section class="task-input">
      <label for="category">Category</label>
      <p class="section-heading"><strong>Category</strong></p>
      <select id="category" class="task-select" name="category">
        <option value="">Select task category</option>
      </select>
    </section>

    <section class="task-input">
      <label for="subtask">Subtasks</label>
      <p class="section-heading"><strong>Subtasks</strong> (optional)</p>
      <input type="text" id="subtask" class="task-subtask" name="subtask" placeholder="Add new subtask">
    </section>

  </main>
  <div class="btn-done-wrapper">
  <button class="btn-done btn-with-svg" onclick="createTask()">Create Task
    <img src="/addTask_code/icons_addTask/separatedAddTaskIcons/check.svg" alt="Check icon" class="check-icon">
  </button>
</div>`;
}
