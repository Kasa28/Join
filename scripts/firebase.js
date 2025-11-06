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

/** 🔄 Echtzeit-Listener für Firebase Realtime Database (REST Streaming) */
function subscribeToFirebaseUpdates(callback) {
  const url = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

  // Verbindung zur Firebase Realtime-Datenbank (REST-Stream)
  const eventSource = new EventSource(`${url}?ns=join-a3ae3-default-rtdb`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data) callback(data);
    } catch (err) {
      console.error("⚠️ Fehler beim Parsen des Firebase-Events:", err);
    }
  };

  eventSource.onerror = (err) => {
    console.warn("🔁 Realtime-Verbindung verloren – reconnecting...", err);
    eventSource.close();
    setTimeout(() => subscribeToFirebaseUpdates(callback), 3000);
  };
}

window.subscribeToFirebaseUpdates = subscribeToFirebaseUpdates;

window.saveTask = saveTask;
window.getAllTasks = getAllTasks;
window.deleteTask = deleteTask;