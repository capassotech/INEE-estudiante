// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Configuraciones por entorno
const firebaseConfigQA = {
  apiKey: "AIzaSyC0mx89rSeedrdTtpyqrlhS7FAIejCrIWM",
  authDomain: "inee-qa.firebaseapp.com",
  projectId: "inee-qa",
  storageBucket: "inee-qa.firebasestorage.app",
  messagingSenderId: "405703677594",
  appId: "1:405703677594:web:6928b7d21f233ad7b67123",
  measurementId: "G-2YGRGW2HJX",
};

const firebaseConfigProd = {
  apiKey: "AIzaSyAZDT5DM68-9qYH23HdKAsOTaV_qCAPEiw",
  authDomain: "inee-admin.firebaseapp.com",
  projectId: "inee-admin",
  storageBucket: "inee-admin.firebasestorage.app",
  messagingSenderId: "746757753608",
  appId: "1:746757753608:web:c63f0a8d2d60f10fefbabd",
  measurementId: "G-PH54SWBE8V",
};

// Detectar entorno: usa variable de entorno o fallback a variables de entorno personalizadas
const environment = import.meta.env.VITE_ENVIRONMENT || 
                    (import.meta.env.VITE_FIREBASE_PROJECT_ID === "inee-qa" ? "qa" : "prod");

const firebaseConfigBase = environment === "qa" ? firebaseConfigQA : firebaseConfigProd;

// Permitir override con variables de entorno si están definidas
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigBase.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigBase.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigBase.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigBase.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigBase.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigBase.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigBase.measurementId,
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