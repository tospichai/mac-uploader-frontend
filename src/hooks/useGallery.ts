import { useQuery, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { GalleryEventDetails, Photo, Pagination } from "@/types";

// Keys for query cache
export const galleryKeys = {
    all: ["gallery"] as const,
    event: (code: string) => [...galleryKeys.all, "event", code] as const,
    photos: (code: string) => [...galleryKeys.all, "photos", code] as const,
    photosPage: (code: string, page: number) => [...galleryKeys.photos(code), "page", page] as const,
};

export function useEventDetails(eventCode: string) {
    return useQuery({
        queryKey: galleryKeys.event(eventCode),
        queryFn: async () => {
            const response = await apiClient.getGalleryEventDetails(eventCode);
            if (!response.success) {
                throw new Error("Failed to load event information");
            }
            return response.data;
        },
        enabled: !!eventCode,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

interface PhotosResponse {
    photos: Photo[];
    pagination: Pagination;
}

export function usePhotos(eventCode: string, page: number) {
    return useQuery({
        queryKey: galleryKeys.photosPage(eventCode, page),
        queryFn: async (): Promise<PhotosResponse> => {
            const response = await apiClient.getPhotos(eventCode, page);
            if (!response.success) {
                throw new Error("Failed to load photos");
            }
            return response.data;
        },
        enabled: !!eventCode,
        placeholderData: keepPreviousData, // Keep showing previous page data while fetching new page
        staleTime: 60 * 1000, // 1 minute
    });
}
