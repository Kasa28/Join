/* === summary.js | Handles dashboard summary data, task counts, and deadlines === */

window.addEventListener("DOMContentLoaded", () => {
  updateSummary();
});


/* === Load Tasks from Firebase === */
async function loadTasks() {
  try {
    const response = await fetch(
      "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks.json"
    );
    const data = await response.json();
    const firebaseTasks = Array.isArray(data)
      ? data.filter(Boolean)
      : data
      ? Object.values(data)
      : [];
    firebaseTasks.forEach((t) => {
      if (t && typeof t.priority === "string") {
        t.priority = t.priority.toLowerCase();
      }
    });
    return firebaseTasks.length
      ? firebaseTasks
      : [
          {
            id: 1,
            title: "Demo Task",
            status: "todo",
            priority: "urgent",
            dueDate: "02/09/2023",
          },
        ];
  } catch (error) {
    console.error("Fehler beim Laden der Tasks aus Firebase:", error);
    return [];
  }
}


/* === Calculate Task Counts by Status and Priority === */
function getTaskCounts(tasks) {
  const counts = {
    total: tasks.length,
    urgent: 0,
    todo: 0,
    inProgress: 0,
    feedback: 0,
    done: 0,
  };
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


/* === Determine Next Urgent Deadline === */
function getNextDeadline(tasks) {
  const urgentTasks = tasks
    .filter(
      (t) => String(t.priority || "").toLowerCase() === "urgent" && t.dueDate
    )
    .map((t) => {
      const [day, month, year] = t.dueDate.split("/");
      return new Date(`${year}-${month}-${day}`);
    })
    .filter((d) => !isNaN(d.getTime()));
  if (!urgentTasks.length) return null;
  urgentTasks.sort((a, b) => a - b);
  return urgentTasks[0];
}


/* === Update Summary Text Helper === */
function setSummaryText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}


/* === Main Summary Update Function === */
async function updateSummary() {
  const tasks = await loadTasks();
  const counts = getTaskCounts(tasks);
  const nextDeadline = getNextDeadline(tasks);
  setSummaryText(".urgent-task-card-summary .h2-font-summray", counts.urgent);
  setSummaryText(".tasks-on-board-card-summary .h2-font-summray", counts.total);
  setSummaryText(
    ".summary-section-2-order .summary-card:nth-child(1) .h2-font-summray",
    counts.todo
  );
  setSummaryText(
    ".summary-section-2-order .summary-card:nth-child(2) .h2-font-summray",
    counts.inProgress
  );
  setSummaryText(
    ".summary-section-2-order .summary-card:nth-child(3) .h2-font-summray",
    counts.feedback
  );
  setSummaryText(
    ".summary-section-2-order .summary-card:nth-child(4) .h2-font-summray",
    counts.done
  );
  const deadlineEl = document.querySelector(".date-font-summary");
  if (deadlineEl) {
    if (nextDeadline) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      deadlineEl.textContent = nextDeadline.toLocaleDateString(
        "en-US",
        options
      );
    } else {
      deadlineEl.textContent = "No urgent deadlines";
    }
  }
  console.log("Summary updated:", counts);
}

let lastDataString = "";


/* === Polling for Firebase Updates === */
async function pollSummary() {
  try {
    const res = await fetch(
      "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks.json"
    );
    const data = await res.json();
    const json = JSON.stringify(data);
    if (json !== lastDataString) {
      lastDataString = json;
      await updateSummary();
    }
  } catch (err) {
    console.warn("Polling error (summary):", err);
  }
}


pollSummary();
setInterval(pollSummary, 3000);
