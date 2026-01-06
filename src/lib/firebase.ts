// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAZDT5DM68-9qYH23HdKAsOTaV_qCAPEiw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "inee-admin.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "inee-admin",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "inee-admin.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "746757753608",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:746757753608:web:c63f0a8d2d60f10fefbabd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PH54SWBE8V",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Inicializar Analytics de forma segura
// Deshabilitado en localhost y cuando está siendo bloqueado para evitar errores en consola
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('localhost');
  
  // No inicializar Analytics en localhost o si está siendo bloqueado
  if (!isLocalhost) {
    isSupported()
      .then((supported) => {
        if (supported) {
          try {
            analytics = getAnalytics(app);
          } catch (error) {
            // Silenciar errores de Analytics (pueden ser bloqueados por extensiones)
            analytics = null;
          }
        }
      })
      .catch(() => {
        // Silenciar errores de soporte
        analytics = null;
      });
  }
}

export { analytics };