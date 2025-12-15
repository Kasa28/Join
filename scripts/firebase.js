/* === Base URL Configuration === */
const BASE_URL =
  "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";

// Expose for non-module scripts that rely on global variables
window.BASE_URL = BASE_URL;

const GUEST_EXAMPLE_CONTACTS = [
  {
    username: "Peter",
    email: "peter-lustig@hotmail.de",
    PhoneNumber: "+491517866563",
    color: "pink",
  },
  {
    username: "Karsten",
    email: "karsten-stahl@gmail.de",
    PhoneNumber: "+49151478632475",
    color: "orange",
  },
  {
    username: "Thomas",
    email: "thomas-gottschalck@live.de",
    PhoneNumber: "+491517896455",
    color: "green",
  },
  {
    username: "Rainer",
    email: "rainer-winkler@gmail.de",
    PhoneNumber: "+491507489652",
    color: "blue",
  },
  {
    username: "Angela",
    email: "angela-merkel@gmail.de",
    PhoneNumber: "+491511462385",
    color: "red",
  },
  {
    username: "Kai",
    email: "kai-pflaume@live.de",
    PhoneNumber: "+491504896257",
    color: "brown",
  },
  {
    username: "Til",
    email: "til-schweiger@gmail.de",
    PhoneNumber: "+491514563248",
    color: "orange",
  },
  {
    username: "Günther",
    email: "günther-jauch@gmail.de",
    PhoneNumber: "+4915157652244",
    color: "blue",
  },
  {
    username: "Simon",
    email: "simon-krätschmer@gmail.de",
    PhoneNumber: "+491504621354",
    color: "red",
  },
];

const CONTACT_COLORS = [
  "red",
  "blue",
  "green",
  "brown",
  "purple",
  "turquoise",
  "orange",
  "black",
  "pink",
];

// Make guest demo contacts available globally for legacy scripts
window.GUEST_EXAMPLE_CONTACTS = GUEST_EXAMPLE_CONTACTS;

function sanitizeBaseUrl(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function getTaskAuthQuery() {
  if (window.authReady) await window.authReady;
  const token = await window.auth?.currentUser?.getIdToken?.();
  return token ? `?auth=${encodeURIComponent(token)}` : "";
}

async function fetchTasksApi(path, options) {
  const base = sanitizeBaseUrl(window.BASE_URL || BASE_URL);
  const authQuery = await getTaskAuthQuery();
  const url = `${base}/${path}.json${authQuery}`;
  return fetch(url, options);
}

async function getAuthQuery() {
  if (window.authReady) await window.authReady;
  const token = await window.auth?.currentUser?.getIdToken?.();
  return token ? `?auth=${encodeURIComponent(token)}` : "";
}

async function fetchRtdbApi(path, options) {
  const base = sanitizeBaseUrl(window.BASE_URL || BASE_URL);
  const authQuery = await getAuthQuery();
  const url = `${base}/${path}.json${authQuery}`;
  return fetch(url, options);
}

/* === Fetch All Tasks === */
async function getAllTasks() {
  const response = await fetchTasksApi("tasks");
  return (await response.json()) || {};
}

/* === Save Task by ID (PUT Request) === */
async function saveTask(taskId, taskData) {
  const response = await fetchTasksApi(`tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  return await response.json();
}

/* === Delete Task by ID === */
async function deleteTask(taskId) {
  await fetchTasksApi(`tasks/${taskId}`, { method: "DELETE" });
}
/* === Auth-aware Friends (Contacts) API === */

/**
 * Returns the Firebase Auth uid for the currently signed-in user.
 * @returns {string}
 */
function getCurrentUidOrThrow() {
  const auth = window.auth;
  if (!auth || !auth.currentUser || !auth.currentUser.uid) {
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
  const response = await fetchRtdbApi(`users/${uid}/friends`);
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
  await fetchRtdbApi(`users/${uid}/friends`, {
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

async function loadContactsForActiveUser() {
  if (window.authReady) await window.authReady;
  const user = window.currentUser;
  if (!user) return [];
  if (user.isAnonymous) {
    return await ensureGuestFriendsSeeded();
  }
  let contacts = (await getFriendsForCurrentUser()) || [];
return contacts;
}

async function persistContactsForActiveUser(contacts) {
  if (window.authReady) await window.authReady;
  if (!window.currentUser) return;
  if (window.currentUser.isAnonymous) {
    const sorted = (Array.isArray(contacts) ? contacts : [])
      .filter(Boolean)
      .slice()
      .sort((a, b) => {
        const aKey = (a?.username || a?.name || a?.email || "").toString();
        const bKey = (b?.username || b?.name || b?.email || "").toString();
        return aKey.localeCompare(bKey, "de", { sensitivity: "base" });
      });

    await updateUserFriendslistByUid(window.currentUser.uid, sorted);
    return;
  }
  await updateFriendsForCurrentUser(contacts);
}

async function loadCurrentUserProfile() {
  if (window.authReady) await window.authReady;
  const user = window.currentUser;
  if (!user || user.isAnonymous) return null;
  const response = await fetchRtdbApi(`users/${user.uid}/profile`);
  const data = (await response.json()) || null;
  return data;
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

async function ensureGuestFriendsSeeded() {
  if (window.authReady) await window.authReady;
  const user = window.currentUser;
  if (!user || !user.isAnonymous) return [];

  const existing = await getUserFriendslistByUid(user.uid);
  if (Array.isArray(existing) && existing.length > 0) return existing;

  await updateUserFriendslistByUid(user.uid, GUEST_EXAMPLE_CONTACTS);
  return [...GUEST_EXAMPLE_CONTACTS];
}

// Expose frequently used helpers for legacy (non-module) scripts
Object.assign(window, {
  getAllTasks,
  saveTask,
  deleteTask,
  getUserFriendslistByUid,
  getFriendsForCurrentUser,
  updateUserFriendslistByUid,
  updateFriendsForCurrentUser,
  loadContactsForActiveUser,
  persistContactsForActiveUser,
  loadCurrentUserProfile,
  seedDemoFriendsIfEmpty,
  isGuestUser: () => Boolean(window.currentUser?.isAnonymous),
  isRegisteredUser: () =>
    Boolean(window.currentUser && !window.currentUser.isAnonymous),
});
