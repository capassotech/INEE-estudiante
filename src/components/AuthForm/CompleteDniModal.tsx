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
import { Checkbox } from "@/components/ui/checkbox";
import { IdCard, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface CompleteDniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dni: string, acceptTerms: boolean) => Promise<void>;
  userData: {
    email: string;
    nombre: string;
    apellido: string;
    photoURL?: string;
  } | null;
  isSubmitting: boolean;
}

export default function CompleteDniModal({
  isOpen,
  onClose,
  onSubmit,
  userData,
  isSubmitting,
}: CompleteDniModalProps) {
  const [dni, setDni] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ dni?: string; acceptTerms?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { dni?: string; acceptTerms?: string } = {};

    if (!dni) {
      newErrors.dni = "El DNI es requerido";
    } else if (!/^\d{7,8}$/.test(dni)) {
      newErrors.dni = "El DNI debe tener entre 7 y 8 dígitos";
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(dni, acceptTerms);
    } catch (err: any) {
      setErrors({ dni: err.message || "Error completando registro" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Completá tu registro</DialogTitle>
          <DialogDescription>
            ¡Hola {userData?.nombre}! Para continuar, necesitamos tu DNI para emitir certificados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modal-dni">DNI</Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="modal-dni"
                type="text"
                placeholder="Tu número de DNI"
                className="pl-10"
                value={dni}
                onChange={(e) => {
                  setDni(e.target.value);
                  setErrors((prev) => ({ ...prev, dni: "" }));
                }}
                disabled={isSubmitting}
              />
            </div>
            {errors.dni && <p className="text-sm text-destructive">{errors.dni}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="modal-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => {
                  setAcceptTerms(checked === true);
                  setErrors((prev) => ({ ...prev, acceptTerms: "" }));
                }}
                disabled={isSubmitting}
              />
              <Label htmlFor="modal-terms" className="text-sm">
                Acepto los{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  política de privacidad
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms}</p>
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
            <Button type="submit" disabled={isSubmitting || !dni || !acceptTerms}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completando...
                </>
              ) : (
                "Completar registro"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}