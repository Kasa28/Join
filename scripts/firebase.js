import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyB4p7aUocctcQmfZDAxmylNeZGXbDAr9Mo",
  authDomain: "join-a3ae3.firebaseapp.com",
  databaseURL: "https://join-a3ae3-default-rtdb.europe-west1.firebasedatabase.app/",


  projectId: "join-a3ae3",
  storageBucket: "join-a3ae3.firebasestorage.app",
  messagingSenderId: "814227162477",
  appId: "1:814227162477:web:01284ef25402b27fcf8664"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


const testRef = ref(db, "/");
onValue(testRef, (snapshot) => {
  console.log("🔥 Firebase verbunden!");
  console.log("Daten aus der Datenbank:", snapshot.val());
});
