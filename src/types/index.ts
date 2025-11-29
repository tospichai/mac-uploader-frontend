export interface Photo {
  photoId: string;
  displayUrl?: string;
  downloadUrl?: string;
  lastModified?: string;
  originalName?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalPhotos: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  hasMultiplePages: boolean;
  nextPage?: number;
  prevPage?: number;
  pages: Array<{
    number: number;
    active: boolean;
  }>;
}

export interface PhotosResponse {
  success: boolean;
  message: string;
  photos: Photo[];
  pagination: Pagination;
}

export interface PhotoResponse {
  success: boolean;
  message: string;
  base64: string;
  photoId: string;
}

export interface EventInfo {
  id: string;
  title: string;
  eventDate: string;
  subtitle?: string;
  description?: string;
  folderName: string;
  defaultLanguage: string;
  isPublished: boolean;
  photographerName: string;
  createdAt: string;
  totalPhotos: number;
  totalSize?: number;
}

export interface EventResponse {
  success: boolean;
  message?: string;
  id?: string;
  title?: string;
  eventDate?: string;
  subtitle?: string;
  description?: string;
  folderName?: string;
  defaultLanguage?: string;
  isPublished?: boolean;
  photographerName?: string;
  createdAt?: string;
  totalPhotos?: number;
  totalSize?: number;
  data?: EventInfo;
}

export interface EventCreateRequest {
  title: string;
  eventDate: string;
  subtitle?: string;
  description?: string;
  folderName: string;
  defaultLanguage: string;
  isPublished: boolean;
}

export interface EventUpdateRequest {
  title?: string;
  eventDate?: string;
  subtitle?: string;
  description?: string;
  folderName?: string;
  defaultLanguage?: string;
  isPublished?: boolean;
}

export interface EventsListResponse {
  success: boolean;
  events: EventInfo[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface EventStatisticsResponse {
  success: boolean;
  data: {
    totalEvents: number;
    publishedEvents: number;
    draftEvents: number;
    totalPhotos: number;
    totalSize: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface SSEPhotoData {
  type: "photo_update";
  eventCode: string;
  photo: {
    photoId: string;
    displayUrl?: string;
    downloadUrl?: string;
    originalName?: string;
    lastModified?: string;
  };
}

export interface SSEMessage {
  type: "photo_update" | "heartbeat" | "connected";
  eventCode?: string;
  photo?: SSEPhotoData["photo"];
}

// Re-export authentication types
export * from './auth';
