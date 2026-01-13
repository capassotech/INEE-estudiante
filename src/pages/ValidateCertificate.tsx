import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, XCircle } from "lucide-react";
import certificateService from "@/services/certificateService";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import EnvironmentBanner from "@/components/EnvironmentBanner";

interface CertificadoInfo {
  certificadoId: string;
  usuarioId: string;
  cursoId: string;
  nombreCompleto: string;
  dni: string;
  nombreCurso: string;
  fechaFinalizacion: string;
  fechaEmision: string;
  qrCodeUrl: string;
  validationUrl: string;
}

const ValidateCertificate = () => {
  const { certificadoId } = useParams<{ certificadoId: string }>();
  const [loading, setLoading] = useState(true);
  const [certificado, setCertificado] = useState<CertificadoInfo | null>(null);
  const [valido, setValido] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const validarCertificado = async () => {
      if (!certificadoId) {
        setMensaje("ID de certificado no proporcionado");
        setValido(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await certificateService.validarCertificado(certificadoId);
        
        setValido(response.valido);
        setMensaje(response.mensaje);
        
        if (response.valido && response.certificado) {
          setCertificado(response.certificado);
        }
      } catch (error: any) {
        console.error("Error al validar certificado:", error);
        setValido(false);
        setMensaje(error.message || "Error al validar el certificado");
        toast.error("Error al validar el certificado");
      } finally {
        setLoading(false);
      }
    };

    validarCertificado();
  }, [certificadoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <EnvironmentBanner />
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Validando certificado...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnvironmentBanner />
      <Header />
      <Toaster />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 min-h-screen">
        {!valido && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="flex justify-center mb-4">
                  <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
                </div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl px-2">
                  Certificado Inválido
                </CardTitle>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 px-2">{mensaje}</p>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className="text-center text-gray-600 dark:text-gray-400">
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base">El certificado no pudo ser validado.</p>
                  <p className="text-xs sm:text-sm px-2">
                    Por favor, verifica que el ID del certificado sea correcto o contacta con el soporte.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {valido && certificado && (
          <div className="max-w-4xl mx-auto">
            {/* Certificado - Diseño similar al PDF */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 sm:p-6 md:p-12 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex flex-col justify-center">
              {/* Título del certificado */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 px-2 break-words">
                  CERTIFICADO
                </h1>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2 px-2">
                  DE
                </h1>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 px-2 break-words">
                  FINALIZACIÓN
                </h1>
              </div>

              {/* Texto "INEE certifica que" */}
              <div className="text-center mb-4 sm:mb-5 md:mb-6">
                <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 px-2">
                  INEE certifica que
                </p>
              </div>

              {/* Nombre del estudiante */}
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white uppercase px-2 break-words">
                  {certificado.nombreCompleto}
                </p>
              </div>

              {/* DNI */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 px-2">
                  DNI: {certificado.dni}
                </p>
              </div>

              {/* Texto de finalización */}
              <div className="text-center mb-4 sm:mb-5 md:mb-6">
                <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 px-2">
                  ha finalizado satisfactoriamente el programa de
                </p>
              </div>

              {/* Nombre del curso */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white uppercase px-2 break-words">
                  {certificado.nombreCurso}
                </p>
              </div>

              {/* Fecha de finalización */}
              <div className="text-center mb-4 sm:mb-5 md:mb-6">
                <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 px-2 break-words">
                  Fecha de finalización: {new Date(certificado.fechaFinalizacion).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Nota sobre validación */}
              <div className="text-center mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2">
                  Este certificado puede ser validado escaneando el código QR
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ValidateCertificate;

