window.addEventListener("DOMContentLoaded", () => {
    updateSummary();
  });
  
  /**
   * Lädt Tasks aus localStorage (oder Demo-Fallback)
   * @returns {Array} Array von Task-Objekten
   */
  /*function loadTasks() {
    try {
      const data = JSON.parse(localStorage.getItem("tasks") || "[]");
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.warn("Could not load tasks:", e);
    }
    return [];
  }*/

    async function loadTasks() {
      try {
        const response = await fetch("https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
        const data = await response.json();
        const firebaseTasks = data ? Object.values(data) : [];
    
        // 👉 Demo-Tasks beibehalten, falls du sie in der Summary weiterhin sehen willst
        const demoTasks = [
          {
            id: 1,
            title: "Kochwelt Page & Recipe Recommender",
            description: "Build start page with recipe recommendation...",
            type: "User Story",
            status: "in-progress",
            dueDate: "10/05/2023",
            priority: "medium",
            subtasksDone: 1,
            subtasksTotal: 2,
          },
          {
            id: 2,
            title: "CSS Architecture Planning",
            description: "Define CSS naming conventions and structure.",
            type: "Technical Task",
            status: "await-feedback",
            dueDate: "02/09/2023",
            priority: "urgent",
            subtasksDone: 2,
            subtasksTotal: 2,
          },
        ];
    
        // 🧩 Kombiniere Demo + Firebase-Tasks
        const allTasks = [...demoTasks, ...firebaseTasks];
    
        // 🧠 Repariere evtl. falsche Prioritätspfade aus Firebase
        allTasks.forEach((t) => {
          if (t.priority === "urgent") t.priority = "urgent";
          if (t.priority === "medium") t.priority = "medium";
          if (t.priority === "low") t.priority = "low";
        });
    
        return allTasks;
      } catch (error) {
        console.error("Fehler beim Laden der Tasks aus Firebase:", error);
        return [];
      }
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
  
  async function updateSummary() {
    const tasks = await loadTasks();
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
  /*window.addEventListener("storage", (event) => {
    if (event.key === "tasks") {
      updateSummary();
    }
  });
  */
