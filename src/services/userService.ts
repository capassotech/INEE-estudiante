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
  async getCoursesPerUser(uid: string) {
    try {
      const response = await api.get(`/formaciones/user/${uid}`);
      return response.data;
    } catch (error) {
      console.error("Error getting courses:", error);
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
