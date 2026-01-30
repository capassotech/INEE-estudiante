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
      // Limpiar datos antiguos antes de registrar
      localStorage.removeItem("studentData");
      
      const response = await api.post("/auth/register", userData);

      if (response.data.customToken) {
        await signInWithCustomToken(auth, response.data.customToken);
        
        // Esperar a que el token esté disponible
        let retries = 0;
        while (!auth.currentUser && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        // Esperar un momento adicional para que el token se propague
        if (auth.currentUser) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Obtener el perfil real del backend inmediatamente después del registro
      if (auth.currentUser) {
        try {
          const currentUid = auth.currentUser.uid;
          // Pasar el UID esperado para que getProfile lo verifique
          const profile = await this.getProfile(currentUid);
          
          // Verificar que el perfil corresponde al usuario actual (doble verificación)
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
          // Si falla obtener el perfil, limpiar y lanzar error
          await this.logout();
          throw profileError;
        }
      }

      return response.data;
    } catch (error: any) {
      // Limpiar localStorage si el registro falla
      localStorage.removeItem("studentData");
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(error.message || "Error de conexión. Verifica tu conexión a internet.");
    }
  }


  async googleLogin() {
    try {
      // Limpiar datos antiguos antes de hacer login
      localStorage.removeItem("studentData");
      
      const googleProvider = new GoogleAuthProvider();
      const auth = getAuth();

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userExists = await this.userExists(user.uid);
      if (!userExists) {
        await this.logout();
        throw new Error("El usuario no está registrado");
      }

      // Obtener el perfil real del backend inmediatamente después del login
      try {
        const profile = await this.getProfile(user.uid);
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
        console.error("Error al obtener perfil después de Google login:", profileError);
        // No lanzar error aquí, el onAuthStateChanged lo manejará
      }

      const idToken = await user.getIdToken();
      return { idToken, user };
    } catch (error: any) {
      // Limpiar localStorage si el login falla
      localStorage.removeItem("studentData");
      throw new Error(error.message);
    }
  }

  async googleRegister(firstName: string, lastName: string, dni: string, acceptTerms: boolean): Promise<void> {
    // Limpiar datos antiguos antes de registrar
    localStorage.removeItem("studentData");
    
    const googleProvider = new GoogleAuthProvider();
    const auth = getAuth();

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    const userExists = await this.userExists(user.uid);
    if (userExists) {
      await this.logout();
      throw new Error("El usuario ya está registrado");
    }

    try {
      const response = await api.post("/auth/google-register", {
        idToken,
        email: user.email,
        nombre: firstName,
        apellido: lastName,
        dni: dni,
        aceptaTerminos: acceptTerms,
      });

      // Obtener el perfil real del backend inmediatamente después del registro
      try {
        const profile = await this.getProfile(user.uid);
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
        // Si falla obtener el perfil, usar los datos proporcionados como fallback
        const studentData = {
          uid: user.uid,
          email: user.email,
          nombre: firstName,
          apellido: lastName,
          role: "student",
          registrationTime: new Date().toISOString(),
        };
        localStorage.setItem("studentData", JSON.stringify(studentData));
      }

      return response.data;
    } catch (error: any) {
      // Limpiar localStorage si el registro falla
      localStorage.removeItem("studentData");
      console.error("Error en googleRegister: ", error.response?.data?.error);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  // Iniciar sesión
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      // Limpiar datos antiguos antes de hacer login
      localStorage.removeItem("studentData");
      
      const response = await api.post("/auth/login", credentials);

      if (response.data.customToken) {
        await signInWithCustomToken(auth, response.data.customToken);
        
        // Esperar a que el token esté disponible
        let retries = 0;
        while (!auth.currentUser && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        // Esperar un momento adicional para que el token se propague
        if (auth.currentUser) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Obtener el perfil real del backend inmediatamente después del login
      if (auth.currentUser) {
        try {
          const currentUid = auth.currentUser.uid;
          // Pasar el UID esperado para que getProfile lo verifique
          const profile = await this.getProfile(currentUid);
          
          // Verificar que el perfil corresponde al usuario actual (doble verificación)
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
          // Si falla obtener el perfil, limpiar y lanzar error
          await this.logout();
          throw profileError;
        }
      }

      return response.data;
    } catch (error: any) {
      // Limpiar localStorage si el login falla
      localStorage.removeItem("studentData");
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(error.message || "Error de conexión. Verifica tu conexión a internet.");
    }
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
      // Si es otro tipo de error (500, 401, etc.), lo lanzamos
      throw new Error(error.response?.data?.error || "Error al verificar el usuario");
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      // Validar si el usuario existe en la db
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

  // Obtener perfil del usuario
  async getProfile(expectedUid?: string, retries: number = 3): Promise<UserProfile> {
    try {
      // Asegurarse de que el token esté actualizado
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Forzar refresco del token para asegurar que esté actualizado
        await currentUser.getIdToken(true);
      }
      
      const response = await api.get("/auth/me");
      const profile = response.data;
      
      // Si se espera un UID específico, verificar que coincida
      if (expectedUid && profile.uid !== expectedUid) {
        // Si hay reintentos disponibles y el UID no coincide, reintentar
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
          return this.getProfile(expectedUid, retries - 1);
        }
        throw new Error("El perfil obtenido no corresponde al usuario actual");
      }
      
      return profile;
    } catch (error: any) {
      // Si hay reintentos disponibles, reintentar (excepto si es el error de UID no coincidente)
      if (retries > 0 && error.message !== "El perfil obtenido no corresponde al usuario actual") {
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.getProfile(expectedUid, retries - 1);
      }
      
      if (error.response?.status === 401) {
        await this.logout();
        throw new Error(
          "Sesión expirada. Por favor, inicia sesión nuevamente."
        );
      }
      throw new Error(
        error.response?.data?.error || error.message || "Error al obtener el perfil"
      );
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem("studentData");
      
      // Limpiar todas las claves de progreso de cursos del localStorage
      // Esto previene que se muestre el progreso de la cuenta anterior
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("courseProgress_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn("Error al limpiar progreso de cursos del localStorage:", error);
      }
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

  // Autenticar con token de otra aplicación (tienda)
  async loginWithToken(idToken: string): Promise<AuthResponse> {
    try {
      console.log("[AUTH] Intentando validar token desde la tienda...");
      const response = await api.post("/auth/validate-token", { idToken });
      
      if (response.data.customToken) {
        console.log("[AUTH] Token validado, autenticando con customToken...");
        await signInWithCustomToken(auth, response.data.customToken);
        
        // Esperar a que el token esté disponible
        let retries = 0;
        while (!auth.currentUser && retries < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }
        
        if (retries >= 10) {
          console.error("[AUTH] Timeout esperando usuario después de signInWithCustomToken");
          throw new Error("Timeout al autenticar con el token");
        }
        
        // Esperar un momento adicional para que el token se propague
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
