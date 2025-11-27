"use client";

import { useState, useEffect } from "react";
import { EventInfo } from "@/types";
import PhotoGrid from "./PhotoGrid";
import ImageModal from "./ImageModal";
import NotificationAlert from "./NotificationAlert";
import { useTranslation } from "@/hooks/useTranslation";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSelection } from "@/contexts/SelectionContext";
import { useGridView } from "@/contexts/GridViewContext";
import {
  Heart,
  Trash2,
  MousePointer2,
  X,
  Columns,
  Rows,
  CheckSquare,
} from "lucide-react";
import { siFacebook, siInstagram } from "simple-icons";
import SimpleIcon from "./SimpleIcon";
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
  const {
    getFavoritesForEvent,
    clearFavoritesForEvent,
    isFavorite,
    toggleFavorite,
  } = useFavorites();
  const {
    isSelectionMode,
    selectedCount,
    toggleSelectionMode,
    selectedPhotos,
    clearSelection,
    MAX_SELECTION_LIMIT,
    setDownloadFunction,
    showNotification: selectionShowNotification,
    isDownloading,
    handleBatchDownload,
    togglePhotoSelection,
  } = useSelection();
  const { isSingleColumn, toggleGridView, isMobile } = useGridView();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
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

  // Set the download function in the context when component mounts or when onDownloadPhoto changes
  useEffect(() => {
    setDownloadFunction(async (photoId: string) => {
      try {
        await onDownloadPhoto(photoId);
      } catch (error) {
        console.error("Download error:", error);
        throw error;
      }
    });
  }, [onDownloadPhoto, setDownloadFunction]);

  // Clear any existing selections when FavoritesPage mounts
  useEffect(() => {
    clearSelection();
  }, [clearSelection]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    if (favorites.length === 0) {
      const timeoutId = setTimeout(() => {
        setSelectedImage(null);
        if (isSelectionMode) {
          toggleSelectionMode();
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [favorites, isSelectionMode, toggleSelectionMode]);

  const handleNewPhoto = () => {
    // Not applicable for favorites page
  };

  const handleSelectAll = () => {
    if (selectedCount === favorites.length) {
      // Deselect all
      clearSelection();
    } else {
      const favoriteUnselects = favoritePhotos.filter(
        (favoritePhoto) => !selectedPhotos.has(favoritePhoto.photoId)
      );

      favoriteUnselects.forEach((photoId) => {
        togglePhotoSelection(photoId.photoId);
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCount === 0) {
      showNotification(t("gallery.noSelection"), "warning");
      return;
    }

    if (window.confirm(t("favorites.confirmDeleteSelected"))) {
      // Get selected photo IDs and remove them from favorites
      selectedPhotos.forEach((photoId) => {
        // Remove from favorites context
        const favoriteToRemove = favorites.find(
          (fav) => fav.photoId === photoId
        );
        if (favoriteToRemove) {
          toggleFavorite(eventCode, favoriteToRemove);
        }
      });

      clearSelection();
      showNotification(t("favorites.deletedSelected"), "success");
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
          <h2 className="text-xl font-thai-semibold text-gray-600 mb-2 thai-text">
            {t("favorites.empty.title")}
          </h2>
          <p className="text-gray-500 text-center max-w-md thai-text">
            {t("favorites.empty.description")}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA]">
      <div className="mx-auto px-2 sm:px-4 py-8">
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
              <h1 className="text-2xl font-thai-bold text-gray-800 thai-text">
                Wedding 23.11.25
                <br />
              </h1>
              <p className="text-gray-500 text-lg mt-1 thai-text">
                <span className="font-thai-semibold">H&N @Leaf Garden</span>
              </p>
              {/* Social Media Icons */}
              <div className="flex items-center gap-3 mt-3 justify-center">
                <a
                  href="https://simpleicons.org/?q=facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <SimpleIcon icon={siFacebook} size={26} />
                </a>
                <a
                  href="https://simpleicons.org/?q=instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <SimpleIcon icon={siInstagram} size={26} />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <h1 className="text-3xl font-thai-bold text-gray-800 mb-8 flex items-center justify-center gap-2 thai-text">
            {t("favorites.title")}
            <Heart className="text-red-500 fill-red-500" size={32} />
          </h1>
          {/* Grid View and Selection Controls */}
          <div className="sticky top-0 z-10 bg-white/60 backdrop-blur-md py-3 -mx-2 sm:-mx-4 px-4 border-b border-white/20 mb-4">
            {isMobile ? (
              // Mobile Layout: Two rows
              <div className="flex flex-col gap-3">
                {/* Top row: View button (left) + Select/Cancel button (right) */}
                <div className="flex justify-between items-center">
                  {/* Grid View Toggle Button */}
                  <button
                    onClick={toggleGridView}
                    className={`px-4 py-2 rounded-xl border backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] transition-all duration-200 flex items-center gap-2 cursor-pointer h-10.5 font-semibold bg-white/70 ${
                      isSingleColumn
                        ? "bg-gray-200 border-transparent ring-2 ring-[#00C7A5]/60 text-[#00C7A5]"
                        : "border-white/60 text-gray-700"
                    }`}
                    title={
                      isSingleColumn
                        ? t("favorites.doubleColumn")
                        : t("favorites.singleColumn")
                    }
                  >
                    {isSingleColumn ? (
                      <Columns size={16} />
                    ) : (
                      <Rows size={16} />
                    )}{" "}
                    {t("favorites.view")}
                  </button>

                  {/* Selection Controls - Top Row */}
                  {favoritePhotos.length && (
                    <div className="flex items-center gap-3">
                      {!isSelectionMode ? (
                        <button
                          onClick={toggleSelectionMode}
                          className="px-4 py-2 bg-[#00C7A5] text-white rounded-xl shadow-[0_4px_12px_rgba(0,199,165,0.3)] hover:bg-[#00B595] hover:shadow-[0_6px_16px_rgba(0,199,165,0.4)] flex items-center gap-2 cursor-pointer h-10.5 font-bold"
                        >
                          <MousePointer2 size={18} />
                          {t("favorites.select")}
                        </button>
                      ) : (
                        <button
                          onClick={toggleSelectionMode}
                          className="px-4 py-2 bg-white/70 text-gray-700 rounded-xl border border-white/60 backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:bg-white hover:text-gray-900 flex items-center gap-2 cursor-pointer font-bold"
                        >
                          <X size={18} />
                          {t("favorites.cancel")}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom row: Delete Selected + Select All (right-aligned) */}
                {isSelectionMode && (
                  <div className="flex justify-between items-center gap-3">
                    {selectedCount > 0 ? (
                      <button
                        onClick={handleDeleteSelected}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)] flex items-center gap-2 cursor-pointer font-thai-medium"
                      >
                        <Trash2 size={16} />
                        {t("favorites.deleteSelected")}
                      </button>
                    ) : (
                      <div></div>
                    )}
                    {favorites.length > 0 && (
                      <button
                        onClick={handleSelectAll}
                        className="px-4 py-2 bg-white/70 text-gray-700 rounded-xl border border-white/60 backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:bg-white hover:text-gray-900 flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <CheckSquare size={18} />
                        {selectedCount === favorites.length
                          ? t("favorites.deselectAll")
                          : t("favorites.selectAll")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Desktop Layout: Single row
              <div className="flex justify-between items-center gap-4">
                {/* Grid View Toggle Button - Desktop Only */}
                <div className="flex justify-center rounded-xl">
                  <button
                    onClick={toggleGridView}
                    className={`px-4 py-2 rounded-xl border backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] transition-all duration-200 flex items-center gap-2 cursor-pointer h-10.5 font-semibold bg-white/70 ${
                      isSingleColumn
                        ? "bg-gray-200 border-transparent ring-2 ring-[#00C7A5]/60 text-[#00C7A5]"
                        : "border-white/60 text-gray-700"
                    }`}
                    title={
                      isSingleColumn
                        ? t("favorites.doubleColumn")
                        : t("favorites.singleColumn")
                    }
                  >
                    {isSingleColumn ? (
                      <Columns size={16} />
                    ) : (
                      <Rows size={16} />
                    )}{" "}
                    {t("favorites.view")}
                  </button>
                </div>

                {/* Selection Controls - Desktop */}
                <div className="flex items-center gap-4">
                  {!isSelectionMode ? (
                    <button
                      onClick={toggleSelectionMode}
                      className="px-4 py-2 bg-[#00C7A5] text-white rounded-xl shadow-[0_4px_12px_rgba(0,199,165,0.3)] hover:bg-[#00B595] hover:shadow-[0_6px_16px_rgba(0,199,165,0.4)] flex items-center gap-2 cursor-pointer h-10.5 font-bold"
                    >
                      <MousePointer2 size={18} />
                      {t("favorites.select")}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      {selectedCount > 0 && (
                        <button
                          onClick={handleDeleteSelected}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-red-600 hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)] flex items-center gap-2 cursor-pointer font-thai-medium"
                        >
                          <Trash2 size={16} />
                          {t("favorites.deleteSelected")}
                        </button>
                      )}
                      {favorites.length > 0 && (
                        <button
                          onClick={handleSelectAll}
                          className="px-4 py-2 bg-white/70 text-gray-700 rounded-xl border border-white/60 backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:bg-white hover:text-gray-900 flex items-center gap-2 cursor-pointer font-bold"
                        >
                          <CheckSquare size={18} />
                          {selectedCount === favorites.length
                            ? t("favorites.deselectAll")
                            : t("favorites.selectAll")}
                        </button>
                      )}
                      <button
                        onClick={toggleSelectionMode}
                        className="px-4 py-2 bg-white/70 text-gray-700 rounded-xl border border-white/60 backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:bg-white hover:text-gray-900 flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <X size={18} />
                        {t("favorites.cancel")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {RenderContent()}
        </main>

        {/* Footer */}
        <footer className="flex justify-center flex-col items-center mt-4 mb-24 text-[#00C7A5] text-sm">
          <Image
            src="/logo.png"
            alt="logo"
            width={42}
            height={42}
            className="mb-2"
          />
          <p>© 2025 Live Moments Gallery | All Rights Reserved.</p>
        </footer>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          photos={favoritePhotos}
          currentIndex={selectedImageIndex}
          onClose={closeModal}
          onDownloadPhoto={onDownloadPhoto}
          onToggleFavorite={(photo) => toggleFavorite(eventCode, photo)}
          isFavorite={(photo) => isFavorite(eventCode, photo.photoId)}
          eventCode={eventCode}
        />
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
