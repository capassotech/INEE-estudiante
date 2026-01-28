import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, Check, X } from "lucide-react";

interface LinkGoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  email: string;
  isSubmitting: boolean;
}

export default function LinkGoogleModal({
  isOpen,
  onClose,
  onSubmit,
  email,
  isSubmitting,
}: LinkGoogleModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const getPasswordRequirements = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  };

  const requirements = getPasswordRequirements(password);
  const isPasswordValid = requirements.minLength && requirements.hasUppercase && 
                         requirements.hasSpecialChar && requirements.hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError("La contraseña es requerida");
      return;
    }

    if (!isPasswordValid) {
      setError("La contraseña no cumple con los requisitos");
      return;
    }

    try {
      await onSubmit(password);
    } catch (err: any) {
      setError(err.message || "Error al agregar contraseña");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar contraseña a tu cuenta</DialogTitle>
          <DialogDescription>
            Ya tenés una cuenta con Google (<strong>{email}</strong>).
            ¿Querés agregar contraseña a tu cuenta?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Crea una contraseña segura"
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}

            {password.length > 0 && (
              <div className={`mt-3 p-3 bg-muted/50 rounded-lg border ${
                isPasswordValid ? 'border-green-500' : 'border-border'
              }`}>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Requisitos de la contraseña:
                </p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {requirements.minLength ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${requirements.minLength ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                      Al menos 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {requirements.hasUppercase ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${requirements.hasUppercase ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                      Una letra mayúscula
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {requirements.hasNumber ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${requirements.hasNumber ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                      Al menos un número
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {requirements.hasSpecialChar ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${requirements.hasSpecialChar ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                      Un carácter especial (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isPasswordValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                "Agregar contraseña"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}