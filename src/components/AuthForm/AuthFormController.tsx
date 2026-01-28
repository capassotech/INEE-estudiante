import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import authService from "@/services/authService";
import AuthFormView from "./AuthFormView";
import LinkPasswordModal from "./LinkPasswordModal";
import LinkGoogleModal from "./LinkGoogleModal";
import CompleteDniModal from "./CompleteDniModal";

interface AuthFormProps {
  isLogin?: boolean;
  isModal?: boolean;
  onSuccess?: () => void;
}

const AuthFormController: React.FC<AuthFormProps> = ({ 
  isLogin = false, 
  isModal = false, 
  onSuccess 
}) => {
  const navigate = useNavigate();
  const { login, register, googleAuth, linkGoogleToPassword, linkPasswordToGoogle } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dni: "",
    acceptTerms: false,
  });

  // Estados para modales
  const [showLinkPasswordModal, setShowLinkPasswordModal] = useState(false);
  const [showLinkGoogleModal, setShowLinkGoogleModal] = useState(false);
  const [showCompleteDniModal, setShowCompleteDniModal] = useState(false);
  const [pendingGoogleData, setPendingGoogleData] = useState<any>(null);

  const getPasswordRequirements = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  };

  const validateForm = (googleAuth: boolean = false) => {
    const newErrors: Record<string, string> = {};
    
    if (!googleAuth) {
      if (!formData.email) {
        newErrors.email = "El email es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "El formato del email es inválido";
      }
  
      if (!formData.password) {
        newErrors.password = "La contraseña es requerida";
      } else {
        const requirements = getPasswordRequirements(formData.password);
        const allRequirementsMet = requirements.minLength && 
                                  requirements.hasUppercase && 
                                  requirements.hasSpecialChar && 
                                  requirements.hasNumber;
        
        if (!allRequirementsMet) {
          newErrors.password = "La contraseña no cumple con todos los requisitos";
        }
      } 
    }

    if (!isLogin) {
      if (!googleAuth) {
        if (!formData.firstName.trim()) {
          newErrors.firstName = "El nombre es requerido";
        } else if (formData.firstName.trim().length < 2) {
          newErrors.firstName = "El nombre debe tener al menos 2 caracteres";
        }
  
        if (!formData.lastName.trim()) {
          newErrors.lastName = "El apellido es requerido";
        } else if (formData.lastName.trim().length < 2) {
          newErrors.lastName = "El apellido debe tener al menos 2 caracteres";
        }
      }

      if (!formData.dni) {
        newErrors.dni = "El DNI es requerido";
      } else if (!/^\d{7,8}$/.test(formData.dni)) {
        newErrors.dni = "El DNI debe tener entre 7 y 8 dígitos";
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSuccessRedirect = (userName: string, isNewUser: boolean = false) => {
    const message = isNewUser 
      ? `¡Bienvenido a INEE®, ${userName}!`
      : `¡Bienvenido de vuelta, ${userName}!`;
    
    const description = isNewUser
      ? "Tu cuenta ha sido creada exitosamente"
      : "Has iniciado sesión exitosamente";

    toast.success(message, {
      description,
      duration: 4000,
    });

    if (isModal && onSuccess) {
      onSuccess();
    } else if (!isModal) {
      navigate("/");
    } else {
      navigate("/checkout");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLogin && !validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        const studentData = authService.getStudentDataFromStorage();
        const userName = studentData?.nombre || "Usuario";
        handleSuccessRedirect(userName, false);
      } else {
        await register(formData);
        const studentData = authService.getStudentDataFromStorage();
        const userName = studentData?.nombre || "Usuario";
        handleSuccessRedirect(userName, true);
      }
    } catch (error: any) {
      console.log("Error capturado:", error);
      console.log("error.code:", error.code);
      console.log("Comparación:", error.code === "USER_EXISTS_WITH_GOOGLE");
      
      // Caso: Usuario existe con Google, ofrecer vincular password
      if (error.code === "USER_EXISTS_WITH_GOOGLE") {
        console.log("✅ Entrando al if de USER_EXISTS_WITH_GOOGLE");
        setPendingGoogleData({
          email: error.email,
          existingUid: error.existingUid,
        });
        console.log("✅ setShowLinkPasswordModal(true)");
        setShowLinkPasswordModal(true);
      } else {
        console.log("❌ NO entró al if, mostrando toast error");
        toast.error(error.message || error.error || "Error en el proceso");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsSubmitting(true);

      if (isLogin) {
        // Login con Google (sin DNI requerido)
        const response = await googleAuth();
        const userName = response.user.nombre || "Usuario";
        handleSuccessRedirect(userName, false);
      } else {
        // Registro con Google (con DNI requerido)
        if (!validateForm(true)) {
          toast.error("Por favor, corrige los errores en el formulario");
          setIsSubmitting(false);
          return;
        }

        const response = await googleAuth(formData.dni, formData.acceptTerms);
        const userName = response.user.nombre || "Usuario";
        handleSuccessRedirect(userName, true);
      }
    } catch (error: any) {
      // Caso 1: Necesita completar DNI
      if (error.code === "NEEDS_REGISTRATION_DATA") {
        setPendingGoogleData(error.userData);
        setShowCompleteDniModal(true);
      } 
      // Caso 2: Necesita vincular con password
      else if (error.code === "NEEDS_PASSWORD_TO_LINK") {
        setPendingGoogleData({
          email: error.email,
          existingUid: error.existingUid,
        });
        setShowLinkPasswordModal(true);
      } 
      else {
        toast.error(error.message || "Error con Google");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para vincular Google con contraseña
  const handleLinkGoogleSubmit = async (password: string) => {
    try {
      setIsSubmitting(true);
      await linkGoogleToPassword(pendingGoogleData.email, password);
      
      const studentData = authService.getStudentDataFromStorage();
      const userName = studentData?.nombre || "Usuario";
      handleSuccessRedirect(userName, false);
      
      setShowLinkPasswordModal(false);
      setPendingGoogleData(null);
    } catch (error: any) {
      toast.error(error.message || "Error vinculando cuenta");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para vincular password a Google
  const handleLinkPasswordSubmit = async (password: string) => {
    try {
      setIsSubmitting(true);
      await linkPasswordToGoogle(
        formData.email,
        password,
        formData.firstName,
        formData.lastName,
        formData.dni,
        formData.acceptTerms
      );
      
      const studentData = authService.getStudentDataFromStorage();
      const userName = studentData?.nombre || "Usuario";
      handleSuccessRedirect(userName, true);
      
      setShowLinkGoogleModal(false);
      setPendingGoogleData(null);
    } catch (error: any) {
      toast.error(error.message || "Error vinculando cuenta");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para completar DNI
  const handleCompleteDniSubmit = async (dni: string, acceptTerms: boolean) => {
    try {
      setIsSubmitting(true);
      const response = await googleAuth(dni, acceptTerms);
      
      const userName = response.user.nombre || "Usuario";
      handleSuccessRedirect(userName, true);
      
      setShowCompleteDniModal(false);
      setPendingGoogleData(null);
    } catch (error: any) {
      toast.error(error.message || "Error completando registro");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    setErrors({});
    if (step !== 2) {
      setShowEmailForm(false);
    }
  };

  const handleEmailMethodSelect = () => {
    setShowEmailForm(true);
  };

  return (
    <>
      <AuthFormView
        isLogin={isLogin}
        currentStep={currentStep}
        showEmailForm={showEmailForm}
        onSubmit={handleSubmit}
        onGoogleAuth={handleGoogleAuth}
        onInputChange={handleInputChange}
        onStepChange={handleStepChange}
        onEmailMethodSelect={handleEmailMethodSelect}
        errors={errors}
        formData={formData}
        isSubmitting={isSubmitting}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        passwordRequirements={getPasswordRequirements(formData.password as string || '')}
        isModal={isModal}
      />

      {/* Modal: Vincular Google con contraseña */}
      <LinkPasswordModal
        isOpen={showLinkPasswordModal}
        onClose={() => {
          setShowLinkPasswordModal(false);
          setPendingGoogleData(null);
        }}
        onSubmit={handleLinkGoogleSubmit}
        email={pendingGoogleData?.email || ""}
        isSubmitting={isSubmitting}
      />

      {/* Modal: Vincular password a Google */}
      <LinkGoogleModal
        isOpen={showLinkGoogleModal}
        onClose={() => {
          setShowLinkGoogleModal(false);
          setPendingGoogleData(null);
        }}
        onSubmit={handleLinkPasswordSubmit}
        email={formData.email}
        isSubmitting={isSubmitting}
      />

      {/* Modal: Completar DNI */}
      <CompleteDniModal
        isOpen={showCompleteDniModal}
        onClose={() => {
          setShowCompleteDniModal(false);
          setPendingGoogleData(null);
        }}
        onSubmit={handleCompleteDniSubmit}
        userData={pendingGoogleData}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default AuthFormController;