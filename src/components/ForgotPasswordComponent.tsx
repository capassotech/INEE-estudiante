import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Lock, LockKeyhole, Mail, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordRequirements } from "./PasswordRequirements";
import { arePasswordRequirementsMet, getPasswordRequirements } from "@/utils/passwordRequirements";
import { AuthField, AuthOutlineButton, AuthShell, AuthSubmit, PasswordToggle, type AuthBrandCopy } from "./AuthForm/AuthShell";

const BRAND_COPY: AuthBrandCopy = {
  badge: "Campus virtual",
  footnote: "Campus virtual",
};

export default function ForgotPasswordComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const { forgotPassword, changePassword } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const oobCode = params.get("oobCode");

  const passwordRequirements = getPasswordRequirements(password);
  const isPasswordValid = arePasswordRequirementsMet(passwordRequirements);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (oobCode && !isPasswordValid) {
      toast.error("La contraseña no cumple con todos los requisitos");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validamos si esta en la ruta de retorno de firebase
      if (oobCode) {
        await changePassword(oobCode, password);

        toast.success("¡Contraseña cambiada!", {
          description: "Tu contraseña ha sido cambiada correctamente.",
        });

        navigate("/login");
      } else {
        await forgotPassword(email);

        setEmailSent(true);
        toast.success("¡Email enviado!", {
          description: "Revisa tu bandeja de entrada para las instrucciones de recuperación.",
        });
      }
    } catch (error: any) {
      const userExists = error.exists;

      toast.error("Error al enviar el email", {
        description: userExists
          ? "Hubo un problema técnico. Intenta nuevamente en unos minutos."
          : "El email no está registrado en nuestro sistema.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToLogin = (
    <button
      type="button"
      onClick={() => navigate("/login")}
      disabled={isSubmitting}
      className="inline-flex items-center gap-1.5 font-medium text-gray-500 transition-colors hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver al inicio de sesión
    </button>
  );

  if (emailSent) {
    return (
      <AuthShell
        copy={BRAND_COPY}
        icon={MailCheck}
        title="Revisa tu email"
        description={
          <>
            Enviamos las instrucciones de recuperación a <span className="font-medium text-gray-900 break-all">{email}</span>
          </>
        }
        footer={backToLogin}
      >
        <ol className="space-y-2.5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          {["Abre el email y haz clic en el enlace.", "Si no lo ves, revisa la carpeta de spam.", "El enlace vence en 24 horas."].map(
            (step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#8b3740]/10 text-[11px] font-semibold text-[#8b3740]">
                  {i + 1}
                </span>
                {step}
              </li>
            )
          )}
        </ol>
        <AuthOutlineButton
          className="mt-4"
          onClick={() => {
            setEmailSent(false);
            setEmail("");
          }}
        >
          Enviar a otro email
        </AuthOutlineButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      copy={BRAND_COPY}
      icon={oobCode ? LockKeyhole : KeyRound}
      title={oobCode ? "Nueva contraseña" : "¿Olvidaste tu contraseña?"}
      description={
        oobCode ? "Elige una contraseña segura para tu cuenta." : "Ingresa tu email y te enviamos las instrucciones para recuperarla."
      }
      footer={backToLogin}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {oobCode ? (
          <div className="space-y-3">
            <AuthField
              id="password"
              type={showPassword ? "text" : "password"}
              label="Nueva contraseña"
              icon={Lock}
              placeholder="Crea una contraseña segura"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              trailing={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
            />
            {password.length > 0 && <PasswordRequirements passwordRequirements={passwordRequirements} />}
          </div>
        ) : (
          <AuthField
            id="email"
            type="email"
            label="Email"
            icon={Mail}
            placeholder="tu@email.com"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        )}

        <AuthSubmit
          type="submit"
          loading={isSubmitting}
          loadingText={oobCode ? "Guardando..." : "Enviando..."}
          disabled={oobCode ? !isPasswordValid : !email.trim()}
        >
          {oobCode ? "Guardar contraseña" : "Enviar instrucciones"}
        </AuthSubmit>
      </form>
    </AuthShell>
  );
}
