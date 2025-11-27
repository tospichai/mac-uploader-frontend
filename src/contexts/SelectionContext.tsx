"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface SelectionContextValue {
  isSelectionMode: boolean;
  selectedPhotos: Set<string>;
  toggleSelectionMode: () => void;
  togglePhotoSelection: (photoId: string, onSelectionLimitReached?: () => void) => void;
  isPhotoSelected: (photoId: string) => boolean;
  clearSelection: () => void;
  selectedCount: number;
  MAX_SELECTION_LIMIT: number;
  // Download functionality
  isDownloading: boolean;
  setDownloadFunction: (downloadFn: (photoId: string) => Promise<void>) => void;
  handleBatchDownload: () => Promise<void>;
  showNotification: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(
  undefined
);

const MAX_SELECTION_LIMIT = 20;

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPhoto, setDownloadPhoto] = useState<(photoId: string) => Promise<void> | null>(() => null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) {
        // Clear selection when exiting selection mode
        setSelectedPhotos(new Set());
      }
      return !prev;
    });
  }, []);

  const togglePhotoSelection = useCallback(
    (photoId: string, onSelectionLimitReached?: () => void) => {
      setSelectedPhotos((prev) => {
        const newSelection = new Set(prev);

        if (newSelection.has(photoId)) {
          // Remove from selection
          newSelection.delete(photoId);
        } else {
          // Check if we've reached the limit
          if (newSelection.size >= MAX_SELECTION_LIMIT) {
            // Call the limit reached callback if it exists
            if (onSelectionLimitReached) {
              onSelectionLimitReached();
            }
            return prev; // Don't add if limit reached
          }
          // Add to selection
          newSelection.add(photoId);
        }

        return newSelection;
      });
    },
    []
  );

  const isPhotoSelected = useCallback(
    (photoId: string): boolean => {
      return selectedPhotos.has(photoId);
    },
    [selectedPhotos]
  );

  const clearSelection = useCallback(() => {
    setSelectedPhotos(new Set());
  }, []);

  const setDownloadFunction = useCallback((downloadFn: (photoId: string) => Promise<void>) => {
    setDownloadPhoto(() => downloadFn);
  }, []);

  const showNotification = useCallback((
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const selectedCount = selectedPhotos.size;

  const handleBatchDownload = useCallback(async () => {
    if (selectedCount === 0) {
      showNotification("No photos selected", "warning");
      return;
    }

    if (!downloadPhoto) {
      showNotification("Download function not available", "error");
      return;
    }

    setIsDownloading(true);
    showNotification("Downloading photos...", "info");

    try {
      // Convert Set to Array and download each photo with a small delay
      const photoIds = Array.from(selectedPhotos);

      for (let i = 0; i < photoIds.length; i++) {
        const photoId = photoIds[i];
        console.log(
          `Downloading photo ${i + 1}/${photoIds.length}: ${photoId}`
        );

        try {
          // Call the download function
          await downloadPhoto(photoId);
          // Give some time for the download to start
          await new Promise<void>((resolve) => setTimeout(resolve, 100));
        } catch (downloadError) {
          console.error(`Failed to download photo ${photoId}:`, downloadError);
          // Continue with next photo even if one fails
        }

        // Add a longer delay between downloads to avoid overwhelming the browser
        if (i < photoIds.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      showNotification("Download complete", "success");
      clearSelection();
      toggleSelectionMode(); // Exit selection mode after download
    } catch (error) {
      console.error("Batch download error:", error);
      showNotification("Download failed", "error");
    } finally {
      setIsDownloading(false);
    }
  }, [selectedCount, downloadPhoto, showNotification, clearSelection, toggleSelectionMode]);

  const value: SelectionContextValue = {
    isSelectionMode,
    selectedPhotos,
    toggleSelectionMode,
    togglePhotoSelection,
    isPhotoSelected,
    clearSelection,
    selectedCount,
    MAX_SELECTION_LIMIT,
    isDownloading,
    setDownloadFunction,
    handleBatchDownload,
    showNotification,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
}