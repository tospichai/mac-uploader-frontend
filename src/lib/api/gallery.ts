import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApiResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Debug logging to verify API URL
console.log("Gallery API Base URL:", API_BASE_URL);

export interface Photo {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  originalFilename?: string;
  url: string; // For backward compatibility with existing code
}

export interface GalleryPhotosResponse {
  success: boolean;
  data: {
    photos: Photo[];
    pagination: {
      currentPage: number;
      totalPages: number;
      hasMultiplePages: boolean;
      hasPrevPage: boolean;
      hasNextPage: boolean;
      prevPage: number | null;
      nextPage: number | null;
      pages: Array<{
        number: number;
        active: boolean;
      }>;
    };
  };
}

export interface PhotoResponse {
  success: boolean;
  data: {
    id: string;
    base64: string;
  };
}

class GalleryApiClient {
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
        console.error("Gallery API Error:", error);
        return Promise.reject(error);
      }
    );
  }

  async getPhotos(
    eventCode: string,
    page: number = 1
  ): Promise<GalleryPhotosResponse> {
    const response = await this.client.get(`/api/gallery/${eventCode}/photos`, {
      params: { page },
    });
    return response.data;
  }

  async getPhoto(
    eventCode: string,
    photoId: string
  ): Promise<PhotoResponse> {
    const response = await this.client.get(
      `/api/gallery/${eventCode}/photos/${photoId}`
    );
    return response.data;
  }

  async deletePhotos(
    eventCode: string,
    photoIds: string[]
  ): Promise<ApiResponse> {
    const response = await this.client.delete(
      `/api/gallery/${eventCode}/photos`,
      {
        data: { photoIds },
      }
    );
    return response.data;
  }

  async downloadZip(
    eventCode: string,
    photoIds?: string[]
  ): Promise<Blob> {
    const response = await this.client.post(
      `/api/gallery/${eventCode}/download`,
      { photoIds },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // Method to create SSE connection for real-time updates
  createEventStream(eventCode: string): EventSource {
    const url = `${API_BASE_URL}/api/gallery/${eventCode}/photos/stream`;
    return new EventSource(url, { withCredentials: true });
  }
}

// Create singleton instance
export const galleryApiClient = new GalleryApiClient();
export default galleryApiClient;