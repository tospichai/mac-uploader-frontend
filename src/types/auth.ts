export interface Photographer {
  id: number;
  username: string;
  email: string;
  displayName: string;
  logoUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  apiKey?: string;
  storageQuotaMb: number;
  storageUsedMb: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Photographer;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    message: string;
    user?: Photographer;
    token?: string;
  };
}

export interface ProfileUpdateRequest {
  displayName?: string;
  logoUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user?: Photographer;
}

export interface AuthContextType {
  user: Photographer | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: ProfileUpdateRequest | FormData) => Promise<void>;
  checkAuth: () => Promise<void>;
}