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

interface LinkPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  email: string;
  isSubmitting: boolean;
  mode?: 'link-google' | 'add-password'; // link-google: tiene password, quiere vincular Google | add-password: tiene Google, quiere agregar password
}

export default function LinkPasswordModal({
  isOpen,
  onClose,
  onSubmit,
  email,
  isSubmitting,
  mode = 'link-google',
}: LinkPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError("La contraseña es requerida");
      return;
    }

    try {
      await onSubmit(password);
    } catch (err: any) {
      setError(err.message || "Error al vincular cuenta");
    }
  };

  const getTitle = () => {
    return mode === 'link-google' 
      ? 'Vincular cuenta de Google' 
      : 'Agregar contraseña a tu cuenta';
  };

  const getDescription = () => {
    return mode === 'link-google'
      ? `Ya tenés una cuenta con ${email} usando contraseña. Ingresá tu contraseña para vincular tu cuenta de Google.`
      : `Ya tenés una cuenta con Google (${email}). Para continuar, agregá una contraseña a tu cuenta.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="link-password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
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
            <Button type="submit" disabled={isSubmitting || !password}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vinculando...
                </>
              ) : (
                "Vincular cuenta"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}