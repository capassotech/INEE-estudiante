"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  BadgeIcon as IdCard,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import authService from "../services/authService";

interface AuthFormProps {
  isLogin?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isLogin = false }) => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dni: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
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

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const response = await login(formData.email, formData.password);

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
        const response = await register(formData);

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
    } catch (error: any) {
      console.error("Error en autenticación:", error);
      toast.error(error.message || "Ocurrió un error. Inténtalo de nuevo.");
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
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-hero-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="flex items-center space-x-2">
              <div className="h-10 rounded-lg flex items-center justify-center">
                <img src="/logo-blanco.png" alt="INEE Logo" className="h-20" />
              </div>
            </div>
          </Link>
        </div>

        <Card className="shadow-2xl border-0 card-gradient">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </CardTitle>
            <p className="text-center text-muted-foreground">
              {isLogin
                ? "Ingresa a tu cuenta para continuar"
                : "Únete a nuestra comunidad"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Google Auth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  O continúa con email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="form-label">
                      Nombre
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Tu nombre"
                        className={`pl-10 form-input ${
                          errors.firstName
                            ? "border-destructive ring-destructive"
                            : ""
                        }`}
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="form-error">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="form-label">
                      Apellido
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Tu apellido"
                        className={`pl-10 form-input ${
                          errors.lastName
                            ? "border-destructive ring-destructive"
                            : ""
                        }`}
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="form-error">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="dni" className="form-label">
                    DNI
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dni"
                      type="text"
                      placeholder="Tu número de DNI"
                      className={`pl-10 form-input ${
                        errors.dni ? "border-destructive ring-destructive" : ""
                      }`}
                      value={formData.dni}
                      onChange={(e) => handleInputChange("dni", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.dni && <p className="form-error">{errors.dni}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="form-label">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className={`pl-10 form-input ${
                      errors.email ? "border-destructive ring-destructive" : ""
                    }`}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="form-label">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isLogin ? "Tu contraseña" : "Crea una contraseña segura"
                    }
                    className={`pl-10 pr-10 form-input ${
                      errors.password
                        ? "border-destructive ring-destructive"
                        : ""
                    }`}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) =>
                        handleInputChange("acceptTerms", checked as boolean)
                      }
                      disabled={isSubmitting}
                      className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="terms" className="text-sm text-foreground">
                      Acepto los{" "}
                      <Link
                        to="/terms"
                        className="text-primary hover:underline transition-colors"
                      >
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link
                        to="/privacy"
                        className="text-primary hover:underline transition-colors"
                      >
                        política de privacidad
                      </Link>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="form-error">{errors.acceptTerms}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-gradient dark:btn-gradient-dark hover:opacity-90 transition-all duration-200 font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Iniciando sesión..." : "Creando cuenta..."}
                  </>
                ) : isLogin ? (
                  "Iniciar Sesión"
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
                <Link
                  to={isLogin ? "/registro" : "/login"}
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  {isLogin ? "Regístrate" : "Inicia sesión"}
                </Link>
              </p>
            </div>

            {isLogin && (
              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForm;
