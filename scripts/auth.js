// scripts/auth.js (Firebase v10 modular)
// Initializes Firebase App + Auth and exposes auth helpers globally.
//
// This file MUST ONLY do Auth-init. No contacts/tasks logic here.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Replace these with your real Firebase config values.
// This config is not a secret; security comes from Auth + Realtime DB Rules.
const firebaseConfig = {
    apiKey: "AIzaSyB4p7aUocctcQmfZDAxmylNeZGXbDAr9Mo",
    authDomain: "join-a3ae3.firebaseapp.com",
    databaseURL: "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-a3ae3",
    storageBucket: "join-a3ae3.firebasestorage.app",
    messagingSenderId: "814227162477",
    appId: "1:814227162477:web:01284ef25402b27fcf8664"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Expose Auth instance globally (your project uses window.*)
window.auth = auth;

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

// Helpers used by your login flow/buttons
window.signInAnonymously = async () => {
  const cred = await firebaseSignInAnonymously(auth);
  // Wait for state to be fully settled
  await window.authReady;
  return cred;
};

window.signOut = async () => {
  await firebaseSignOut(auth);
  return true;
};

// Optional debug helper (safe to keep)
window.getAuthState = () => {
  const u = auth.currentUser;
  return {
    uid: u?.uid ?? null,
    email: u?.email ?? null,
    isAnonymous: Boolean(u?.isAnonymous),
  };
};