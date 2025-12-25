"use client";

import { useState, useEffect } from "react";
import { Photo, GalleryEventDetails, Pagination } from "@/types";
import PhotoGrid from "./PhotoGrid";
import ImageModal from "./ImageModal";
import NotificationAlert from "./NotificationAlert";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelection } from "@/contexts/SelectionContext";
import { useGridView } from "@/contexts/GridViewContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import Footer from "./Footer";
import {
  Images,
  X,
  MousePointer2,
  Columns,
  Rows,
} from "lucide-react";
import EventHeader from "./EventHeader";
import { AnimatePresence } from "framer-motion";
import SmartPagination from "./SmartPagination";

interface GalleryPageProps {
  eventInfo: GalleryEventDetails | null;
  photos: Photo[];
  pagination: Pagination | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onDownloadPhoto: (photoId: string) => void;
  eventCode: string;
  newPhotoIds: Set<string>;
}

export default function GalleryPage({
  eventInfo,
  photos,
  pagination,
  loading,
  onPageChange,
  onDownloadPhoto,
  eventCode,
  newPhotoIds,
}: GalleryPageProps) {
  const { t } = useTranslation();
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
  } = useSelection();
  const { isSingleColumn, toggleGridView, isMobile } = useGridView();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

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

  // Clear any existing selections when GalleryPage mounts
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

  const handleNewPhoto = () => {
    showNotification(t("gallery.newPhoto"), "success");
  };

  const RenderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-[#00C7A5]"></div>
        </div>
      );
    } else if (photos.length) {
      return (
        <>
          <PhotoGrid
            photos={photos}
            onImageClick={handleImageClick}
            onDownloadPhoto={onDownloadPhoto}
            onNewPhoto={handleNewPhoto}
            eventCode={eventCode}
            newPhotoIds={newPhotoIds}
          />

          {/* Pagination */}
          {pagination && pagination.hasMultiplePages && (
            <div className="flex justify-center items-center space-x-2 mt-8 pb-4">
              {pagination.hasPrevPage && (
                <button
                  onClick={() => onPageChange(pagination.prevPage!)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all duration-200 cursor-pointer"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              <div className="flex space-x-1">
                {/* Use smart pagination logic */}
                <SmartPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={onPageChange}
                />
              </div>

              {pagination.hasNextPage && (
                <button
                  onClick={() => onPageChange(pagination.nextPage!)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all duration-200 cursor-pointer"
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Images className="text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-thai-semibold text-gray-600 mb-2 thai-text">
            {t("gallery.empty.title")}
          </h2>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA] flex flex-col">
      <div className="flex-grow mx-auto px-2 sm:px-4 py-8">
        {/* Header with Selection Controls */}
        {/* Header with Selection Controls */}
        <EventHeader eventInfo={eventInfo} />

        {/* Grid View and Selection Controls */}
        <div className="sticky top-0 z-10 flex justify-between items-center gap-4 bg-white/60 backdrop-blur-md py-3 -mx-2 sm:-mx-4 px-4 border-b border-white/20 mb-4">
          {/* Grid View Toggle Button - Mobile Only */}
          {isMobile ? (
            <button
              onClick={toggleGridView}
              className={`px-4 py-2 rounded-xl border backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] transition-all duration-200 flex items-center gap-2 cursor-pointer h-10.5 font-semibold bg-white/70 ${isSingleColumn
                ? "bg-gray-200 border-transparent ring-2 ring-[#00C7A5]/60 text-[#00C7A5]"
                : "border-white/60 text-gray-700"
                }`}
              title={
                isSingleColumn
                  ? t("gallery.doubleColumn")
                  : t("gallery.singleColumn")
              }
            >
              {isSingleColumn ? <Columns size={16} /> : <Rows size={16} />}{" "}
              {t("gallery.view")}
            </button>
          ) : (
            <div></div>
          )}

          {/* Selection Controls */}
          {photos.length && (
            <div className="flex justify-end items-center gap-4">
              {!isSelectionMode ? (
                <button
                  onClick={toggleSelectionMode}
                  className="px-4 py-2 bg-[#00C7A5] text-white rounded-xl shadow-[0_4px_12px_rgba(0,199,165,0.3)] hover:bg-[#00B595] hover:shadow-[0_6px_16px_rgba(0,199,165,0.4)] transition-all duration-200 flex items-center gap-2 cursor-pointer h-10.5 font-bold"
                >
                  <MousePointer2 size={18} />
                  {t("gallery.select")}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSelectionMode}
                    className="px-4 py-2 bg-white/70 text-gray-700 rounded-xl border border-white/60 backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:bg-white hover:text-gray-900 transition-all duration-200 flex items-center gap-2 cursor-pointer font-bold"
                  >
                    <X size={18} />
                    {t("gallery.cancel")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <main>{RenderContent()}</main>
      </div>

      {/* Footer */}
      <Footer className="mt-4 mb-32" />

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            photos={photos}
            currentIndex={selectedImageIndex}
            onClose={closeModal}
            onDownloadPhoto={onDownloadPhoto}
            onToggleFavorite={(photo) => toggleFavorite(eventCode, photo)}
            isFavorite={(photo) => isFavorite(eventCode, photo.id)}
            eventCode={eventCode}
          />
        )}
      </AnimatePresence>

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
