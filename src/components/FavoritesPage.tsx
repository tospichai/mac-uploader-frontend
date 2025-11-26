"use client";

import { useState } from "react";
import { EventInfo } from "@/types";
import PhotoGrid from "./PhotoGrid";
import ImageModal from "./ImageModal";
import NotificationAlert from "./NotificationAlert";
import { useTranslation } from "@/hooks/useTranslation";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart, Trash2 } from "lucide-react";
import Image from "next/image";

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
  const favoritePhotos = favorites.map((fav) => ({
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

  const RenderContent = () => {
    if (favorites.length) {
      return (
        <PhotoGrid
          photos={favoritePhotos}
          onImageClick={handleImageClick}
          onDownloadPhoto={onDownloadPhoto}
          onNewPhoto={handleNewPhoto}
          eventCode={eventCode}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Heart className="text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {t("favorites.empty.title")}
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            {t("favorites.empty.description")}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA]">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mx-auto container flex flex-col sm:flex-row justify-center gap-4 items-center">
            <div className="flex justify-center rounded-xl">
              <Image
                src="/khai.jpg"
                alt="logo"
                width={150}
                height={150}
                className="rounded-full border-4 border-white shadow-md"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Wedding 23.11.25
                <br />
              </h1>
              <p className="text-gray-500 text-lg mt-1">
                <span className="font-semibold">H&N @Leaf Garden</span>
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center justify-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={32} />
            {t("favorites.title")}
          </h1>
          {/* Actions */}
          {favorites.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearAllFavorites}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)] transition-all duration-200 cursor-pointer"
              >
                <Trash2 size={16} />
                {t("favorites.clearAll")}
              </button>
            </div>
          )}
          {RenderContent()}
        </main>

        {/* Footer */}
        <footer className="text-center my-24 text-gray-100 text-sm">
          <p>© 2025 Foldex Gallery | All Rights Reserved.</p>
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
