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

class CourseService {
  async getCourseById(id: string) {
    try {
      const response = await api.get(`/formaciones/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error getting course:", error);
    }
  }

  async getAllModules(ids: string[]) {
    try {
      // Usar Promise.all con map para preservar el orden del array original
      // y paralelizar las peticiones (más eficiente)
      const modulesPromises = ids.map(async (id: string) => {
        try {
          const response = await api.get(`/modulos/${id}`);
          return response.data;
        } catch (error) {
          console.error(`Error getting module ${id}:`, error);
          return null; // Retornar null para módulos que fallan
        }
      });

      const modulesResults = await Promise.all(modulesPromises);
      // Filtrar los módulos que fallaron (null) y mantener el orden
      const modules = modulesResults.filter((m) => m !== null);
      return modules;
    } catch (error) {
      console.error("Error getting modules:", error);
      return [];
    }
  }
}

const courseService = new CourseService();
export default courseService;
