"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FavoritesPage from "@/components/FavoritesPage";
import TabMenu from "@/components/TabMenu";
import { EventInfo } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import apiClient from "@/lib/api/client";

export default function FavoritesRoute() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { t } = useTranslation();

  // Parse slug to extract photographer and event
  // Format: photographer_event
  const parts = String(slug || "").split("_");
  const photographer = parts[0] || "unknown";
  const event = parts[1] || "unknown";
  const eventCode = event; // Server only uses event part

  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("favorites");

  // Load initial data
  useEffect(() => {
    loadEventData();
  }, [eventCode]);

  const loadEventData = async () => {
    try {
      // For now, create mock event info since server doesn't have this endpoint yet
      const mockEventInfo: any = {
        eventCode,
        eventName: event.charAt(0).toUpperCase() + event.slice(1),
        photographerName: photographer,
        createdAt: new Date().toISOString(),
        totalPhotos: 0,
      };
      setEventInfo(mockEventInfo);
    } catch (err) {
      console.error("Error loading event info:", err);
      setError("Failed to load event information");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPhoto = async (photoId: string) => {
    try {
      let base64: string;

      // Check if using local storage
      if (apiClient.isUsingLocalStorage()) {
        // For local storage, fetch image and convert to base64
        base64 = await apiClient.getPhotoAsBase64FromUrl(eventCode, photoId);
        console.log(
          `Downloaded photo ${photoId} using local URL to base64 conversion`
        );
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
            <h1 className="text-2xl font-thai-bold text-red-600 mb-4 thai-text">
              {t("gallery.error")}
            </h1>
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
      <FavoritesPage
        eventInfo={eventInfo}
        eventCode={eventCode}
        onDownloadPhoto={handleDownloadPhoto}
      />
      <TabMenu
        activeTab={activeTab}
        onTabChange={setActiveTab}
        eventCode={eventCode}
        photographer={photographer}
      />
    </>
  );
}
