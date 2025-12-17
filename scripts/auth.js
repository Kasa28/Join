import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/**
 * Firebase configuration for this project.
 * @type {import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js").FirebaseOptions}
 */
const firebaseConfig = {
  apiKey: "AIzaSyB4p7aUocctcQmfZDAxmylNeZGXbDAr9Mo",
  authDomain: "join-a3ae3.firebaseapp.com",
  databaseURL: "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-a3ae3",
  storageBucket: "join-a3ae3.firebasestorage.app",
  messagingSenderId: "814227162477",
  appId: "1:814227162477:web:01284ef25402b27fcf8664"
};

/**
 * Initialized Firebase app instance.
 * @type {import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js").FirebaseApp}
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Auth instance.
 * @type {import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js").Auth}
 */
const auth = getAuth(app);

/**
 * Firebase Auth instance exposed globally.
 * @type {import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js").Auth}
 */
window.auth = auth;

/**
 * Promise that resolves when the initial auth state is known.
 * Resolves with the current user or null.
 * @type {Promise<import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js").User|null>}
 */
window.authReady = new Promise((resolve) => {
  let didResolve = false;
  onAuthStateChanged(auth, (user) => {
    window.currentUser = user || null;
    if (!didResolve) {
      didResolve = true;
      resolve(window.currentUser);
    }
  });
});

/**
 * Signs the user in anonymously and waits until auth state is settled.
 * @returns {Promise<import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js").UserCredential>}
 */
window.signInAnonymously = async () => {
  const cred = await firebaseSignInAnonymously(auth);
  await window.authReady;
  return cred;
};

/**
 * Signs the current user out.
 * @returns {Promise<boolean>} Resolves to true when sign-out is complete.
 */
window.signOut = async () => {
  await firebaseSignOut(auth);
  return true;
};

/**
 * Returns a snapshot of the current authentication state.
 * @returns {{uid: string|null, email: string|null, isAnonymous: boolean}}
 */
window.getAuthState = () => {
  const u = auth.currentUser;
  return {
    uid: u?.uid ?? null,
    email: u?.email ?? null,
    isAnonymous: Boolean(u?.isAnonymous),
  };
};
