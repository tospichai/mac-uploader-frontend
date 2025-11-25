"use client";

import { useState } from "react";
import { Photo, EventInfo, Pagination } from "@/types";
import PhotoGrid from "./PhotoGrid";
import ImageModal from "./ImageModal";
import NotificationAlert from "./NotificationAlert";
import { useTranslation } from "@/hooks/useTranslation";

interface GalleryPageProps {
  eventInfo: EventInfo | null;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

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
    showNotification(t("gallery.newPhoto"), "success");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA]">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t("gallery.title")}
          </h1>
          {eventInfo && (
            <>
              <p className="text-gray-600">
                {t("gallery.event")}:{" "}
                <span className="font-semibold">{eventInfo.eventName}</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {t("gallery.photographer")}:{" "}
                <span className="font-semibold">
                  {eventInfo.photographerName}
                </span>
              </p>
            </>
          )}
        </header>

        {/* Main Content */}
        <main>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
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
                      className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      {t("gallery.previous")}
                    </button>
                  )}

                  <div className="flex space-x-1">
                    {pagination.pages.map((p) => (
                      <button
                        key={p.number}
                        onClick={() => onPageChange(p.number)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          p.active
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
                      className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      {t("gallery.next")}
                    </button>
                  )}
                </div>
              )}
            </>
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
