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
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import {
  arePasswordRequirementsMet,
  getPasswordRequirements,
} from "@/utils/passwordRequirements";

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

  const requirements = getPasswordRequirements(password);
  const isPasswordValid = arePasswordRequirementsMet(requirements);

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
              <PasswordRequirements passwordRequirements={requirements} />
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
