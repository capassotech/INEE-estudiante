import { useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Pide el documento antes de emitir el primer certificado.
 * En la tienda ya no se pide al registrarse (frenaba la compra), así que se completa acá,
 * que es donde realmente se usa.
 */
export function isValidDocument(value: string) {
  const v = value.replace(/[\s.-]/g, "");
  // DNI argentino (7-8 dígitos) o documento/pasaporte de otro país (6-15 letras y números)
  return /^\d+$/.test(v) ? /^\d{7,8}$/.test(v) : /^[A-Za-z0-9]{6,15}$/.test(v);
}

export default function CertificateDataModal({
  open,
  fullName,
  onClose,
  onSubmit,
}: {
  open: boolean;
  /** Nombre como aparecerá en el certificado */
  fullName: string;
  onClose: () => void;
  onSubmit: (documento: string) => Promise<void>;
}) {
  const [documento, setDocumento] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = documento.replace(/[\s.-]/g, "");
    if (!isValidDocument(clean)) {
      setError("Ingresa tu DNI (7 u 8 números) o tu pasaporte/documento (6 a 15 caracteres).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(clean);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el documento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Datos para tu certificado</DialogTitle>
          <DialogDescription className="text-center">
            Tu certificado incluye tu documento de identidad. Lo pedimos una sola vez.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fullName && (
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Nombre en el certificado: </span>
              <span className="font-semibold">{fullName}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="certificate-document">DNI o pasaporte</Label>
            <Input
              id="certificate-document"
              value={documento}
              onChange={(e) => {
                setDocumento(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej: 30123456"
              autoComplete="off"
              autoFocus
              disabled={saving}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar y descargar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
