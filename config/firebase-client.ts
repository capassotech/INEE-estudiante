/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAZDT5DM68-9qYH23HdKAsOTaV_qCAPEiw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "inee-admin.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "inee-admin",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "inee-admin.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "746757753608",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:746757753608:web:c63f0a8d2d60f10fefbabd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PH54SWBE8V",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
