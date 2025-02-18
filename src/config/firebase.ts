import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7xUA0AUCqVn-0g4vPe8PUxZ1ph8IDii8",
  authDomain: "hostel-management-system-d56e6.firebaseapp.com",
  projectId: "hostel-management-system-d56e6",
  storageBucket: "hostel-management-system-d56e6.firebasestorage.app",
  messagingSenderId: "1086396268013",
  appId: "1:1086396268013:web:c9dea887979af020133be4",
  measurementId: "G-WWTS8WN2ZQ",
};

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
