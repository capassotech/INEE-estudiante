import axios from "axios";
import { auth } from "../../config/firebase-client";
import { Evento } from "@/types/types";

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

class EventService {
  async getAll(): Promise<Evento[]> {
    try {
      const response = await api.get(`/eventos`);
      console.log(response.data);
      return response.data.events;
    } catch (error) {
      console.error("Error getting eventos:", error);
      return [];
    }
  }
}

const eventService = new EventService();
export default eventService;
