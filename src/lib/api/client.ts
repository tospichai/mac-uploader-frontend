import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PhotosResponse, PhotoResponse, EventResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Debug logging to verify API URL
console.log("API Base URL:", API_BASE_URL);

const STORAGE_MODE = process.env.NEXT_PUBLIC_STORAGE_MODE || "s3";

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
    const response = await this.client.get(`/api/gallery/${eventCode}/photos`, {
      params: { page },
    });
    return response.data;
  }

  async getPhoto(eventCode: string, photoId: string): Promise<PhotoResponse> {
    const response = await this.client.get(
      `/api/gallery/${eventCode}/photos/${photoId}`
    );
    return response.data; // The response.data is already the PhotoResponse object
  }

  // SSE endpoint for real-time updates
  getEventStreamUrl(eventCode: string): string {
    return `${API_BASE_URL}/api/gallery/${eventCode}/photos/stream`;
  }

  // Utility method to download photo as base64 (for S3 mode)
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

  // Get download URL for a photo (for local mode)
  async getPhotoAsBase64FromUrl(
    eventCode: string,
    photoId: string
  ): Promise<string> {
    if (STORAGE_MODE === "local") {
      // For local storage, fetch the image from URL and convert to base64
      const imageUrl = `${API_BASE_URL}/api/files/events/${eventCode}/${photoId}_original.jpg`;

      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error converting local image to base64:", error);
        throw new Error("ไม่สามารถดาวน์โหลดไฟล์ได้");
      }
    } else {
      // For S3, we'll use the base64 method
      throw new Error("Use downloadPhotoAsBase64 for S3 mode");
    }
  }

  // Check if using local storage
  isUsingLocalStorage(): boolean {
    return STORAGE_MODE === "local";
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
