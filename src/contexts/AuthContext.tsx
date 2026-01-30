import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../config/firebase-client";
import authService from "../services/authService";
import { UserProfile } from "../types/types";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  googleAuth: (dni?: string, aceptaTerminos?: boolean) => Promise<any>;
  linkGoogleToPassword: (email: string, password: string) => Promise<any>;
  linkPasswordToGoogle: (email: string, password: string, nombre: string, apellido: string, dni: string, aceptaTerminos: boolean) => Promise<any>;
  updateDni: (dni: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (oobCode: string, password: string) => Promise<void>;
  testVocacional: (responses: string[]) => Promise<void>;
  loadQuestion: (id: string) => Promise<{ texto: string, orden: number, respuestas: any[] }[]>;
  savePartialAnswers: (questionId: string, answer: string) => Promise<void>;
  updateRouteUser: (routeName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isProcessingTokenRef = useRef(false);

  const isAuthenticated = !!firebaseUser && !!user;

  // Detectar token en URL y autenticar automáticamente
  useEffect(() => {
    const handleTokenFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        try {
          isProcessingTokenRef.current = true;
          setIsLoading(true);
          
          console.log("[AUTH] Token detectado en URL, iniciando proceso de autenticación...");
          
          window.history.replaceState({}, '', window.location.pathname);
          
          if (auth.currentUser) {
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                try {
                  const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
                  const tokenUid = payload.user_id || payload.sub || payload.uid;
                  
                  if (tokenUid && tokenUid === auth.currentUser.uid) {
                    console.log("[AUTH] Token corresponde al usuario actual, no se requiere re-autenticación");
                    isProcessingTokenRef.current = false;
                    return;
                  }
                  
                  if (tokenUid && tokenUid !== auth.currentUser.uid) {
                    console.log("[AUTH] Token corresponde a otro usuario, cerrando sesión actual...");
                    await authService.logout();
                  }
                } catch (parseError) {
                  console.warn("[AUTH] No se pudo decodificar el token, procediendo con autenticación:", parseError);
                  await authService.logout();
                }
              } else {
                console.warn("[AUTH] Token no tiene formato JWT válido, cerrando sesión actual...");
                await authService.logout();
              }
            } catch (decodeError) {
              console.error("[AUTH] Error procesando token:", decodeError);
              await authService.logout();
            }
          }
          
          console.log("[AUTH] Autenticando con token de la URL...");
          await authService.loginWithToken(token);
          console.log("[AUTH] Token procesado, esperando que onAuthStateChanged complete...");
        } catch (error: any) {
          console.error("[AUTH] Error autenticando con token de URL:", error);
          if (error.message) {
            console.error("[AUTH] Mensaje de error:", error.message);
          }
          isProcessingTokenRef.current = false;
          setIsLoading(false);
        }
      } else {
        isProcessingTokenRef.current = false;
      }
    };

    handleTokenFromUrl();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const isProcessing = isProcessingTokenRef.current;
      console.log("[AUTH] onAuthStateChanged - Usuario:", firebaseUser?.uid || "ninguno", "Procesando token:", isProcessing);
      
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          if (isProcessing) {
            console.log("[AUTH] Esperando a que se complete el procesamiento del token...");
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const expectedUid = firebaseUser.uid;
          console.log("[AUTH] Obteniendo perfil para UID:", expectedUid);
          const profile = await authService.getProfile(expectedUid);
          
          if (profile.uid !== expectedUid) {
            console.error("[AUTH] Error: El perfil obtenido no corresponde al usuario actual", {
              expected: expectedUid,
              received: profile.uid
            });
            try {
              await firebaseUser.getIdToken(true);
              await new Promise(resolve => setTimeout(resolve, 500));
              const retryProfile = await authService.getProfile(expectedUid);
              if (retryProfile.uid !== expectedUid) {
                await authService.logout();
                setUser(null);
                isProcessingTokenRef.current = false;
                setIsLoading(false);
                return;
              }
              setUser(retryProfile);
              
              authService.updateStudentDataInStorage({
                uid: retryProfile.uid,
                email: retryProfile.email,
                nombre: retryProfile.nombre,
                apellido: retryProfile.apellido,
                dni: retryProfile.dni,
                fechaRegistro: retryProfile.fechaRegistro,
                aceptaTerminos: retryProfile.aceptaTerminos,
                role: retryProfile.role || "student",
                lastProfileUpdate: new Date().toISOString(),
              });
            } catch (retryError) {
              console.error("[AUTH] Error en reintento de obtener perfil:", retryError);
              await authService.logout();
              setUser(null);
              isProcessingTokenRef.current = false;
              setIsLoading(false);
              return;
            }
          } else {
            console.log("[AUTH] Perfil obtenido exitosamente");
            setUser(profile);
            
            authService.updateStudentDataInStorage({
              uid: profile.uid,
              email: profile.email,
              nombre: profile.nombre,
              apellido: profile.apellido,
              dni: profile.dni,
              fechaRegistro: profile.fechaRegistro,
              aceptaTerminos: profile.aceptaTerminos,
              role: profile.role || "student",
              lastProfileUpdate: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("[AUTH] Error al obtener perfil:", error);
          await authService.logout();
          setUser(null);
        }
      } else {
        console.log("[AUTH] No hay usuario de Firebase, limpiando datos");
        localStorage.removeItem("studentData");
        setUser(null);
      }

      if (!isProcessing) {
        console.log("[AUTH] Estableciendo isLoading en false");
        setIsLoading(false);
      } else {
        console.log("[AUTH] Manteniendo isLoading en true (procesando token)");
        setTimeout(() => {
          isProcessingTokenRef.current = false;
          setIsLoading(false);
          console.log("[AUTH] Procesamiento del token completado");
        }, 1000);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      
      const response = await authService.register({
        email: userData.email,
        password: userData.password,
        nombre: userData.firstName,
        apellido: userData.lastName,
        dni: userData.dni,
        aceptaTerminos: userData.acceptTerms,
      });

      // El perfil se cargará automáticamente por el listener de onAuthStateChanged
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const googleAuth = async (dni?: string, aceptaTerminos?: boolean) => {
    try {
      setIsLoading(true);
      const response = await authService.googleAuth(dni, aceptaTerminos);
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const linkGoogleToPassword = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.linkGoogleToPassword(email, password);
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const linkPasswordToGoogle = async (
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    dni: string,
    aceptaTerminos: boolean
  ) => {
    try {
      setIsLoading(true);
      const response = await authService.linkPasswordToGoogle(
        email,
        password,
        nombre,
        apellido,
        dni,
        aceptaTerminos
      );
      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const updateDni = async (dni: string) => {
    try {
      setIsLoading(true);
      await authService.updateDni(dni);
      await refreshUser();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const refreshUser = async () => {
    try {
      if (firebaseUser) {
        const profile = await authService.getProfile();
        setUser(profile);

        authService.updateStudentDataInStorage({
          dni: profile.dni,
          fechaRegistro: profile.fechaRegistro,
          aceptaTerminos: profile.aceptaTerminos,
          lastProfileUpdate: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error al refrescar usuario:", error);
      await logout();
    }
  };

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const changePassword = async (oobCode: string, password: string) => {
    try {
      await authService.changePassword(oobCode, password);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
    }
  };

  const loadQuestion = async (id: string) => {
    try {
      const question = await authService.loadQuestion(id);
      return question;
    } catch (error) {
      console.error("Error al cargar la pregunta:", error);
      return null;
    }
  };

  const savePartialAnswers = async (questionId: string, answer: string) => {
    try {
      if (!user?.uid) {
        throw new Error("Usuario no autenticado");
      }
      await authService.savePartialAnswer(user.uid, questionId, answer);
      
      if (user) {
        const updatedAnswers = [...(user.respuestas_test_vocacional || [])];
        const existingIndex = updatedAnswers.findIndex(resp => resp.id_pregunta === questionId);
        
        const newAnswer = {
          id_pregunta: questionId,
          id_respuesta: `r${((answer.toUpperCase().charCodeAt(0) - 65) + 1)}`,
          letra_respuesta: answer.toUpperCase()
        };
        
        if (existingIndex >= 0) {
          updatedAnswers[existingIndex] = newAnswer;
        } else {
          updatedAnswers.push(newAnswer);
        }
        
        setUser({
          ...user,
          respuestas_test_vocacional: updatedAnswers
        });
      }
    } catch (error) {
      console.error("Error al guardar la respuesta parcial:", error);
      throw error;
    }
  };

  const testVocacional = async (responses: string[]) => {
    try {
      await authService.testVocacional(user.uid, responses);
      await refreshUser();
    } catch (error) {
      console.error("Error al realizar el test vocacional:", error);
      throw error;
    }
  };

  const updateRouteUser = async (routeName: string) => {
    try {
      const newUser = {
        ...user,
        ruta_aprendizaje: routeName
      };
      await authService.updateRouteUser(user.uid, newUser);
    } catch (error) {
      console.error("Error al actualizar la ruta de aprendizaje:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    googleAuth,
    linkGoogleToPassword,
    linkPasswordToGoogle,
    updateDni,
    forgotPassword,
    changePassword,
    testVocacional,
    loadQuestion,
    savePartialAnswers,
    updateRouteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};