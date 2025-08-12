import axios from "axios";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "../../config/firebase-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
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
  return config;
});

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  aceptaTerminos: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    uid: string;
    email: string;
    nombre: string;
    apellido: string;
    role: string;
  };
  customToken?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  role: string;
  fechaRegistro: string;
  aceptaTerminos: boolean;
}

class AuthService {
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/register", userData);

      if (response.data.customToken) {
        await signInWithCustomToken(auth, response.data.customToken);
      }

      if (response.data.user) {
        const studentData = {
          uid: response.data.user.uid,
          email: response.data.user.email,
          nombre: response.data.user.nombre,
          apellido: response.data.user.apellido,
          role: response.data.user.role,
          registrationTime: new Date().toISOString(),
        };

        localStorage.setItem("studentData", JSON.stringify(studentData));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || "Error en el registro");
      }
      throw new Error("Error de conexión. Verifica tu conexión a internet.");
    }
  }

  // Iniciar sesión
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.customToken) {
        await signInWithCustomToken(auth, response.data.customToken);
      }

      if (response.data.user) {
        const studentData = {
          uid: response.data.user.uid,
          email: response.data.user.email,
          nombre: response.data.user.nombre,
          apellido: response.data.user.apellido,
          role: response.data.user.role,
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem("studentData", JSON.stringify(studentData));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || "Error en el login");
      }
      throw new Error("Error de conexión. Verifica tu conexión a internet.");
    }
  }

  // Obtener perfil del usuario
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await this.logout();
        throw new Error(
          "Sesión expirada. Por favor, inicia sesión nuevamente."
        );
      }
      throw new Error(
        error.response?.data?.error || "Error al obtener el perfil"
      );
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem("studentData");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  async getToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  getStudentDataFromStorage(): any {
    try {
      const studentData = localStorage.getItem("studentData");
      return studentData ? JSON.parse(studentData) : null;
    } catch (error) {
      console.error("Error al obtener datos del estudiante:", error);
      return null;
    }
  }

  updateStudentDataInStorage(data: any): void {
    try {
      const existingData = this.getStudentDataFromStorage();
      const updatedData = { ...existingData, ...data };
      localStorage.setItem("studentData", JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error al actualizar datos del estudiante:", error);
    }
  }
}

const authService = new AuthService();
export default authService;
