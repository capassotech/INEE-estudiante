"use client";

import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import authService from "../../services/authService";
import AuthFormView from "./AuthFormView";

interface AuthFormProps {
  isLogin?: boolean;
}

const AuthFormController: React.FC<AuthFormProps> = ({ isLogin = false }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dni: "",
    acceptTerms: false,
  });


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email es inválido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else {
      const passwordErrors: string[] = [];
      
      if (formData.password.length < 8) {
        passwordErrors.push("• La contraseña debe tener al menos 8 caracteres");
      }
      
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push("• La contraseña debe contener al menos una letra mayúscula");
      }
      
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)) {
        passwordErrors.push("• La contraseña debe contener al menos un carácter especial");
      }
      
      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push("• La contraseña debe contener al menos un número");
      }
      
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors.join("\n");
      }
    } 

    if (!isLogin) {
      // Validar nombre
      if (!formData.firstName.trim()) {
        newErrors.firstName = "El nombre es requerido";
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = "El nombre debe tener al menos 2 caracteres";
      }

      // Validar apellido
      if (!formData.lastName.trim()) {
        newErrors.lastName = "El apellido es requerido";
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = "El apellido debe tener al menos 2 caracteres";
      }

      // Validar DNI
      if (!formData.dni) {
        newErrors.dni = "El DNI es requerido";
      } else if (!/^\d{7,8}$/.test(formData.dni)) {
        newErrors.dni = "El DNI debe tener entre 7 y 8 dígitos";
      }

      // Validar términos
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);

        const studentData = authService.getStudentDataFromStorage();
        const userName = studentData?.nombre || "Usuario";

        toast.success(`¡Bienvenido de vuelta, ${userName}!`, {
          description: "Has iniciado sesión exitosamente",
          duration: 4000,
        });

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        await register(formData);

        const studentData = authService.getStudentDataFromStorage();
        const userName = studentData?.nombre || "Usuario";

        toast.success(`¡Bienvenido a INEE, ${userName}!`, {
          description: "Tu cuenta ha sido creada exitosamente",
          duration: 4000,
        });

        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error: unknown) {      
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    toast.info("Autenticación con Google próximamente disponible");
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <AuthFormView
      isLogin={isLogin}
      onSubmit={handleSubmit}
      onGoogleAuth={handleGoogleAuth}
      onInputChange={handleInputChange}
      errors={errors}
      formData={formData}
      isSubmitting={isSubmitting}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
    />
  );
};

export default AuthFormController;
