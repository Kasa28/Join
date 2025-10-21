function bigCardHtml(t){
  return `
    <header class="header-wrapper">
      <span class="label_user_story">User Story</span>
      <button class="close-btn" onclick="closeModal()">x</button>
    </header>

    <h1 class="title">${t.title}</h1>
    <h3>${t.description}</h3>

    <main>
      <div class="date-input-wrapper">
        <p class="section-heading"><strong>Due date:</strong> ${t.dueDate}</p>
      </div>

      <section class="task-input">
      <p class="section-heading">
      <strong>Priority:</strong>
      <span class="priority-value">Medium</span>
     <img class="priority-icon"
         src="../addTask_code/icons_addTask/separatedAddTaskIcons/3_striche.svg"
         alt="priority icon">
      </p>
     </section>


      <section class="task-input">
        <p class="section-heading"><strong>Assigned to</strong> (optional)</p>
        <select class="task-select"><option value="">Select contact to assign</option></select>
      </section>

      <section class="task-input">
        <p class="section-heading"><strong>Category</strong></p>
        <select class="task-select"><option value="">Select task category</option></select>
      </section>

      <section class="task-input">
        <p class="section-heading"><strong>Subtasks</strong> (optional)</p>
        <input type="text" class="task-subtask" placeholder="Add new subtask">
      </section>
    </main>

    <div class="btn-done-wrapper">
      <button class="btn-done">Create Task</button>
    </div>
  `;
}
