import { api } from "@/lib/apiClient";
import { Evento } from "@/types/types";

class EventService {
  async getAll(): Promise<Evento[]> {
    try {
      const response = await api.get(`/eventos`);
      return response.data.events;
    } catch (error) {
      console.error("Error getting eventos:", error);
      return [];
    }
  }
}

const eventService = new EventService();
export default eventService;
