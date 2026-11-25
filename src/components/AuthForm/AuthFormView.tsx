import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeIcon as IdCard, Lock, Mail, User } from "lucide-react";
import { PasswordRequirements } from "../PasswordRequirements";
import type { PasswordRequirementsState } from "@/utils/passwordRequirements";
import {
  AuthDivider,
  AuthField,
  AuthOutlineButton,
  AuthShell,
  AuthSubmit,
  GoogleIcon,
  PasswordToggle,
  authLinkClass,
  type AuthBrandCopy,
} from "./AuthShell";

const BRAND_COPY: AuthBrandCopy = {
  badge: "Campus virtual",
  footnote: "Campus virtual",
};

export default function AuthFormView({
  isLogin = false,
  currentStep = 1,
  showEmailForm = false,
  onSubmit,
  onGoogleAuth,
  onInputChange,
  onStepChange,
  onEmailMethodSelect,
  errors,
  formData,
  isSubmitting,
  showPassword,
  setShowPassword,
  isModal = false,
  passwordRequirements,
}: {
  isLogin?: boolean;
  currentStep?: number;
  isModal?: boolean;
  showEmailForm?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleAuth: () => void;
  onInputChange: (field: string, value: string | boolean) => void;
  onStepChange?: (step: number) => void;
  onEmailMethodSelect?: () => void;
  errors: Record<string, string>;
  formData: Record<string, string | boolean>;
  isSubmitting: boolean;
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
  passwordRequirements: PasswordRequirementsState;
}) {
  const location = useLocation();
  const searchParams = location.search || "";

  const isStep1Valid =
    isLogin ||
    ((formData.firstName as string)?.trim().length >= 2 &&
      (formData.lastName as string)?.trim().length >= 2 &&
      (formData.dni as string)?.length >= 7 &&
      formData.acceptTerms === true);

  const value = (field: string) => (formData[field] as string) ?? "";
  const passwordToggle = (
    <PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} disabled={isSubmitting} />
  );

  const googleButton = (
    <AuthOutlineButton onClick={onGoogleAuth} disabled={isSubmitting}>
      <GoogleIcon />
      Continuar con Google
    </AuthOutlineButton>
  );

  const emailField = (
    <AuthField
      id="email"
      type="email"
      label="Email"
      icon={Mail}
      placeholder="tu@email.com"
      autoComplete="email"
      value={value("email")}
      onChange={(e) => onInputChange("email", e.target.value)}
      disabled={isSubmitting}
      error={errors.email}
    />
  );

  const renderLogin = () => (
    <div className="space-y-5">
      {googleButton}
      <AuthDivider label="o con tu email" />
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
        noValidate
      >
        {emailField}
        <AuthField
          id="password"
          type={showPassword ? "text" : "password"}
          label="Contraseña"
          icon={Lock}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          value={value("password")}
          onChange={(e) => onInputChange("password", e.target.value)}
          disabled={isSubmitting}
          trailing={passwordToggle}
          labelAside={
            <Link to="/recuperar-contrasena" className={`text-xs ${authLinkClass}`}>
              ¿Olvidaste tu contraseña?
            </Link>
          }
        />
        <div className="pt-2">
          <AuthSubmit type="submit" loading={isSubmitting} loadingText="Ingresando...">
            Ingresar
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </AuthSubmit>
        </div>
      </form>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3">
        <AuthField
          id="firstName"
          label="Nombre"
          icon={User}
          placeholder="Tu nombre"
          autoComplete="given-name"
          value={value("firstName")}
          onChange={(e) => onInputChange("firstName", e.target.value)}
          disabled={isSubmitting}
          error={errors.firstName}
        />
        <AuthField
          id="lastName"
          label="Apellido"
          icon={User}
          placeholder="Tu apellido"
          autoComplete="family-name"
          value={value("lastName")}
          onChange={(e) => onInputChange("lastName", e.target.value)}
          disabled={isSubmitting}
          error={errors.lastName}
        />
      </div>
      <AuthField
        id="dni"
        label="DNI"
        icon={IdCard}
        placeholder="Tu número de DNI"
        inputMode="numeric"
        value={value("dni")}
        onChange={(e) => onInputChange("dni", e.target.value)}
        disabled={isSubmitting}
        error={errors.dni}
      />
      <div className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="terms"
            checked={formData.acceptTerms as boolean}
            onCheckedChange={(checked) => onInputChange("acceptTerms", checked === true)}
            disabled={isSubmitting}
            className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#8b3740] data-[state=checked]:border-[#8b3740]"
          />
          <label htmlFor="terms" className="text-sm text-gray-600 leading-snug">
            Acepto los{" "}
            <a href="https://ineeoficial.com/terms" target="_blank" rel="noreferrer" className={authLinkClass}>
              términos y condiciones
            </a>{" "}
            y la{" "}
            <a href="https://ineeoficial.com/terms" target="_blank" rel="noreferrer" className={authLinkClass}>
              política de privacidad
            </a>
          </label>
        </div>
        {errors.acceptTerms && <p className="text-xs text-red-600">{errors.acceptTerms}</p>}
      </div>
      <div className="pt-2">
        <AuthSubmit type="button" onClick={() => onStepChange?.(2)} disabled={!isStep1Valid || isSubmitting}>
          Continuar
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </AuthSubmit>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      {googleButton}
      <AuthDivider label="o" />
      {!showEmailForm ? (
        <AuthSubmit type="button" onClick={onEmailMethodSelect} disabled={isSubmitting}>
          <Mail className="h-4 w-4" />
          Registrarme con email
        </AuthSubmit>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {emailField}
          <AuthField
            id="password"
            type={showPassword ? "text" : "password"}
            label="Contraseña"
            icon={Lock}
            placeholder="Crea una contraseña segura"
            autoComplete="new-password"
            value={value("password")}
            onChange={(e) => onInputChange("password", e.target.value)}
            disabled={isSubmitting}
            error={errors.password}
            trailing={passwordToggle}
          />
          {value("password").length > 0 && <PasswordRequirements passwordRequirements={passwordRequirements} />}
          <div className="pt-2">
            <AuthSubmit type="button" onClick={(e) => onSubmit(e)} loading={isSubmitting} loadingText="Creando cuenta...">
              Crear cuenta
            </AuthSubmit>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => onStepChange?.(1)}
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis datos
      </button>
    </div>
  );

  // Indicador de pasos del registro
  const steps = !isLogin && (
    <div className="mb-6 flex items-center gap-2" aria-label={`Paso ${currentStep} de 2`}>
      {[1, 2].map((step) => (
        <span
          key={step}
          className={`h-1 flex-1 rounded-full transition-colors ${step <= currentStep ? "bg-[#8b3740]" : "bg-gray-200"}`}
        />
      ))}
      <span className="ml-1 text-xs tabular-nums text-gray-400">{currentStep}/2</span>
    </div>
  );

  const content = (
    <>
      {steps}
      {isLogin ? renderLogin() : currentStep === 2 ? renderStep2() : renderStep1()}
    </>
  );

  // Dentro de un modal (carrito) solo va el formulario
  if (isModal) return <div>{content}</div>;

  const title = isLogin ? "Bienvenido de nuevo" : currentStep === 2 ? "Crea tu acceso" : "Crea tu cuenta";
  const description = isLogin
    ? "Ingresa a tu campus para continuar con tu formación."
    : currentStep === 2
      ? "Elige cómo vas a ingresar a tu cuenta."
      : "Comienza con tus datos personales.";

  return (
    <AuthShell
      copy={BRAND_COPY}
      title={title}
      description={description}
      footer={
        <>
          {isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}{" "}
          <Link to={(isLogin ? "/registro" : "/login") + searchParams} className={authLinkClass}>
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </Link>
        </>
      }
    >
      {content}
    </AuthShell>
  );
}
