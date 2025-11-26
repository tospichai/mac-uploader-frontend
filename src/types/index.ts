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
  eventCode: string;
  eventName: string;
  photographerName: string;
  createdAt: string;
  totalPhotos: number;
}

export interface EventResponse {
  success: boolean;
  data: EventInfo;
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
