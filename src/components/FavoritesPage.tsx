"use client";

import { useState } from "react";
import { EventInfo } from "@/types";
import PhotoGrid from "./PhotoGrid";
import ImageModal from "./ImageModal";
import NotificationAlert from "./NotificationAlert";
import { useTranslation } from "@/hooks/useTranslation";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart, Download, Trash2 } from "lucide-react";

interface FavoritesPageProps {
  eventInfo: EventInfo | null;
  eventCode: string;
  onDownloadPhoto: (photoId: string) => void;
}

export default function FavoritesPage({
  eventInfo,
  eventCode,
  onDownloadPhoto,
}: FavoritesPageProps) {
  const { t } = useTranslation();
  const { getFavoritesForEvent, clearFavoritesForEvent } = useFavorites();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  const favorites = getFavoritesForEvent(eventCode);

  // Convert favorites back to Photo format for PhotoGrid
  const favoritePhotos = favorites.map(fav => ({
    photoId: fav.photoId,
    displayUrl: fav.imageUrl,
    downloadUrl: fav.imageUrl,
  }));

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleNewPhoto = () => {
    // Not applicable for favorites page
  };

  const handleClearAllFavorites = () => {
    if (window.confirm(t("favorites.confirmClearAll"))) {
      clearFavoritesForEvent(eventCode);
      showNotification(t("favorites.clearedAll"), "success");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA]">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={32} />
            {t("favorites.title")}
          </h1>
          {eventInfo && (
            <>
              <p className="text-gray-600">
                {t("gallery.event")}:{" "}
                <span className="font-semibold">{eventInfo.eventName}</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {t("favorites.count")}:{" "}
                <span className="font-semibold">{favorites.length}</span>
              </p>
            </>
          )}
        </header>

        {/* Actions */}
        {favorites.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearAllFavorites}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              <Trash2 size={16} />
              {t("favorites.clearAll")}
            </button>
          </div>
        )}

        {/* Main Content */}
        <main>
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Heart className="text-gray-300 mb-4" size={64} />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                {t("favorites.empty.title")}
              </h2>
              <p className="text-gray-500 text-center max-w-md">
                {t("favorites.empty.description")}
              </p>
            </div>
          ) : (
            <PhotoGrid
              photos={favoritePhotos}
              onImageClick={handleImageClick}
              onDownloadPhoto={onDownloadPhoto}
              onNewPhoto={handleNewPhoto}
              eventCode={eventCode}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>{t("common.photoGallery")}</p>
        </footer>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal imageUrl={selectedImage} onClose={closeModal} />
      )}

      {/* Notification */}
      {notification && (
        <NotificationAlert
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}