"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Photo } from "@/types";

export interface FavoriteItem {
  id: string;
  thumbnailUrl: string;
  originalUrl: string;
  addedAt: number;
}

export interface FavoritesState {
  [eventCode: string]: {
    [id: string]: FavoriteItem;
  };
}

interface FavoritesContextValue {
  favorites: FavoritesState;
  isFavorite: (eventCode: string, id: string) => boolean;
  toggleFavorite: (eventCode: string, photo: Photo) => void;
  getFavoritesForEvent: (eventCode: string) => FavoriteItem[];
  clearFavoritesForEvent: (eventCode: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

const FAVORITES_STORAGE_KEY = "photo_favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Initialize state with data from localStorage if available
  const getInitialFavorites = (): FavoritesState => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return {};
    }

    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
    }
    return {};
  };

  const [favorites, setFavorites] = useState<FavoritesState>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, [favorites]);

  const isFavorite = (eventCode: string, id: string): boolean => {
    return !!(favorites[eventCode] && favorites[eventCode][id]);
  };

  const toggleFavorite = (eventCode: string, photo: Photo) => {
    setFavorites((prev) => {
      // Create a deep copy to avoid mutation issues
      const newFavorites = JSON.parse(JSON.stringify(prev));

      // Initialize event code if it doesn't exist
      if (!newFavorites[eventCode]) {
        newFavorites[eventCode] = {};
      }

      if (newFavorites[eventCode][photo.id]) {
        // Remove from favorites
        delete newFavorites[eventCode][photo.id];

        // Clean up empty event objects
        if (Object.keys(newFavorites[eventCode]).length === 0) {
          delete newFavorites[eventCode];
        }
      } else {
        // Add to favorites
        newFavorites[eventCode][photo.id] = {
          id: photo.id,
          thumbnailUrl: photo.thumbnailUrl,
          originalUrl: photo.originalUrl,
          imageUrl: photo.thumbnailUrl || photo.originalUrl || "",
          addedAt: Date.now(),
        };
      }

      return newFavorites;
    });
  };

  const getFavoritesForEvent = (eventCode: string): FavoriteItem[] => {
    if (!favorites[eventCode]) return [];

    return Object.values(favorites[eventCode]).sort(
      (a, b) => b.addedAt - a.addedAt
    );
  };

  const clearFavoritesForEvent = (eventCode: string) => {
    setFavorites((prev) => {
      const newFavorites = { ...prev };
      delete newFavorites[eventCode];
      return newFavorites;
    });
  };

  const value: FavoritesContextValue = {
    favorites,
    isFavorite,
    toggleFavorite,
    getFavoritesForEvent,
    clearFavoritesForEvent,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
