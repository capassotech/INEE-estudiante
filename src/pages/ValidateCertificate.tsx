import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle, CheckCircle2, Download, Award, Calendar, User, FileText, Hash } from "lucide-react";
import certificateService from "@/services/certificateService";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import EnvironmentBanner from "@/components/EnvironmentBanner";
import { Loader } from "@/components/ui/loader";

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
  tipo: 'APROBACION' | 'PARTICIPACION';
}

const ValidateCertificate = () => {
  const { certificadoId } = useParams<{ certificadoId: string }>();
  const [loading, setLoading] = useState(true);
  const [certificado, setCertificado] = useState<CertificadoInfo | null>(null);
  const [valido, setValido] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

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
          
          // Cargar el PDF del certificado
          try {
            setLoadingPdf(true);
            const url = await certificateService.obtenerPdfCertificado(certificadoId);
            setPdfUrl(url);
          } catch (pdfError) {
            console.error("Error al cargar PDF:", pdfError);
            toast.error("Error al cargar el certificado");
          } finally {
            setLoadingPdf(false);
          }
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

    // Limpiar URL del blob al desmontar
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [certificadoId]);

  const handleDownloadCertificate = async () => {
    if (!certificadoId) return;

    try {
      toast.loading('Descargando certificado...', { id: 'certificate-download' });
      
      // Crear un enlace temporal para descargar el PDF
      const link = document.createElement('a');
      link.href = pdfUrl || '';
      link.download = `certificado-${certificado?.nombreCurso?.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Certificado descargado exitosamente', { id: 'certificate-download' });
    } catch (error) {
      console.error('Error al descargar certificado:', error);
      toast.error('Error al descargar el certificado', { id: 'certificate-download' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <EnvironmentBanner />
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader size="lg" showText={true} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Validando certificado...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <EnvironmentBanner />
      <Header />
      <Toaster />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        {!valido && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <Card className="border-red-200 dark:border-red-900 shadow-xl">
              <CardHeader className="text-center p-6 sm:p-8 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-b border-red-200 dark:border-red-800">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-white dark:bg-red-900/30 p-4 shadow-lg">
                    <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 dark:text-red-500" />
                  </div>
                </div>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-900 dark:text-red-100 mb-2">
                  Certificado Inválido
                </CardTitle>
                <p className="text-base sm:text-lg text-red-700 dark:text-red-300">{mensaje}</p>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 text-center">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  El certificado no pudo ser validado correctamente.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Por favor, verifica que el ID del certificado sea correcto o contacta con nuestro equipo de soporte.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {valido && certificado && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Certificado - Réplica exacta del diseño */}
            {/* Borde amarillo para aprobación, marrón para participación */}
            <div className={`${certificado.tipo === 'APROBACION' ? 'bg-[#B8860B]' : 'bg-[#5C2C2C]'} p-3 sm:p-4 md:p-5 shadow-2xl`}>
              <div className="bg-[#EDE8DF] relative p-4 sm:p-6 md:p-8">
                {/* Bordes decorativos múltiples - exactos del certificado */}
                <div className="absolute inset-3 border-[1px] border-[#8B7355] pointer-events-none z-10"></div>
                <div className="absolute inset-4 border-[1px] border-[#8B7355] pointer-events-none z-10"></div>
                <div className="absolute inset-5 border-[1px] border-[#8B7355] pointer-events-none z-10"></div>

                {/* Contenido del certificado */}
                <div className="relative z-20 px-4 sm:px-8 md:px-16 lg:px-20 py-6 sm:py-10 md:py-12">
                  {/* Logo INEE */}
                  <div className="flex justify-center mb-4 sm:mb-5">
                    <img 
                      src="/logo.png" 
                      alt="INEE Logo" 
                      className="h-12 sm:h-16 md:h-20 lg:h-24 object-contain"
                    />
                  </div>

                  {/* Título institucional */}
                  <h1 className="text-center text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#4A4A4A] mb-2 sm:mb-3 leading-tight px-2">
                    INEE - INSTITUTO DE NEGOCIOS<br />EMPRENDEDOR EMPRESARIAL
                    <span className="text-sm sm:text-base align-super">®</span>
                  </h1>

                  {/* Tipo de certificado */}
                  <h2 className="text-center text-sm sm:text-base md:text-lg lg:text-xl text-[#5A5A5A] mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                    {certificado.tipo === 'APROBACION' ? 'Diploma de Aprobación' : 'Certificado de Participación'}
                  </h2>

                  {/* Por cuanto */}
                  <p className="text-xs sm:text-sm text-[#6B6B6B] mb-2 sm:mb-3">Por cuanto</p>

                  {/* Nombre del estudiante - Grande e italic con color rojo */}
                  <div className="mb-4 sm:mb-5">
                    <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif italic text-[#8B3740] break-words leading-tight">
                      {certificado.nombreCompleto}
                    </p>
                  </div>

                  {/* DNI y Fecha de finalización */}
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-baseline gap-1 sm:gap-2 mb-4 sm:mb-5 text-xs sm:text-sm text-[#6B6B6B]">
                    <div>
                      <span>DNI: </span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-[#8B3740]">
                        {certificado.dni}
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span>Ha finalizado el </span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-[#8B3740] whitespace-nowrap">
                        {new Date(certificado.fechaFinalizacion).getDate()} / {
                          new Date(certificado.fechaFinalizacion).toLocaleDateString("es-AR", { month: "long" })
                        } / {new Date(certificado.fechaFinalizacion).getFullYear()}
                      </span>
                    </div>
                  </div>

                  {/* Texto de estudios */}
                  <p className="text-xs sm:text-sm text-[#6B6B6B] mb-2 sm:mb-3">
                    Los estudios correspondientes a la formación ejecutiva
                  </p>

                  {/* Nombre del curso (formación) */}
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#8B3740] mb-2 sm:mb-3 break-words leading-tight">
                    {certificado.nombreCurso}
                  </h3>

                  {/* Texto de completado */}
                  <p className="text-xs sm:text-sm text-[#6B6B6B] mb-10 sm:mb-12 md:mb-16 leading-relaxed">
                    Habiendo completado de manera satisfactoria las actividades teóricas y prácticas del programa.
                  </p>

                  {/* Footer: Firmas y Botón de descarga */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-end">
                    {/* Firma izquierda */}
                    <div className="hidden md:block">
                      <div className="w-28 lg:w-32 h-[1px] bg-[#8B7355] mb-2"></div>
                      <p className="text-xs sm:text-sm text-[#4A4A4A]">Saenz Beatriz</p>
                      <p className="text-[10px] sm:text-xs text-[#8B3740] leading-tight">
                        Directora de Negocios y Estrategia.
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#8B3740] leading-tight">
                        Especialista en Liderazgo corporativo.
                      </p>
                    </div>

                    {/* Botón de descarga central (reemplaza al QR) */}
                    <div className="flex flex-col items-center justify-center gap-2">
                      {loadingPdf ? (
                        <div className="flex flex-col items-center py-4">
                          <Loader size="md" showText={false} />
                          <span className="text-xs text-[#6B6B6B] mt-2">Preparando...</span>
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={handleDownloadCertificate}
                            disabled={!pdfUrl}
                            size="lg"
                            className="bg-[#8B3740] hover:bg-[#5C2C2C] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base rounded"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Descargar
                          </Button>
                          <p className="text-xs sm:text-sm text-[#6B6B6B]">
                            Fecha {new Date(certificado.fechaEmision).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric"
                            })}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Firma derecha */}
                    <div className="hidden md:block text-right">
                      <div className="w-28 lg:w-32 h-[1px] bg-[#8B7355] mb-2 ml-auto"></div>
                      <p className="text-xs sm:text-sm text-[#4A4A4A]">Krämer. Rocio Ailen.</p>
                      <p className="text-[10px] sm:text-xs text-[#8B3740] leading-tight">
                        Directora Creativa.
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#8B3740] leading-tight">
                        Especialista en Liderazgo Transformacional.
                      </p>
                    </div>
                  </div>

                  {/* Firmas en móvil */}
                  <div className="grid grid-cols-2 gap-4 mt-6 md:hidden">
                    <div>
                      <div className="w-20 h-[1px] bg-[#8B7355] mb-2"></div>
                      <p className="text-xs text-[#4A4A4A]">Saenz Beatriz</p>
                      <p className="text-[10px] text-[#8B3740] leading-tight">
                        Directora de Negocios y Estrategia.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-20 h-[1px] bg-[#8B7355] mb-2 ml-auto"></div>
                      <p className="text-xs text-[#4A4A4A]">Krämer. Rocio Ailen.</p>
                      <p className="text-[10px] text-[#8B3740] leading-tight">
                        Directora Creativa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto de validación */}
            <div className="text-center mt-6 px-4">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Este certificado es válido y puede ser verificado mediante el código QR presente en el documento descargado
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ValidateCertificate;

