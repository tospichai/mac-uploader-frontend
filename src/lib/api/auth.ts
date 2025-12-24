import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ProfileUpdateRequest,
  ProfileResponse,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Debug logging to verify API URL
console.log("Auth API Base URL:", API_BASE_URL);

class AuthApiClient {
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

  // Token management methods
  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.client.post("/api/auth/login", credentials);
      const data = response.data.data;

      if (data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error: unknown) {
      console.error("Login error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || axiosError.response?.data?.error || "Login failed",
      };
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.client.post("/api/auth/register", userData);
      return response.data;
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        data: {
          message: axiosError.response?.data?.message || axiosError.response?.data?.error || "Registration failed",
        }
      };
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await this.client.get("/api/auth/me");
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get profile error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || axiosError.response?.data?.error || "Failed to get profile",
      };
    }
  }

  async updateProfile(
    userData: ProfileUpdateRequest | FormData
  ): Promise<ProfileResponse> {
    try {
      // If userData is FormData, don't set Content-Type header (let browser set it with boundary)
      const config =
        userData instanceof FormData
          ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
          : {};

      const response = await this.client.put(
        "/api/auth/profile",
        userData,
        config
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Update profile error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || axiosError.response?.data?.error || "Failed to update profile",
      };
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post("/api/auth/logout");
      this.clearToken();
      return response.data;
    } catch (error: unknown) {
      console.error("Logout error:", error);
      // Even if the server call fails, we should clear the local token
      this.clearToken();
      return {
        success: true,
        message: "Logged out successfully",
      };
    }
  }

  // System information endpoint
  async getSystemInformation(): Promise<{
    success: boolean;
    data?: { backendEndpoint: string; frontendEndpoint: string };
    message?: string;
  }> {
    try {
      const response = await this.client.get("/api/api-information");
      return response.data;
    } catch (error: unknown) {
      console.error("Get api information error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || axiosError.response?.data?.error || "Failed to get api information",
      };
    }
  }

  // Generate new API key
  async generateApiKey(): Promise<{
    success: boolean;
    apiKey?: string;
    message?: string;
  }> {
    try {
      const response = await this.client.post("/api/auth/generate-api-key");
      return response.data.data;
    } catch (error: unknown) {
      console.error("Generate API key error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || axiosError.response?.data?.error || "Failed to generate API key",
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get current token
  getCurrentToken(): string | null {
    return this.getToken();
  }
}

// Create singleton instance
export const authApiClient = new AuthApiClient();
export default authApiClient;
