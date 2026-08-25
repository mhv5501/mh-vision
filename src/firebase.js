import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDb6GFKQS3MK7TkAFeldhERGYLd1bUlFfc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mhvision-22110.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mhvision-22110",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mhvision-22110.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "542275411420",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:542275411420:web:4748baf27994783dc70319",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WZMXKJQ7W9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
