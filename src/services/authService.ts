import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithCustomToken, signOut, signInWithPopup, sendPasswordResetEmail, confirmPasswordReset } from "firebase/auth";
import { auth } from "../../config/firebase-client";
import { RegisterData, LoginData, AuthResponse, UserProfile } from "../types/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://inee-backend.onrender.com";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

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

class AuthService {
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      localStorage.removeItem("studentData");
      
      const response = await api.post("/auth/register", userData);

      if (response.data.customToken) {
        await signInWithCustomToken(auth, response.data.customToken);
        
        let retries = 0;
        while (!auth.currentUser && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        if (auth.currentUser) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (auth.currentUser) {
        try {
          const currentUid = auth.currentUser.uid;
          const profile = await this.getProfile(currentUid);
          
          if (profile.uid !== currentUid) {
            console.error("Error: El perfil obtenido no corresponde al usuario actual");
            await this.logout();
            throw new Error("Error de autenticación: perfil no coincide");
          }
          
          const studentData = {
            uid: profile.uid,
            email: profile.email,
            nombre: profile.nombre,
            apellido: profile.apellido,
            role: profile.role || "student",
            registrationTime: new Date().toISOString(),
          };
          localStorage.setItem("studentData", JSON.stringify(studentData));
        } catch (profileError) {
          console.error("Error al obtener perfil después del registro:", profileError);
          await this.logout();
          throw profileError;
        }
      }

      return response.data;
    } catch (error: any) {
      localStorage.removeItem("studentData");
      
      // Si el backend devuelve un error estructurado
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Verificar si tiene el código de error especial
        if (errorData.code === "USER_EXISTS_WITH_GOOGLE") {
          // Lanzar el error con todas las propiedades
          throw errorData;
        }
        
        // Para otros errores, lanzar como Error normal
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        
        // Si no tiene ni code ni error, lanzar el objeto completo
        throw errorData;
      }
      
      throw new Error(error.message || "Error de conexión. Verifica tu conexión a internet.");
    }
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      localStorage.removeItem("studentData");
      
      const response = await api.post("/auth/login", credentials);

      if (response.data.customToken) {
        await signInWithCustomToken(auth, response.data.customToken);
        
        let retries = 0;
        while (!auth.currentUser && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        if (auth.currentUser) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (auth.currentUser) {
        try {
          const currentUid = auth.currentUser.uid;
          const profile = await this.getProfile(currentUid);
          
          if (profile.uid !== currentUid) {
            console.error("Error: El perfil obtenido no corresponde al usuario actual");
            await this.logout();
            throw new Error("Error de autenticación: perfil no coincide");
          }
          
          const studentData = {
            uid: profile.uid,
            email: profile.email,
            nombre: profile.nombre,
            apellido: profile.apellido,
            role: profile.role || "student",
            loginTime: new Date().toISOString(),
          };
          localStorage.setItem("studentData", JSON.stringify(studentData));
        } catch (profileError) {
          console.error("Error al obtener perfil después del login:", profileError);
          await this.logout();
          throw profileError;
        }
      }

      return response.data;
    } catch (error: any) {
      localStorage.removeItem("studentData");
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(error.message || "Error de conexión. Verifica tu conexión a internet.");
    }
  }

  async googleAuth(dni?: string, aceptaTerminos?: boolean): Promise<AuthResponse> {
    try {
      const googleProvider = new GoogleAuthProvider();
      const authInstance = getAuth();

      // Abrir popup de Google
      const result = await signInWithPopup(authInstance, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Llamar al backend con el idToken (y opcionalmente DNI)
      const response = await api.post("/auth/google", {
        idToken,
        dni,
        aceptaTerminos,
      });

      // Si todo salió bien, hacer login con el custom token
      if (response.data.token) {
        await signInWithCustomToken(auth, response.data.token);
      }

      return response.data;
    } catch (error: any) {
      // Hacer logout si hay error
      await this.logout();

      // Caso 1: Necesita completar registro con DNI
      if (error.response?.data?.code === "NEEDS_REGISTRATION_DATA") {
        throw {
          code: "NEEDS_REGISTRATION_DATA",
          message: error.response.data.message,
          userData: error.response.data.userData,
        };
      }

      // Caso 2: Necesita vincular con password
      if (error.response?.data?.code === "NEEDS_PASSWORD_TO_LINK") {
        throw {
          code: "NEEDS_PASSWORD_TO_LINK",
          message: error.response.data.message,
          email: error.response.data.email,
          existingUid: error.response.data.existingUid,
        };
      }

      if (error.response?.data) {
        throw new Error(error.response.data.error || "Error con Google");
      }

      throw new Error(error.message || "Error de conexión");
    }
  }

  async linkGoogleToPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const googleProvider = new GoogleAuthProvider();
      const authInstance = getAuth();

      // Abrir popup de Google
      const result = await signInWithPopup(authInstance, googleProvider);
      const user = result.user;
      const googleIdToken = await user.getIdToken();

      // Llamar al endpoint de vinculación
      const response = await api.post("/auth/link-google", {
        email,
        password,
        googleIdToken,
      });

      // Login con el token
      if (response.data.token) {
        await signInWithCustomToken(auth, response.data.token);
      }

      return response.data;
    } catch (error: any) {
      await this.logout();

      if (error.response?.data) {
        throw new Error(error.response.data.error || "Error vinculando Google");
      }

      throw new Error(error.message || "Error de conexión");
    }
  }

  async linkPasswordToGoogle(
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    dni: string,
    aceptaTerminos: boolean
  ): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/link-password", {
        email,
        password,
        nombre,
        apellido,
        dni,
        aceptaTerminos,
      });

      if (response.data.token) {
        await signInWithCustomToken(auth, response.data.token);
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || "Error vinculando contraseña");
      }
      throw new Error("Error de conexión. Verifica tu conexión a internet.");
    }
  }
  
  async updateDni(dni: string): Promise<void> {
    try {
      await api.patch("/auth/update-dni", { dni });
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.error || "Error actualizando DNI");
      }
      throw new Error("Error de conexión. Verifica tu conexión a internet.");
    }
  }

  async googleLogin() {
    console.warn("googleLogin está deprecado, usar googleAuth()");
    return this.googleAuth();
  }

  async googleRegister(firstName: string, lastName: string, dni: string, acceptTerms: boolean): Promise<void> {
    console.warn("googleRegister está deprecado, usar googleAuth(dni, acceptTerms)");
    return this.googleAuth(dni, acceptTerms) as any;
  }

  async getUserById(uid: string): Promise<UserProfile> {
    try {
      const response = await api.get(`/auth/user/${uid}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error al obtener el usuario");
    }
  }

  async userExists(uid: string): Promise<boolean> {
    try {
      await api.get(`/auth/user/${uid}`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw new Error(error.response?.data?.error || "Error al verificar el usuario");
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.get(`/auth/check-email/${email}`);
      await sendPasswordResetEmail(auth, email, {
        url: `${FRONTEND_URL}/recuperar-contrasena`,
      });
    } catch (error: any) {
      const customError = new Error(error.response?.data?.error || "Error al enviar email de recuperación");
      (customError as any).exists = error.response?.data?.exists || false;
      throw customError;
    }
  }

  async changePassword(oobCode: string, password: string): Promise<void> {
    try {
      await confirmPasswordReset(auth, oobCode, password);
    } catch (error: any) {
      throw new Error(error.message || "Error al cambiar contraseña");
    }
  }

  async getProfile(expectedUid?: string, retries: number = 3): Promise<UserProfile> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.getIdToken(true);
      }
      
      const response = await api.get("/auth/me");
      const profile = response.data;
      
      if (expectedUid && profile.uid !== expectedUid) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return this.getProfile(expectedUid, retries - 1);
        }
        throw new Error("El perfil obtenido no corresponde al usuario actual");
      }
      
      return profile;
    } catch (error: any) {
      if (retries > 0 && error.message !== "El perfil obtenido no corresponde al usuario actual") {
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.getProfile(expectedUid, retries - 1);
      }
      
      if (error.response?.status === 401) {
        await this.logout();
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }
      throw new Error(error.response?.data?.error || error.message || "Error al obtener el perfil");
    }
  }

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

  async loadQuestion(id: string): Promise<{ texto: string, orden: number, respuestas: any[] }[]> {
    try {
      const response = await api.get(`/test-vocacional/preguntas/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error al cargar la pregunta");
    }
  }
  
  async savePartialAnswer(uid: string, questionId: string, answer: string): Promise<void> {
    try {
      await api.post(`/test-vocacional/enviar-respuesta-parcial/${uid}`, { 
        id_pregunta: questionId, 
        letra_respuesta: answer.toUpperCase()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error al guardar la respuesta parcial");
    }
  }

  async testVocacional(uid: string, responses: string[]): Promise<void> {
    try {
      await api.post(`/test-vocacional`, { uid, responses });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error al realizar el test vocacional");
    }
  }

  async updateRouteUser(uid: string, newUser: UserProfile): Promise<void> {
    try {
      await api.put(`/users/${uid}`, newUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error al actualizar la ruta de aprendizaje");
    }
  }

  async loginWithToken(idToken: string): Promise<AuthResponse> {
    try {
      console.log("[AUTH] Intentando validar token desde la tienda...");
      const response = await api.post("/auth/validate-token", { idToken });
      
      if (response.data.customToken) {
        console.log("[AUTH] Token validado, autenticando con customToken...");
        await signInWithCustomToken(auth, response.data.customToken);
        
        let retries = 0;
        while (!auth.currentUser && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        if (retries >= 10) {
          console.error("[AUTH] Timeout esperando usuario después de signInWithCustomToken");
          throw new Error("Timeout al autenticar con el token");
        }
        
        if (auth.currentUser) {
          console.log("[AUTH] Usuario autenticado exitosamente:", auth.currentUser.uid);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        console.warn("[AUTH] No se recibió customToken en la respuesta");
      }

      return response.data;
    } catch (error: any) {
      console.error("[AUTH] Error al autenticar con token:", error);
      if (error.response?.data) {
        const errorMessage = error.response.data.error || "Error al validar token";
        const errorDetails = error.response.data.details;
        console.error("[AUTH] Error del backend:", errorMessage, errorDetails);
        throw new Error(errorMessage + (errorDetails ? `: ${errorDetails}` : ""));
      }
      throw new Error(error.message || "Error de conexión. Verifica tu conexión a internet.");
    }
  }
}

const authService = new AuthService();
export default authService;