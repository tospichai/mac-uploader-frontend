"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GalleryPage from "@/components/GalleryPage";
import TabMenu from "@/components/TabMenu";
import { Photo, GalleryEventDetails, Pagination } from "@/types";
import apiClient from "@/lib/api/client";
import { createSSEClient } from "@/lib/api/sse";
import { useTranslation } from "@/hooks/useTranslation";

export default function GalleryRoute() {
  const params = useParams();
  const slug = params.slug as string;

  // Parse slug to extract event
  // Format: event
  const event = String(slug || "");
  const eventCode = event; // Server only uses event part

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [eventInfo, setEventInfo] = useState<GalleryEventDetails | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("gallery");
  const { t } = useTranslation();

  // Load initial data
  useEffect(() => {
    loadEventData();
    loadPhotos(currentPage);
  }, [eventCode, currentPage]);

  // Set up SSE connection
  useEffect(() => {
    if (!eventCode) return;

    const sseClient = createSSEClient(
      eventCode,
      apiClient.getEventStreamUrl(eventCode)
    );

    sseClient.onMessage((message) => {
      if (message.type === "photo_update" && message.photo) {
        // Add new photo to the beginning of the list
        setPhotos((prevPhotos) => {
          // Check if photo already exists to avoid duplicates
          if (prevPhotos.some(p => p.id === message.photo!.photoId)) {
            return prevPhotos;
          }

          const newPhoto: Photo = {
            id: message.photo!.photoId,
            originalName: message.photo!.originalName,
            lastModified: message.photo!.lastModified,
            originalUrl: message.photo!.downloadUrl,
            thumbnailUrl: message.photo!.displayUrl,
          };
          return [newPhoto, ...prevPhotos];
        });

        // Update pagination total count if available
        setPagination((prev) =>
          prev
            ? {
              ...prev,
              totalPhotos: prev.totalPhotos + 1
            }
            : null
        );
      }
    });

    sseClient.onConnect(() => {
      console.log("SSE connected for event:", eventCode);
    });

    sseClient.onError((error) => {
      console.error("SSE connection error:", error);
    });

    sseClient.connect();

    return () => {
      sseClient.disconnect();
    };
  }, [eventCode]);

  const loadEventData = async () => {
    try {
      const response = await apiClient.getGalleryEventDetails(eventCode);
      if (response.success) {
        setEventInfo(response.data);
      } else {
        setError("Failed to load event information");
      }
    } catch (err) {
      console.error("Error loading event info:", err);
      setError("Failed to load event information");
    }
  };

  const loadPhotos = async (page: number) => {
    try {
      setLoading(true);
      const response = await apiClient.getPhotos(eventCode, page);

      if (response.success) {
        setPhotos(response.data.photos);
        setPagination(response.data.pagination);

        // Update total count in event info - REMOVED as GalleryEventDetails doesn't track totalPhotos
        // and header doesn't display it.
        /* 
        if (eventInfo) {
           // Logic separate if needed
        }
        */
      } else {
        setError("Failed to load photos");
      }
    } catch (err) {
      console.error("Error loading photos:", err);
      setError("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        eventInfo={eventInfo}
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
