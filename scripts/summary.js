window.addEventListener("DOMContentLoaded", () => {
    updateSummary();
  });
  
  /**
   * Lädt Tasks aus localStorage (oder Demo-Fallback)
   * @returns {Array} Array von Task-Objekten
   */
  function loadTasks() {
    try {
      const data = JSON.parse(localStorage.getItem("tasks") || "[]");
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.warn("Could not load tasks:", e);
    }
    return [];
  }

  function getTaskCounts(tasks) {
    const counts = {
      total: tasks.length,
      urgent: 0,
      todo: 0,
      inProgress: 0,
      feedback: 0,
      done: 0,
    };
  
    const today = new Date();
  
    for (const t of tasks) {
      const prio = String(t.priority || "").toLowerCase();
      if (prio === "urgent") counts.urgent++;
  
      switch (t.status) {
        case "todo":
          counts.todo++;
          break;
        case "in-progress":
          counts.inProgress++;
          break;
        case "await-feedback":
          counts.feedback++;
          break;
        case "done":
          counts.done++;
          break;
      }
    }
  
    return counts;
  }

  function setSummaryText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }
  
  /**
   * Findet das nächste Fälligkeitsdatum einer "urgent" Aufgabe
   */
  function getNextDeadline(tasks) {
    const urgentTasks = tasks
      .filter((t) => String(t.priority || "").toLowerCase() === "urgent" && t.dueDate)
      .map((t) => {
        // Format 13/12/2024 → 2024-12-13
        const [day, month, year] = t.dueDate.split("/");
        return new Date(`${year}-${month}-${day}`);
      })
      .filter((d) => !isNaN(d.getTime()));
  
    if (!urgentTasks.length) return null;
  
    urgentTasks.sort((a, b) => a - b);
    return urgentTasks[0];
  }
  
  function updateSummary() {
    const tasks = loadTasks();
    const counts = getTaskCounts(tasks);
    const nextDeadline = getNextDeadline(tasks);
  
    // Update Zahlen in den Cards
    // 1. Urgent
    setSummaryText(
      ".summary-card-up-left .h2-font-summray",
      counts.urgent
    );
  
    // 2. Task in Board
    setSummaryText(
      ".summary-card-conainer-up-right .h2-font-summray",
      counts.total
    );
  
    // 3. Todo
    setSummaryText(
      ".summary-section-2-order .summary-card:nth-child(1) .h2-font-summray",
      counts.todo
    );
  
    // 4. In Progress
    setSummaryText(
      ".summary-section-2-order .summary-card:nth-child(2) .h2-font-summray",
      counts.inProgress
    );
  
    // 5. Feedback
    setSummaryText(
      ".summary-section-2-order .summary-card:nth-child(3) .h2-font-summray",
      counts.feedback
    );
  
    // 6. Done
    setSummaryText(
      ".summary-section-2-order .summary-card:nth-child(4) .h2-font-summray",
      counts.done
    );
  
    // Deadline anzeigen
    const deadlineEl = document.querySelector(".date-font-summary");
    if (deadlineEl) {
      if (nextDeadline) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        deadlineEl.textContent = nextDeadline.toLocaleDateString("en-US", options);
      } else {
        deadlineEl.textContent = "No urgent deadlines";
      }
    }
  
    console.log("Summary updated:", counts);
  }
  
  /**
   * Optional: Aktualisierung triggern, wenn im localStorage Änderungen auftreten.
   */
  window.addEventListener("storage", (event) => {
    if (event.key === "tasks") {
      updateSummary();
    }
  });
