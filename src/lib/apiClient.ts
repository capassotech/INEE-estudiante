import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { auth } from "../../config/firebase-client";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://inee-backend.onrender.com";

export type SessionExpiredHandler = () => void | Promise<void>;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let isHandlingSessionExpiry = false;

/** Endpoints de autenticación donde un 401 es esperado (credenciales inválidas, etc.). */
const AUTH_FLOW_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/link-google",
  "/auth/link-password",
  "/auth/validate-token",
  "/auth/check-email",
  "/auth/forgot-password",
];

const PUBLIC_APP_PATHS = ["/login", "/registro", "/recuperar-contrasena"];

export function registerSessionExpiredHandler(handler: SessionExpiredHandler) {
  sessionExpiredHandler = handler;
}

function shouldHandleSessionExpiry(config?: InternalAxiosRequestConfig): boolean {
  if (!config?.url) {
    return true;
  }

  const url = config.url;

  if (AUTH_FLOW_PATHS.some((path) => url.includes(path))) {
    return false;
  }

  if (PUBLIC_APP_PATHS.includes(window.location.pathname)) {
    return false;
  }

  return true;
}

async function handleUnauthorized(config?: InternalAxiosRequestConfig) {
  if (
    isHandlingSessionExpiry ||
    !sessionExpiredHandler ||
    !shouldHandleSessionExpiry(config)
  ) {
    return;
  }

  isHandlingSessionExpiry = true;

  try {
    await sessionExpiredHandler();
  } catch (error) {
    console.error("Error al manejar expiración de sesión:", error);
  } finally {
    window.setTimeout(() => {
      isHandlingSessionExpiry = false;
    }, 1000);
  }
}

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.error("Error getting ID token:", error);
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await handleUnauthorized(error.config);
    }

    return Promise.reject(error);
  }
);

/** Cliente sin interceptor de sesión para endpoints públicos. */
export const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});
