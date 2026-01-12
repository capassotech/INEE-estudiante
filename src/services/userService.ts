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

class UserService {
  async getCoursesPerUser(uid: string, params?: { limit?: number; lastId?: string; search?: string }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.lastId) {
        queryParams.append('lastId', params.lastId);
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      // Agregar timestamp para evitar caché del navegador
      queryParams.append('_t', Date.now().toString());
      
      const url = `/formaciones/user/${uid}?${queryParams.toString()}`;
      const response = await api.get(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      // Si la respuesta tiene estructura paginada
      if (response.data && response.data.courses) {
        return response.data;
      }
      
      // Compatibilidad con respuestas antiguas (array directo)
      if (Array.isArray(response.data)) {
        return {
          courses: response.data,
          pagination: {
            hasMore: false,
            lastId: null,
            limit: response.data.length,
            count: response.data.length
          }
        };
      }
      
      return {
        courses: [],
        pagination: {
          hasMore: false,
          lastId: null,
          limit: 0,
          count: 0
        }
      };
    } catch (error) {
      console.error("Error getting courses:", error);
      // Retornar estructura paginada vacía en caso de error
      return {
        courses: [],
        pagination: {
          hasMore: false,
          lastId: null,
          limit: 0,
          count: 0
        }
      };
    }
  }

  async getMembresia(membresiaId: string) {
    try {
      const response = await api.get(`/membership/${membresiaId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting membresia:", error);
    }
  }
}

const userService = new UserService();
export default userService;
