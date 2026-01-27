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

export interface CertificadoGenerado {
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
  fechaFinalizacionTexto: string;
  fechaQR: string;
}

class CertificateService {
  /**
   * Solicitar generación de certificado y devolver los datos
   */
  async generarCertificado(cursoId: string): Promise<CertificadoGenerado> {
    try {
      const response = await api.post<{
        message: string;
        certificado: CertificadoGenerado;
      }>(`/certificados/generar/${cursoId}`);

      const certificado = response.data?.certificado;

      if (!certificado) {
        throw new Error("No se pudo generar el certificado");
      }
      return certificado;
    } catch (error) {
      console.error("Error al generar certificado:", error);
      const axiosError = error as { response?: { data?: { error?: string } } };
      throw new Error(
        axiosError.response?.data?.error || "Error al generar el certificado"
      );
    }
  }

  /**
   * Validar certificado (público, sin autenticación)
   */
  async validarCertificado(
    certificadoId: string
  ): Promise<CertificadoValidationResponse> {
    try {
      // Crear una instancia de axios sin interceptor para llamadas públicas
      const publicApi = axios.create({
        baseURL: `${API_BASE_URL}/api`,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await publicApi.get<CertificadoValidationResponse>(`/certificados/validar/${certificadoId}`);
      return response.data;
    } catch (error) {
      console.error("Error al validar certificado:", error);
      const axiosError = error as { response?: { data?: { mensaje?: string } } };
      // Si hay un mensaje de error del servidor, usarlo
      if (axiosError.response?.data?.mensaje) {
        throw new Error(axiosError.response.data.mensaje);
      }
      throw new Error("Error al validar el certificado");
    }
  }
}

const certificateService = new CertificateService();
export default certificateService;

