import axios from "axios";
import { auth } from "../../config/firebase-client";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://inee-backend.onrender.com";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.error("Error getting ID token:", error);
  }
  return config;
});

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
  };
  mensaje: string;
}

class CertificateService {
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
      // Crear una instancia de axios sin interceptor para llamadas públicas
      const publicApi = axios.create({
        baseURL: `${API_BASE_URL}/api`,
        headers: {
          "Content-Type": "application/json",
        },
      });

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

