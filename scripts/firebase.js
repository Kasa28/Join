/* === firebase.js | Handles Firebase Realtime Database communication === */

/* === Base URL Configuration === */
const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";

/* === Fetch All Tasks === */
async function getAllTasks() {
  const response = await fetch(`${BASE_URL}tasks.json`);
  return await response.json() || {};
}

/* === Save Task by ID (PUT Request) === */
async function saveTask(taskId, taskData) {
  const response = await fetch(`${BASE_URL}tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  return await response.json();
}

/* === Delete Task by ID === */
async function deleteTask(taskId) {
  await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
}


/* === Firebase Realtime Polling (Pseudo-Streaming) === */
function subscribeToFirebaseUpdates(callback) {
  async function poll() {
    try {
      const res = await fetch("https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
      const data = await res.json();
      if (data) callback(data);
    } catch (err) {
      console.warn("Polling error:", err);
    }
  }
  poll();
  setInterval(poll, 2000);
}

window.subscribeToFirebaseUpdates = subscribeToFirebaseUpdates;

window.saveTask = saveTask;
window.getAllTasks = getAllTasks;
window.deleteTask = deleteTask;