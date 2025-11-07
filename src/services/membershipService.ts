import axios from "axios";
import { auth } from "../../config/firebase-client";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

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

class MembershipService {
  async getMembresia(membresiaId: string) {
    try {
      const response = await api.get(`/membership/${membresiaId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting membresia:", error);
    }
  }

  async getMembresias() {
    try {
      const response = await api.get(`/membership`);
      return response.data;
    } catch (error) {
      console.error("Error getting membresias:", error);
    }
  }
}

const membershipService = new MembershipService();
export default membershipService;
