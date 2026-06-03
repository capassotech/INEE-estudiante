import { api, publicApi } from "@/lib/apiClient";

export interface CertificadoValidationResponse {
  valido: boolean;
  certificado?: {
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
  };
  mensaje: string;
}

class CertificateService {
  /**
   * Obtener PDF del certificado por ID (para visualización)
   */
  async obtenerPdfCertificado(certificadoId: string): Promise<string> {
    try {
      const response = await publicApi.get(
        `/certificados/pdf/${certificadoId}`,
        {
          responseType: "blob",
        }
      );

      // Crear un blob del PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      return url;
    } catch (error: any) {
      console.error("Error al obtener PDF del certificado:", error);
      throw new Error(
        error.response?.data?.error ||
        "Error al obtener el PDF del certificado"
      );
    }
  }

  /**
   * Generar y descargar certificado PDF
   */
  async generarCertificado(cursoId: string): Promise<void> {
    try {
      const response = await api.post(
        `/certificados/generar/${cursoId}`,
        {},
        {
          responseType: "blob",
        }
      );

      // Crear un blob del PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado-${cursoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error al generar certificado:", error);
      throw new Error(
        error.response?.data?.error ||
        "Error al generar el certificado"
      );
    }
  }

  /**
   * Validar certificado (público, sin autenticación)
   */
  async validarCertificado(certificadoId: string): Promise<CertificadoValidationResponse> {
    try {
      const response = await publicApi.get<CertificadoValidationResponse>(
        `/certificados/validar/${certificadoId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error al validar certificado:", error);
      // Si hay un mensaje de error del servidor, usarlo
      if (error.response?.data?.mensaje) {
        throw new Error(error.response.data.mensaje);
      }
      throw new Error("Error al validar el certificado");
    }
  }
}

const certificateService = new CertificateService();
export default certificateService;

