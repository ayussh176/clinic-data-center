import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDaz4ZRPd-YhxAy_SzJt5Wp2a3wJSCHXII",
  authDomain: "patiententry-96229.firebaseapp.com",
  projectId: "patiententry-96229",
  storageBucket: "patiententry-96229.appspot.com",
  messagingSenderId: "88662834579",
  appId: "1:88662834579:web:c04d6c277a768fef3c7c66"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };
