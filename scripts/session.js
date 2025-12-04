/* === session.js | Auth-backed session helpers without localStorage === */

window.FIREBASE_DB_URL = "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/";
window.sessionUser = window.sessionUser || null;

async function fetchSessionProfile(uid) {
  const res = await fetch(`${window.FIREBASE_DB_URL}sessions/${uid}.json`);
  if (!res.ok) {
    console.warn("Could not load session profile", res.status);
    return null;
  }
  return (await res.json()) || null;
}

async function writeSessionProfile(uid, profile) {
  await fetch(`${window.FIREBASE_DB_URL}sessions/${uid}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile || null),
  });
}

window.sessionReady = (async () => {
  await window.authReady;
  if (!window.currentUser) {
    return null;
  }
  window.sessionUser = await fetchSessionProfile(window.currentUser.uid);
  return window.sessionUser;
})();

window.saveSessionUser = async (profile) => {
  await window.authReady;
  if (!window.currentUser) {
    await window.signInAnonymously();
  }
  const uid = window.currentUser?.uid;
  if (!uid) return null;
  window.sessionUser = profile || null;
  await writeSessionProfile(uid, profile || null);
  return window.sessionUser;
};

window.requireSessionUser = async () => {
  const existing = await window.sessionReady;
  if (existing) return existing;
  return window.sessionUser;
};

window.clearSessionUser = async () => {
  await window.authReady;
  const uid = window.currentUser?.uid;
  window.sessionUser = null;
  if (uid) {
    await fetch(`${window.FIREBASE_DB_URL}sessions/${uid}.json`, { method: "DELETE" });
  }
  await window.signOut();
};

window.getSessionSnapshot = () => window.sessionUser || {};