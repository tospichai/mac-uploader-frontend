"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import GalleryPage from "@/components/GalleryPage";
import TabMenu from "@/components/TabMenu";
import { Photo } from "@/types";
import apiClient from "@/lib/api/client";
import { createWebSocketClient } from "@/lib/api/socket";
import { useTranslation } from "@/hooks/useTranslation";
import { useEventDetails, usePhotos, galleryKeys } from "@/hooks/useGallery";

export default function GalleryRoute() {
  const params = useParams();
  const queryClient = useQueryClient();
  const slug = params.slug as string;

  // Parse slug to extract event
  // Format: event
  const event = String(slug || "");
  const eventCode = event; // Server only uses event part

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("gallery");
  const { t } = useTranslation();

  // Use React Query hooks
  const {
    data: eventInfo,
    isLoading: isEventLoading,
    error: eventError
  } = useEventDetails(eventCode);

  const {
    data: photosData,
    isLoading: isPhotosLoading,
    error: photosError
  } = usePhotos(eventCode, currentPage);

  const photos = photosData?.photos || [];
  const pagination = photosData?.pagination || null;
  const loading = isEventLoading || isPhotosLoading;
  const error = eventError?.message || photosError?.message || null;

  // Set up WebSocket connection
  useEffect(() => {
    if (!eventCode) return;

    const streamUrl = apiClient.getEventStreamUrl(eventCode);

    const socketClient = createWebSocketClient(
      eventCode,
      streamUrl
    );

    socketClient.onMessage((message) => {
      // Handle "connected" message
      if ((message as any).type === "connected") {
        console.log("WebSocket connected to event:", (message as any).data.eventCode);
        return;
      }

      // Handle photo updates
      if (message.type === "photo_update" && (message as any).data?.photo) {
        const photoData = (message as any).data.photo;
        const newPhoto: Photo = {
          id: photoData.photoId,
          originalName: photoData.originalName,
          lastModified: photoData.lastModified,
          originalUrl: photoData.downloadUrl,
          thumbnailUrl: photoData.displayUrl,
        };

        // Update the query cache for the first page of photos
        queryClient.setQueryData(
          galleryKeys.photosPage(eventCode, 1),
          (oldData: any) => {
            if (!oldData) return oldData;

            // Check if photo already exists
            if (oldData.photos.some((p: Photo) => p.id === newPhoto.id)) {
              return oldData;
            }

            return {
              ...oldData,
              photos: [newPhoto, ...oldData.photos],
              pagination: {
                ...oldData.pagination,
                totalPhotos: oldData.pagination.totalPhotos + 1
              }
            };
          }
        );
      }
    });

    socketClient.onConnect(() => {
      console.log("WebSocket connected for event:", eventCode);
    });

    socketClient.onError((error) => {
      console.error("WebSocket connection error:", error);
    });

    socketClient.connect();

    return () => {
      socketClient.disconnect();
    };
  }, [eventCode, queryClient]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPhoto = async (photoId: string) => {
    try {
      let base64: string;

      // Check if using local storage
      if (apiClient.isUsingLocalStorage()) {
        // For local storage, fetch image and convert to base64
        base64 = await apiClient.getPhotoAsBase64FromUrl(eventCode, photoId);
        console.log(`Downloaded photo ${photoId} using local URL to base64 conversion`);
      } else {
        // For S3 storage, use existing base64 method
        base64 = await apiClient.downloadPhotoAsBase64(eventCode, photoId);
        console.log(`Downloaded photo ${photoId} using S3 base64`);
      }

      // Create download link (same logic for both modes)
      const link = document.createElement("a");
      link.href = base64;
      link.download = `photo_${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Download error:", err);
      alert(t("gallery.downloadError"));
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-thai-bold text-red-600 mb-4 thai-text">{t("gallery.error")}</h1>
            <p className="text-gray-700 mb-6 thai-text">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-thai-medium"
            >
              {t("gallery.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GalleryPage
        eventInfo={eventInfo || null}
        photos={photos}
        pagination={pagination}
        loading={loading}
        onPageChange={handlePageChange}
        onDownloadPhoto={handleDownloadPhoto}
        eventCode={eventCode}
      />
      <TabMenu
        activeTab={activeTab}
        onTabChange={setActiveTab}
        eventCode={eventCode}
      />
    </>
  );
}
