'use client';

import { useEffect, useRef } from 'react';
import { Photo } from '@/types';
import Image from 'next/image';

interface PhotoGridProps {
  photos: Photo[];
  onImageClick: (imageUrl: string) => void;
  onDownloadPhoto: (photoId: string) => void;
  onNewPhoto: () => void;
}

export default function PhotoGrid({
  photos,
  onImageClick,
  onDownloadPhoto,
  onNewPhoto
}: PhotoGridProps) {
  const newPhotoRef = useRef<HTMLDivElement>(null);

  // Highlight new photos
  useEffect(() => {
    if (newPhotoRef.current && photos.length > 0) {
      newPhotoRef.current.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-75');
      setTimeout(() => {
        if (newPhotoRef.current) {
          newPhotoRef.current.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-75');
        }
      }, 3000);
    }
  }, [photos.length]);

  const imageUrl = (photo: Photo) => photo.displayUrl || photo.downloadUrl;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mb-8">
      {photos.map((photo, index) => (
        <div
          key={photo.photoId}
          ref={index === 0 ? newPhotoRef : null}
          className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div
            className="aspect-[3.6/2.4] sm:aspect-[3.6/2.4] relative group cursor-pointer rounded-lg overflow-hidden"
            onClick={() => {
              const url = imageUrl(photo);
              if (url) onImageClick(url);
            }}
          >
            {(() => {
              const url = imageUrl(photo);
              if (!url) {
                return (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                );
              }

              return (
                <>
                  <Image
                    src={url}
                    alt={`Photo ${photo.photoId}`}
                    className="w-full h-full object-cover"
                    fill
                    loading="lazy"
                  />

                  {/* Eye icon in center on hover */}
                  <div className="absolute inset-0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
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
                </>
              );
            })()}
          </div>

          <div className="p-3 flex justify-between items-center hidden">
            <div className="min-w-0 flex-1 mr-2">
              <p
                className="text-xs text-gray-500 truncate"
                title={`ID: ${photo.photoId}`}
              >
                ID: {photo.photoId}
              </p>
              <p
                className="text-xs text-gray-400 truncate"
                title={photo.lastModified ? new Date(photo.lastModified).toLocaleString('th-TH') : ''}
              >
                {photo.lastModified ? new Date(photo.lastModified).toLocaleString('th-TH') : ''}
              </p>
            </div>

            {photo.downloadUrl && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadPhoto(photo.photoId);
                }}
                className="flex-shrink-0 text-black px-2 py-1 text-xs rounded hover:bg-gray-200 transition-colors duration-200 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}