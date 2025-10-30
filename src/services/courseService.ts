import axios from "axios";
import { auth } from "../../config/firebase-client";
import { Course } from "@/types/types";

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
      const modules = [];
      for (const id of ids) {
        const response = await api.get(`/modulos/${id}`);
        console.log(response.data);
        modules.push(response.data);
      }
      return modules;
    } catch (error) {
      console.error("Error getting modules:", error);
      return [];
    }
  }
}

const courseService = new CourseService();
export default courseService;
