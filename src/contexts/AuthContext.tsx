
import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  googleRegister: (firstName: string, lastName: string, dni: string, acceptTerms: boolean) => Promise<any>;
  googleLogin: () => Promise<any>;
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

  const isAuthenticated = !!firebaseUser && !!user;

  // Detectar token en URL y autenticar automáticamente
  useEffect(() => {
    const handleTokenFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        try {
          setIsLoading(true);
          
          // Remover el token de la URL para no mostrarlo
          window.history.replaceState({}, '', window.location.pathname);
          
          // Si ya hay un usuario autenticado, verificar si el token corresponde al mismo usuario
          if (auth.currentUser) {
            try {
              // Decodificar el token JWT para obtener el UID
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                try {
                  const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
                  const tokenUid = payload.user_id || payload.sub || payload.uid;
                  
                  // Si el token corresponde al usuario actual, no hacer nada
                  if (tokenUid && tokenUid === auth.currentUser.uid) {
                    console.log("Token corresponde al usuario actual, no se requiere re-autenticación");
                    setIsLoading(false);
                    return;
                  }
                  
                  // Si el token es de otro usuario, hacer logout primero
                  if (tokenUid && tokenUid !== auth.currentUser.uid) {
                    console.log("Token corresponde a otro usuario, cerrando sesión actual...");
                    await authService.logout();
                  }
                } catch (parseError) {
                  console.warn("No se pudo decodificar el token, procediendo con autenticación:", parseError);
                  // Si no se puede decodificar, hacer logout por seguridad y proceder con el login
                  await authService.logout();
                }
              } else {
                // Token no tiene formato JWT válido, hacer logout por seguridad
                console.warn("Token no tiene formato JWT válido, cerrando sesión actual...");
                await authService.logout();
              }
            } catch (decodeError) {
              console.error("Error procesando token:", decodeError);
              // Si hay error, hacer logout por seguridad y proceder con el login
              await authService.logout();
            }
          }
          
          // Autenticar con el token (ya sea porque no hay usuario o porque es diferente)
          await authService.loginWithToken(token);
          // El onAuthStateChanged manejará el resto
        } catch (error) {
          console.error("Error autenticando con token de URL:", error);
          setIsLoading(false);
        }
      }
    };

    // Esperar un momento para que el estado inicial se establezca
    const timer = setTimeout(() => {
      handleTokenFromUrl();
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Solo ejecutar una vez al montar

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Esperar un momento para asegurar que el token esté completamente propagado
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Obtener el perfil del backend pasando el UID esperado
          const expectedUid = firebaseUser.uid;
          const profile = await authService.getProfile(expectedUid);
          
          // Verificar que el perfil corresponde al usuario actual de Firebase
          if (profile.uid !== expectedUid) {
            console.error("Error: El perfil obtenido no corresponde al usuario actual", {
              expected: expectedUid,
              received: profile.uid
            });
            // No hacer logout inmediatamente, intentar refrescar el token y reintentar
            try {
              await firebaseUser.getIdToken(true);
              await new Promise(resolve => setTimeout(resolve, 500));
              const retryProfile = await authService.getProfile(expectedUid);
              if (retryProfile.uid !== expectedUid) {
                await authService.logout();
                setUser(null);
                setIsLoading(false);
                return;
              }
              // Si el reintento fue exitoso, usar ese perfil
              setUser(retryProfile);
              
              // Actualizar localStorage con los datos correctos del perfil
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
              console.error("Error en reintento de obtener perfil:", retryError);
              await authService.logout();
              setUser(null);
              setIsLoading(false);
              return;
            }
          } else {
            setUser(profile);
            
            // Actualizar localStorage con los datos correctos del perfil
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
          console.error("Error al obtener perfil:", error);
          // Si falla obtener el perfil, limpiar todo
          await authService.logout();
          setUser(null);
        }
      } else {
        // Si no hay usuario de Firebase, limpiar todo
        localStorage.removeItem("studentData");
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Los datos ya se guardaron en localStorage en el servicio
      const response = await authService.login({ email, password });
      return response; // Retornar respuesta para usar en el componente
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

      // Los datos ya se guardaron en localStorage en el servicio
      setIsLoading(false);
      return response; // Retornar respuesta para usar en el componente
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const googleRegister = async (firstName: string, lastName: string, dni: string, acceptTerms: boolean) => {
    try {
      setIsLoading(true);

      const response = await authService.googleRegister(firstName, lastName, dni, acceptTerms);

      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await authService.googleLogin();
      setIsLoading(false);
      return response;
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
    try {
      await authService.forgotPassword(email);
    } catch (error: any) {
      throw error;
    }
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
      
      // Actualizar solo la parte relevante del usuario en lugar de hacer refresh completo
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
      // Actualizar el perfil del usuario después del test para obtener la ruta_aprendizaje
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
    googleRegister,
    googleLogin,
    forgotPassword,
    changePassword,
    testVocacional,
    loadQuestion,
    savePartialAnswers,
    updateRouteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
