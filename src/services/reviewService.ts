import axios from "axios";
import { auth } from "../../config/firebase-client";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://inee-backend.onrender.com";
const api = axios.create({
  baseURL: `${API_BASE_URL}`, 
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

class ReviewService {
  async createReview(courseId: string, rating: number, comment?: string) {
    try {
      const response = await api.post(`/api/reviews`, { courseId, rating, comment });
      return response.data;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  async getReviewsByCourse(courseId: string) {
    try {
      const response = await api.get(`/api/reviews/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting reviews:", error);
      throw error;
    }
  }

  async skipReview(userId: string, courseId: string) {
    try {
      const response = await api.post(`/api/reviews/reminder`, { userId, courseId });
      return response.data;
    } catch (error) {
      console.error("Error skipping review:", error);
      throw error;
    }
  }
}

const reviewService = new ReviewService();
export default reviewService;
