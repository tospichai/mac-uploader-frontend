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
}

const SelectionContext = createContext<SelectionContextValue | undefined>(
  undefined
);

const MAX_SELECTION_LIMIT = 20;

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

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

  const selectedCount = selectedPhotos.size;

  const value: SelectionContextValue = {
    isSelectionMode,
    selectedPhotos,
    toggleSelectionMode,
    togglePhotoSelection,
    isPhotoSelected,
    clearSelection,
    selectedCount,
    MAX_SELECTION_LIMIT,
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