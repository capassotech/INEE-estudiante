import axios from "axios";
import { auth } from "../../config/firebase-client";
import { Recomendacion } from "@/types/types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://inee-backend.onrender.com";

interface RecomendacionesResponse {
  pagination: {
    hasMore: boolean;
    count: number;
    lastId: string;
    limit: number;
  },
  recomendaciones: Recomendacion[]
}

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

class RecommendationService {
  async getAll(): Promise<RecomendacionesResponse> {
    try {
      const response = await api.get("/recomendaciones", {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log(response.data)
      
      return response.data || [];
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return null;
    }
  }
}

const recommendationService = new RecommendationService();
export default recommendationService;
