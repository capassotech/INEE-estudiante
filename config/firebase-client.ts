/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

const firebaseConfig = environment === "qa" ? firebaseConfigQA : firebaseConfigProd;

// Permitir override con variables de entorno si están definidas
const firebaseConfigFinal = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
};

const app = initializeApp(firebaseConfigFinal);

export const auth = getAuth(app);
export default app;
