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
import Image from "next/image";
import Footer from "./Footer";
import {
  Images,
  X,
  MousePointer2,
  Columns,
  Rows,
  Globe,
} from "lucide-react";
import { siFacebook, siInstagram, siX } from "simple-icons";
import SimpleIcon from "./SimpleIcon";

interface GalleryPageProps {
  eventInfo: GalleryEventDetails | null;
  photos: Photo[];
  pagination: Pagination | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onDownloadPhoto: (photoId: string) => void;
  eventCode: string;
}

export default function GalleryPage({
  eventInfo,
  photos,
  pagination,
  loading,
  onPageChange,
  onDownloadPhoto,
  eventCode,
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
        <div className="flex justify-center items-center py-12">
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
          />

          {/* Pagination */}
          {pagination && pagination.hasMultiplePages && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              {pagination.hasPrevPage && (
                <button
                  onClick={() => onPageChange(pagination.prevPage!)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-thai-medium text-gray-700 thai-text"
                >
                  {t("gallery.previous")}
                </button>
              )}

              <div className="flex space-x-1">
                {pagination.pages.map((p) => (
                  <button
                    key={p.number}
                    onClick={() => onPageChange(p.number)}
                    className={`px-3 py-2 rounded-md text-sm font-thai-medium ${p.active
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {p.number}
                  </button>
                ))}
              </div>

              {pagination.hasNextPage && (
                <button
                  onClick={() => onPageChange(pagination.nextPage!)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-thai-medium text-gray-700 thai-text"
                >
                  {t("gallery.next")}
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
        <header className="text-center">
          <div className="mx-auto container flex flex-col sm:flex-row justify-center gap-4 items-center mb-6">
            <div className="flex justify-center rounded-xl">
              <Image
                src={eventInfo?.photographer.logoUrl ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${eventInfo.photographer.logoUrl}` : "/logo.png"}
                alt="logo"
                width={150}
                height={150}
                className={`${eventInfo?.photographer.logoUrl ? "" : "p-10"} rounded-full border-4 border-white shadow-md mb-4 sm:mb-0`}
              />
            </div>
            <div>
              <h1 className="text-2xl font-thai-bold text-gray-800 thai-text">
                {eventInfo?.event.title || 'Event Name'}
                <br />
              </h1>
              {eventInfo?.event.subtitle && (
                <p className="text-gray-500 text-lg mt-1 thai-text">
                  <span className="font-thai-semibold">{eventInfo.event.subtitle}</span>
                </p>
              )}
              {eventInfo?.event.eventDate && (
                <p className="text-gray-500 text-sm mt-1 thai-text">
                  {t("gallery.eventDetails.date")}: {new Date(eventInfo.event.eventDate).toLocaleDateString('th-TH')}
                </p>
              )}
              {eventInfo?.event.description && (
                <p className="text-gray-600 text-sm mt-2 thai-text max-w-md">
                  {eventInfo.event.description}
                </p>
              )}

              {/* Social Media Icons */}
              <div className="flex items-center gap-3 mt-3 justify-center">
                {eventInfo?.photographer.facebookUrl && (
                  <a
                    href={eventInfo.photographer.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Facebook"
                  >
                    <SimpleIcon icon={siFacebook} size={26} />
                  </a>
                )}
                {eventInfo?.photographer.instagramUrl && (
                  <a
                    href={eventInfo.photographer.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <SimpleIcon icon={siInstagram} size={26} />
                  </a>
                )}
                {eventInfo?.photographer.twitterUrl && (
                  <a
                    href={eventInfo.photographer.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Twitter/X"
                  >
                    <SimpleIcon icon={siX} size={26} />
                  </a>
                )}
                {eventInfo?.photographer.websiteUrl && (
                  <a
                    href={eventInfo.photographer.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Website"
                  >
                    <Globe size={26} className="text-[#5ea9dd]" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

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
      <Footer className="mt-4 mb-24" />

      {/* Image Modal */}
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
