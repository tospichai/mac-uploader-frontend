"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  AuthContextType,
  Photographer,
  LoginRequest,
  RegisterRequest,
  ProfileUpdateRequest,
} from "@/types/auth";
import authApiClient from "@/lib/api/auth";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Photographer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Computed property
  const isAuthenticated = !!user && !!token;

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = authApiClient.getCurrentToken();
        if (storedToken) {
          setToken(storedToken);
          // Verify token with server and get user data
          const profileResponse = await authApiClient.getProfile();
          if (profileResponse.success && profileResponse.user) {
            setUser(profileResponse.user);
          } else {
            // Token is invalid, clear it
            authApiClient.clearToken();
            setToken(null);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        authApiClient.clearToken();
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApiClient.login(credentials);

      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        // Use window.location for more reliable redirect
        router.push("/dashboard");
      } else {
        // Only throw error if response.success is explicitly false
        if (response.success === false) {
          throw new Error(response.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApiClient.register(userData);

      if (response.success && response.token && response.user) {
        // After successful registration, automatically log in the user
        setToken(response.token);
        setUser(response.user);
        // Store the token
        authApiClient.setToken(response.token);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, we should clear local state
    } finally {
      setUser(null);
      setToken(null);
      authApiClient.clearToken();
      setIsLoading(false);
      router.push("/");
    }
  };

  const updateProfile = async (
    userData: ProfileUpdateRequest | FormData
  ): Promise<Photographer> => {
    setIsLoading(true);
    try {
      const response = await authApiClient.updateProfile(userData);

      if (response.success && response.user) {
        setUser(response.user);
        return response.user
      } else {
        throw new Error(response.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      const storedToken = authApiClient.getCurrentToken();
      if (storedToken) {
        setToken(storedToken);
        const profileResponse = await authApiClient.getProfile();
        if (profileResponse.success && profileResponse.user) {
          setUser(profileResponse.user);
        } else {
          authApiClient.clearToken();
          setToken(null);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      authApiClient.clearToken();
      setToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
