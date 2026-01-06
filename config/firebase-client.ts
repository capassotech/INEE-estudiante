/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
