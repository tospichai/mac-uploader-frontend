"use client";

import { useEffect, useRef } from "react";
import { Photo } from "@/types";
import { Heart, Check } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useSelection } from "@/contexts/SelectionContext";
import { useGridView } from "@/contexts/GridViewContext";

interface PhotoGridProps {
  photos: Photo[];
  onImageClick: (imageUrl: string, index: number) => void;
  onDownloadPhoto: (photoId: string) => void;
  onNewPhoto: () => void;
  eventCode: string;
  newPhotoIds: Set<string>;
}

export default function PhotoGrid({
  photos,
  onImageClick,
  onDownloadPhoto,
  onNewPhoto,
  eventCode,
  newPhotoIds
}: PhotoGridProps) {
  const newPhotoRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const {
    isSelectionMode,
    selectedPhotos,
    togglePhotoSelection,
    isPhotoSelected,
  } = useSelection();
  const { isSingleColumn, isMobile } = useGridView();

  const handleSelectionLimit = () => {
    // This will be called when selection limit is reached
    // We'll use a simple notification here since we don't have access to showNotification
    console.warn("Selection limit reached");
  };

  const imageUrl = (photo: Photo) => photo.thumbnailUrl || photo.originalUrl;

  const handleFavoriteClick = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    toggleFavorite(eventCode, photo);
  };

  return (
    <div
      className={`grid mb-8 gap-2 sm:gap-4 ${isSingleColumn && isMobile
        ? "grid-cols-1"
        : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4"
        }`}
    >
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          ref={index === 0 ? newPhotoRef : null}
          className={`relative rounded-lg shadow-md overflow-hidden hover:shadow-lg${isPhotoSelected(photo.id)
            ? "ring-3 sm:ring-4 ring-[#00C7A5] ring-opacity-50 shadow-lg"
            : ""
            }`}
        >
          <div
            className={`aspect-3/2 relative group cursor-pointer rounded-lg overflow-hidden ${isSelectionMode ? "cursor-pointer" : ""
              }`}
            onClick={() => {
              if (isSelectionMode) {
                togglePhotoSelection(photo.id, handleSelectionLimit);
              } else {
                const url = photo.originalUrl;
                if (url) onImageClick(url, index);
              }
            }}
          >
            {newPhotoIds.has(photo.id) && (
              <div
                className="absolute top-2 left-2 z-20 bg-[#00C7A5] text-white text-xs font-bold px-2 py-1 rounded-md animate-[badge-fade_2s_ease-out_forwards]"
                onAnimationEnd={(e) => {
                  // Optional: You could remove it from state here if you wanted it to disappear strictly after animation
                  // But CSS 'forwards' keeps it at 0 opacity, effectively hidden.
                  // To strictly clean up, we'd need a callback to parent.
                  // For now, visual hiding is sufficient.
                }}
              >
                New
              </div>
            )}
            {(() => {
              const url = imageUrl(photo);
              if (!url) {
                return (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-thai-medium thai-text">
                      No image
                    </span>
                  </div>
                );
              }

              return (
                <>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Selection checkbox or favorite icon in top-right corner */}
                  {isSelectionMode ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(
                          photo.id,
                          handleSelectionLimit
                        );
                      }}
                      className={`absolute top-2 right-2 w-9.5 h-9.5 rounded-xl border-2 flex items-center justify-center cursor-pointer z-9 ${isPhotoSelected(photo.id)
                        ? "bg-[#00C7A5] border-[#00C7A5] shadow-[0_2px_8px_rgba(0,199,165,0.4)]"
                        : "backdrop-blur-sm border-gray-300 group-hover:border-[#00C7A5] hover:bg-white/20"
                        }`}
                    >
                      {isPhotoSelected(photo.id) && (
                        <Check size={22} className="text-white" />
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 group-hover:bg-black/30 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          {!isSelectionMode && (
            <div>
              <button
                onClick={(e) => handleFavoriteClick(e, photo)}
                className="absolute top-2 right-2 p-2 backdrop-blur-sm rounded-full shadow-md hover:bg-white/20 hover:shadow-lg transition-all duration-200 group z-1 cursor-pointer"
              >
                <Heart
                  size={22}
                  className={` ${isFavorite(eventCode, photo.id)
                    ? "fill-red-500 text-red-500"
                    : "text-gray-100"
                    }`}
                />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
