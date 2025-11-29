import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  ApiResponse,
  EventCreateRequest,
  EventResponse,
  EventsListResponse,
  EventStatisticsResponse,
  EventUpdateRequest,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Debug logging to verify API URL
console.log("Auth API Base URL:", API_BASE_URL);

class EventApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error("Auth API Error:", error);
        // If we get a 401 Unauthorized, clear the stored token
        if (error.response?.status === 401) {
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  async getEventsList(
    page: number = 1,
    limit: number = 10
  ): Promise<EventsListResponse> {
    const response = await this.client.get(`/api/events`, {
      params: { page, limit },
    });
    return response.data;
  }

  async createEvent(eventData: EventCreateRequest): Promise<EventResponse> {
    const response = await this.client.post(`/api/events`, eventData);
    return response.data;
  }

  async updateEvent(
    eventCode: string,
    eventData: EventUpdateRequest
  ): Promise<EventResponse> {
    const response = await this.client.put(
      `/api/events/${eventCode}`,
      eventData
    );
    return response.data;
  }

  async deleteEvent(eventCode: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/api/events/${eventCode}`);
    return response.data;
  }

  async publishEvent(eventCode: string): Promise<EventResponse> {
    const response = await this.client.post(`/api/events/${eventCode}/publish`);
    return response.data;
  }

  async unpublishEvent(eventCode: string): Promise<EventResponse> {
    const response = await this.client.post(
      `/api/events/${eventCode}/unpublish`
    );
    return response.data;
  }

  async getEventStatistics(
    eventCode?: string
  ): Promise<EventStatisticsResponse> {
    const url = eventCode
      ? `/api/events/${eventCode}/statistics`
      : `/api/events/statistics`;
    const response = await this.client.get(url);
    return response.data;
  }

  async validateFolderName(
    folderName: string,
    excludeEventCode?: string
  ): Promise<ApiResponse<{ available: boolean }>> {
    const response = await this.client.post(`/api/events/validate-folder`, {
      folderName,
      excludeEventCode,
    });
    return response.data;
  }

  async validateEventAccess(
    eventCode: string
  ): Promise<ApiResponse<{ accessible: boolean }>> {
    const response = await this.client.get(
      `/api/events/${eventCode}/validate-access`
    );
    return response.data;
  }
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }
  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }
}

// Create singleton instance
export const eventApiClient = new EventApiClient();
export default eventApiClient;
