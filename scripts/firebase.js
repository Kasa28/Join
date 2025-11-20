/* === firebase.js | Handles Firebase Realtime Database communication === */

/* === Base URL Configuration === */
const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";

/* === Fetch All Tasks === */
/**
 * Retrieves all tasks stored in the Firebase Realtime Database.
 * @returns {Promise<Object>} An object containing all tasks keyed by their IDs.
 */
async function getAllTasks() {
  const response = await fetch(`${BASE_URL}tasks.json`);
  return await response.json() || {};
}


/* === Save Task by ID (PUT Request) === */
/**
 * Saves or overwrites a task in Firebase under the given task ID.
 * @param {string} taskId - The ID under which the task will be stored.
 * @param {Object} taskData - The task data object to save.
 * @returns {Promise<Object>} The saved task data returned by Firebase.
 */
async function saveTask(taskId, taskData) {
  const response = await fetch(`${BASE_URL}tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  return await response.json();
}


/* === Delete Task by ID === */
/**
 * Deletes a task from Firebase by its task ID.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  await fetch(`${BASE_URL}tasks/${taskId}.json`, { method: "DELETE" });
}


/* === Firebase Realtime Polling (Pseudo-Streaming) === */
/**
 * Subscribes to Firebase task updates using periodic polling.
 * Calls the provided callback with the latest task data every 2 seconds.
 * @param {Function} callback - Function executed with the updated task dataset.
 */
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