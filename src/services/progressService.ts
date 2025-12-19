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

export interface MarcarCompletadoData {
  userId: string;
  cursoId: string;
  moduloId: string;
  contenidoId: string;
}

export interface DesmarcarCompletadoData {
  userId: string;
  cursoId: string;
  moduloId: string;
  contenidoId: string;
}

export interface ProgresoCursoResponse {
  success: boolean;
  data: {
    progreso_general: number;
    total_contenidos: number;
    contenidos_completados: number;
    modulos: Array<{
      modulo_id: string;
      nombre: string;
      progreso: number;
      contenidos_totales: number;
      contenidos_completados: number;
      completado: boolean;
    }>;
  };
}

export interface EstadoContenidoResponse {
  success: boolean;
  data: {
    completado: boolean;
    fecha_completado: string | null;
  };
}

export interface ProgresoModuloResponse {
  success: boolean;
  message: string;
  progreso: {
    progreso: number;
    contenidos_completados: number;
    total_contenidos: number;
    ultima_actividad: string | null;
  };
  modulo_progreso?: {
    modulo_id: string;
    nombre: string;
    progreso: number;
    contenidos_totales: number;
    contenidos_completados: number;
    completado: boolean;
  };
}

class ProgressService {
  /**
   * Marcar un contenido como completado
   */
  async marcarCompletado(data: MarcarCompletadoData): Promise<ProgresoModuloResponse> {
    try {
      const response = await api.post<ProgresoModuloResponse>(
        "/progreso/marcar-completado",
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Error al marcar contenido como completado:", error);
      throw new Error(
        error.response?.data?.error ||
        "Error al marcar contenido como completado"
      );
    }
  }

  /**
   * Desmarcar un contenido como completado
   */
  async desmarcarCompletado(
    data: DesmarcarCompletadoData
  ): Promise<ProgresoModuloResponse> {
    try {
      const response = await api.post<ProgresoModuloResponse>(
        "/progreso/desmarcar-completado",
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Error al desmarcar contenido:", error);
      throw new Error(
        error.response?.data?.error ||
        "Error al desmarcar contenido como completado"
      );
    }
  }

  /**
   * Obtener progreso completo de un curso
   */
  async obtenerProgresoCurso(cursoId: string): Promise<ProgresoCursoResponse> {
    try {
      const response = await api.get<ProgresoCursoResponse>(
        `/progreso/curso/${cursoId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error al obtener progreso del curso:", error);
      throw new Error(
        error.response?.data?.error ||
        "Error al obtener progreso del curso"
      );
    }
  }

  /**
   * Obtener estado de un contenido específico
   */
  async obtenerEstadoContenido(
    moduloId: string,
    contenidoId: string
  ): Promise<EstadoContenidoResponse> {
    try {
      const response = await api.get<EstadoContenidoResponse>(
        `/progreso/contenido/${moduloId}/${contenidoId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error al obtener estado del contenido:", error);
      throw new Error(
        error.response?.data?.error ||
        "Error al obtener estado del contenido"
      );
    }
  }
}

const progressService = new ProgressService();
export default progressService;


