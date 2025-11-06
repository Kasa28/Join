const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";

/** Holt alle Tasks */
async function getAllTasks() {
  const response = await fetch(`${BASE_URL}tasks.json`);
  return await response.json() || {};
}

/** Speichert einen Task mit einer ID (PUT) */
async function saveTask(taskId, taskData) {
  const response = await fetch(`${BASE_URL}tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  return await response.json();
}

/** Löscht einen Task */
async function deleteTask(taskId) {
  await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
}

window.saveTask = saveTask;
window.getAllTasks = getAllTasks;
window.deleteTask = deleteTask;