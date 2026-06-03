import { api } from "@/lib/apiClient";

class ReviewService {
  async createReview(courseId: string, rating: number, comment?: string) {
    try {
      const response = await api.post(`/reviews`, {
        courseId,
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  async getReviewsByCourse(courseId: string) {
    try {
      const response = await api.get(`/reviews/course/${courseId}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        params: {
          _t: Date.now() // Timestamp para evitar caché
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error getting reviews:", error);
      throw error;
    }
  }

  async skipReview(userId: string, courseId: string) {
    try {
      const response = await api.post(`/reviews/reminder`, {
        userId,
        courseId,
      });
      return response.data;
    } catch (error) {
      console.error("Error skipping review:", error);
      throw error;
    }
  }
}

const reviewService = new ReviewService();
export default reviewService;
