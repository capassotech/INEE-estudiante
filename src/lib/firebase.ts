// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Validar que todas las variables de entorno requeridas estén definidas
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => {
    // Convertir camelCase a UPPER_SNAKE_CASE
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
    return `VITE_FIREBASE_${snakeKey}`;
  });

if (missingVars.length > 0) {
  throw new Error(
    `❌ Firebase: Faltan variables de entorno requeridas:\n${missingVars.join('\n')}\n\n` +
    `Por favor, configura estas variables en tu plataforma de despliegue (Vercel, Netlify, etc.) ` +
    `o en tu archivo .env local.`
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Opcional
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