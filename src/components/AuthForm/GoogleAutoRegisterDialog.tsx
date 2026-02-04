import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface GoogleAutoRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dni: string, acceptTerms: boolean) => void;
  firstName: string;
  lastName: string;
  email: string;
  isSubmitting?: boolean;
}

export default function GoogleAutoRegisterDialog({
  open,
  onOpenChange,
  onSubmit,
  firstName,
  lastName,
  email,
  isSubmitting = false,
}: GoogleAutoRegisterDialogProps) {
  const [dni, setDni] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    // Validar DNI - OBLIGATORIO
    if (!dni || dni.trim() === "") {
      setError("El DNI es requerido para completar tu registro");
      return;
    }

    if (!/^\d{7,8}$/.test(dni)) {
      setError("El DNI debe tener entre 7 y 8 dígitos numéricos");
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    // Solo proceder si todos los campos están validados
    onSubmit(dni.trim(), acceptTerms);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevenir que se cierre sin completar el registro
      if (!newOpen && !isSubmitting) {
        // Solo permitir cerrar si no se está procesando
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
        // Prevenir cerrar haciendo clic fuera del diálogo
        e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            ¡Casi terminamos!
          </DialogTitle>
          <DialogDescription className="text-base">
            Parece que aún no tienes una cuenta. Completa estos datos para crear tu cuenta y comenzar a disfrutar de nuestros servicios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo
              </Label>
              <Input
                id="name"
                value={`${firstName} ${lastName}`.trim() || email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni" className="text-sm font-medium">
                DNI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dni"
                type="text"
                placeholder="Ingresa tu DNI (7-8 dígitos)"
                value={dni}
                onChange={(e) => {
                  setDni(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                maxLength={8}
                className={error ? "border-destructive" : ""}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => {
                  setAcceptTerms(checked as boolean);
                  setError("");
                }}
                className="mt-1"
              />
              <Label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  términos y condiciones
                </a>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Completar registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

