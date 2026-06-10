import { api } from "@/lib/apiClient";
import { Recomendacion } from "@/types/types";

interface RecomendacionesResponse {
  pagination: {
    hasMore: boolean;
    count: number;
    lastId: string;
    limit: number;
  };
  recomendaciones: Recomendacion[];
}

class RecommendationService {
  async getAll(): Promise<RecomendacionesResponse> {
    try {
      const response = await api.get("/recomendaciones", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log(response.data);

      return response.data || [];
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return null;
    }
  }
}

const recommendationService = new RecommendationService();
export default recommendationService;
