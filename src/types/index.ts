export interface Photo {
  lastModified?: string;
  originalName?: string;
  id: string;
  originalUrl?: string;
  thumbnailUrl?: string;
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
  data: {
    photos: Photo[];
    pagination: Pagination;
  }
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

export interface PhotographerProfile {
  displayName: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
}

export interface GalleryEventDetails {
  event: {
    title: string;
    subtitle: string | null;
    description: string | null;
    eventDate: string;
    folderName: string;
  };
  photographer: PhotographerProfile;
}

export interface GalleryEventResponse {
  success: boolean;
  data: GalleryEventDetails;
}

export interface EventResponse {
  success: boolean;
  message: string;
  data: EventInfo;
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
  data: {
    events: EventInfo[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEvents: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
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
export * from "./auth";
