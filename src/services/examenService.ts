import axios from 'axios';
import { auth } from '../../config/firebase-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar automáticamente el token de autenticación
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

export interface RespuestaExamen {
  id: string;
  texto: string;
  esCorrecta: boolean;
}

export interface PreguntaExamen {
  id: string;
  texto: string;
  respuestas: RespuestaExamen[];
}

export interface Examen {
  id: string;
  titulo: string;
  id_formacion: string;
  preguntas: PreguntaExamen[];
  estado: 'activo' | 'inactivo';
  createdAt?: string;
  updatedAt?: string;
}

export interface RespuestaUsuario {
  preguntaId: string;
  respuestaIds: string[];
}

export interface ExamenRealizado {
  id?: string;
  id_examen: string;
  id_formacion: string;
  id_usuario: string;
  respuestas: RespuestaUsuario[];
  nota: number;
  aprobado: boolean;
  intento: number;
  fecha_realizado: string;
  createdAt?: string;
  updatedAt?: string;
}

// Obtener examen por formación (curso)
export const getExamenByFormacion = async (idFormacion: string): Promise<Examen | null> => {
  try {
    const response = await api.get(`/examenes/formacion/${idFormacion}`);
    
    if (response.data.examenes && response.data.examenes.length > 0) {
      return response.data.examenes[0]; // Retornar el primer examen activo
    }
    
    return null;
  } catch (error) {
    console.error('Error getting examen:', error);
    throw error;
  }
};

// Calcular nota del examen
export const calcularNota = (examen: Examen, respuestas: RespuestaUsuario[]): number => {
  let correctas = 0;
  const totalPreguntas = examen.preguntas.length;

  examen.preguntas.forEach((pregunta) => {
    const respuestaUsuario = respuestas.find((r) => r.preguntaId === pregunta.id);
    if (!respuestaUsuario) return;

    // Obtener las respuestas correctas de la pregunta
    const respuestasCorrectasIds = pregunta.respuestas
      .filter((r) => r.esCorrecta)
      .map((r) => r.id)
      .sort();

    // Obtener las respuestas del usuario ordenadas
    const respuestasUsuarioIds = [...respuestaUsuario.respuestaIds].sort();

    // Comparar arrays: deben ser exactamente iguales
    const esCorrecta = 
      respuestasCorrectasIds.length === respuestasUsuarioIds.length &&
      respuestasCorrectasIds.every((id, index) => id === respuestasUsuarioIds[index]);

    if (esCorrecta) {
      correctas++;
    }
  });

  const nota = (correctas / totalPreguntas) * 100;
  return Math.round(nota * 100) / 100; // Redondear a 2 decimales
};

// Guardar examen realizado
export const guardarExamenRealizado = async (data: Omit<ExamenRealizado, 'id'>): Promise<ExamenRealizado> => {
  try {
    const response = await api.post('/examenes-realizados', data);
    return response.data;
  } catch (error: any) {
    console.error('Error saving examen realizado:', error);
    throw error;
  }
};

// Obtener exámenes realizados por usuario y formación
export const getExamenesRealizadosByUsuarioYFormacion = async (
  idUsuario: string,
  idFormacion: string
): Promise<ExamenRealizado[]> => {
  try {
    const response = await api.get(
      `/examenes-realizados/usuario/${idUsuario}/formacion/${idFormacion}`
    );
    return response.data.examenes || [];
  } catch (error) {
    console.error('Error getting examenes realizados:', error);
    throw error;
  }
};

// Obtener último intento
export const getUltimoIntento = async (
  idUsuario: string,
  idFormacion: string
): Promise<ExamenRealizado | null> => {
  try {
    // Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    const response = await api.get(
      `/examenes-realizados/usuario/${idUsuario}/formacion/${idFormacion}/ultimo?t=${timestamp}`
    );
    
    return response.data.examen || null;
  } catch (error) {
    console.error('Error getting ultimo intento:', error);
    throw error;
  }
};

export default {
  getExamenByFormacion,
  calcularNota,
  guardarExamenRealizado,
  getExamenesRealizadosByUsuarioYFormacion,
  getUltimoIntento,
};

