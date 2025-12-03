/* === Base URL Configuration === */
const BASE_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";


/* === Fetch All Tasks === */
async function getAllTasks() {
  const response = await fetch(`${BASE_URL}tasks.json`);
  return (await response.json()) || {};
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

/* === Auth-aware Friends (Contacts) API === */

/**
 * Returns the Firebase Auth uid for the currently signed-in user.
 * @returns {string}
 */
function getCurrentUidOrThrow() {
  if (
    typeof auth === "undefined" ||
    !auth.currentUser ||
    !auth.currentUser.uid
  ) {
    throw new Error("No authenticated user (uid missing)");
  }
  return auth.currentUser.uid;
}

/**
 * Loads the friends/contacts list for the given uid from Realtime DB.
 * Path: /users/{uid}/friends
 * Normalizes array vs object-map to an array.
 * @param {string} uid
 * @returns {Promise<Array<Object>>}
 */
async function getUserFriendslistByUid(uid) {
  const response = await fetch(`${BASE_URL}users/${uid}/friends.json`);
  const data = (await response.json()) || null;
  if (Array.isArray(data)) return data.filter(Boolean);
  if (data && typeof data === "object")
    return Object.values(data).filter(Boolean);
  return [];
}

/**
 * Convenience: loads friends for the currently signed-in user.
 * @returns {Promise<Array<Object>>}
 */
async function getFriendsForCurrentUser() {
  if (window.authReady) await window.authReady;
  const uid = getCurrentUidOrThrow();
  return await getUserFriendslistByUid(uid);
}

/**
 * Overwrites the friends/contacts list for the given uid in Realtime DB.
 * Path: /users/{uid}/friends
 * @param {string} uid
 * @param {Array<Object>} friends
 * @returns {Promise<void>}
 */
async function updateUserFriendslistByUid(uid, friends) {
  await fetch(`${BASE_URL}users/${uid}/friends.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Array.isArray(friends) ? friends : []),
  });
}

/**
 * Convenience: overwrites friends for the currently signed-in user.
 * @param {Array<Object>} friends
 * @returns {Promise<void>}
 */
async function updateFriendsForCurrentUser(friends) {
  const uid = getCurrentUidOrThrow();
  await updateUserFriendslistByUid(uid, friends);
}

/**
 * Optional helper: seed demo contacts for new anonymous users.
 * Returns the resulting friends list.
 * @param {Array<Object>} exampleContacts
 * @returns {Promise<Array<Object>>}
 */
async function seedDemoFriendsIfEmpty(exampleContacts) {
  const uid = getCurrentUidOrThrow();
  const existing = await getUserFriendslistByUid(uid);
  if (existing.length === 0) {
    await updateUserFriendslistByUid(uid, exampleContacts);
    return exampleContacts;
  }
  return existing;
}

/* === Expose API globally (no import tooling) === */
window.BASE_URL = BASE_URL;
window.saveTask = saveTask;
window.getAllTasks = getAllTasks;
window.deleteTask = deleteTask;

window.getFriendsForCurrentUser = getFriendsForCurrentUser;
window.updateFriendsForCurrentUser = updateFriendsForCurrentUser;
window.seedDemoFriendsIfEmpty = seedDemoFriendsIfEmpty;
