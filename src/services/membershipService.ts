import { api } from "@/lib/apiClient";

class MembershipService {
  async getMembresia(membresiaId: string) {
    try {
      // Asegurarse de que membresiaId es un string válido
      if (!membresiaId || typeof membresiaId !== 'string') {
        throw new Error("ID de membresía inválido");
      }
      const response = await api.get(`/membership/${membresiaId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting membresia:", error);
      // Si es un 404, retornar null en lugar de undefined
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
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
