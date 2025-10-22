
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

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Si hay un usuario de Firebase, obtener su perfil del backend
          const profile = await authService.getProfile();
          setUser(profile);

          authService.updateStudentDataInStorage({
            dni: profile.dni,
            fechaRegistro: profile.fechaRegistro,
            aceptaTerminos: profile.aceptaTerminos,
            lastProfileUpdate: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Error al obtener perfil:", error);
          setUser(null);
        }
      } else {
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
      console.log("Email de recuperación enviado exitosamente");
    } catch (error: any) {
      console.log("Error al recuperar contraseña:", error.message);
      console.log("Usuario existe:", error.exists);
      
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
