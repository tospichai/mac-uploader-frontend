import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  PhotosResponse,
  PhotoResponse,
  EventResponse,
  ApiResponse,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
      }
    );
  }

  // Event endpoints
  async getEvent(eventCode: string): Promise<EventResponse> {
    const response = await this.client.get(`/api/events/${eventCode}`);
    return response.data;
  }

  // Photo endpoints
  async getPhotos(
    eventCode: string,
    page: number = 1
  ): Promise<PhotosResponse> {
    const response = await this.client.get(`/api/events/${eventCode}/photos`, {
      params: { page },
    });
    return response.data;
  }

  async getPhoto(eventCode: string, photoId: string): Promise<PhotoResponse> {
    const response = await this.client.get(
      `/api/events/${eventCode}/photos/${photoId}`
    );
    return response.data; // The response.data is already the PhotoResponse object
  }

  // SSE endpoint for real-time updates
  getEventStreamUrl(eventCode: string): string {
    return `${API_BASE_URL}/api/events/${eventCode}/photos/stream`;
  }

  // Utility method to download photo as base64
  async downloadPhotoAsBase64(
    eventCode: string,
    photoId: string
  ): Promise<string> {
    try {
      console.log(`Fetching photo ${photoId} for event ${eventCode}`);
      const response = await this.getPhoto(eventCode, photoId);
      console.log("Photo response:", response);
      console.log("Response success:", response.success);

      // Check if response.data exists and has base64
      if (response.success && response.base64) {
        // Nested base64 property
        console.log(`Got nested base64 for photo ${photoId}`);
        return response.base64;
      }

      console.error("Invalid response structure from server:", response);
      throw new Error("Invalid response structure from server");
    } catch (error) {
      console.error("Download error:", error);
      throw new Error("ไม่สามารถดาวน์โหลดไฟล์ได้");
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
