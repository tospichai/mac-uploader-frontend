'use client';

import { useEffect, useState, useRef } from 'react';
import { Photo } from '@/types';
import { Heart, Download } from 'lucide-react';

interface ImageModalProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onDownloadPhoto?: (photoId: string) => void;
  onToggleFavorite?: (photo: Photo) => void;
  isFavorite?: (photo: Photo) => boolean;
  eventCode?: string;
}

export default function ImageModal({
  photos,
  currentIndex,
  onClose,
  onDownloadPhoto,
  onToggleFavorite,
  isFavorite,
  eventCode
}: ImageModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Get current photo URL
  const getCurrentPhotoUrl = () => {
    const photo = photos[currentImageIndex];
    return photo?.displayUrl || photo?.downloadUrl || '';
  };

  // Navigate to previous image
  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Navigate to next image
  const goToNext = () => {
    if (currentImageIndex < photos.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, currentImageIndex, photos.length]);

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    const currentPhoto = photos[currentImageIndex];
    if (currentPhoto && onDownloadPhoto) {
      onDownloadPhoto(currentPhoto.photoId);
    }
  };

  const handleFavorite = () => {
    const currentPhoto = photos[currentImageIndex];
    if (currentPhoto && onToggleFavorite) {
      onToggleFavorite(currentPhoto);
    }
  };

  const checkIsFavorite = () => {
    const currentPhoto = photos[currentImageIndex];
    return currentPhoto && isFavorite ? isFavorite(currentPhoto) : false;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Action buttons - Top Right */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors duration-200 cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Download button */}
        {onDownloadPhoto && (
          <button
            onClick={handleDownload}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors duration-200 place-items-center h-10 cursor-pointer"
            aria-label="Download image"
          >
            <Download size={20} />
          </button>
        )}

        {/* Favorite button */}
        {onToggleFavorite && isFavorite && eventCode && (
          <button
            onClick={handleFavorite}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors duration-200 place-items-center h-10 cursor-pointer"
            aria-label="Toggle favorite"
          >
            <Heart
              size={20}
              className={`transition-colors duration-200 ${
                checkIsFavorite()
                  ? "fill-red-500 text-red-500"
                  : "text-white"
              }`}
            />
          </button>
        )}
      </div>

      {/* Previous button */}
      {currentImageIndex > 0 && (
        <button
          onClick={goToPrevious}
          className="absolute left-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200 z-10"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {currentImageIndex < photos.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-200 z-10"
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Image container with touch support */}
      <div
        className="relative flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={getCurrentPhotoUrl()}
          alt={`Photo ${currentImageIndex + 1} of ${photos.length}`}
          className="max-w-[90%] max-h-[90%] object-contain rounded-xl select-none"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
          draggable={false}
        />
      </div>

      {/* Image indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentImageIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm z-10 font-thai-medium">
          {currentImageIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}