"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface GridViewContextValue {
  isSingleColumn: boolean;
  toggleGridView: () => void;
  isMobile: boolean;
}

const GridViewContext = createContext<GridViewContextValue | undefined>(
  undefined
);

const GRID_VIEW_STORAGE_KEY = "photo_grid_view";

export function GridViewProvider({ children }: { children: ReactNode }) {
  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);

  // Initialize state with data from localStorage if available
  const getInitialGridView = (): boolean => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const stored = localStorage.getItem(GRID_VIEW_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading grid view from localStorage:", error);
    }
    return false;
  };

  const [isSingleColumn, setIsSingleColumn] = useState(getInitialGridView);

  // Detect mobile device
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset to 2 columns when switching to desktop
  useEffect(() => {
    if (!isMobile && isSingleColumn) {
      const timeoutId = setTimeout(() => setIsSingleColumn(false), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isMobile, isSingleColumn]);

  // Save grid view preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(GRID_VIEW_STORAGE_KEY, JSON.stringify(isSingleColumn));
    } catch (error) {
      console.error("Error saving grid view to localStorage:", error);
    }
  }, [isSingleColumn]);

  const toggleGridView = useCallback(() => {
    // Only allow toggling on mobile devices
    if (isMobile) {
      setIsSingleColumn((prev) => !prev);
    }
  }, [isMobile]);

  const value: GridViewContextValue = {
    isSingleColumn,
    toggleGridView,
    isMobile,
  };

  return (
    <GridViewContext.Provider value={value}>
      {children}
    </GridViewContext.Provider>
  );
}

export function useGridView() {
  const context = useContext(GridViewContext);
  if (context === undefined) {
    throw new Error("useGridView must be used within a GridViewProvider");
  }
  return context;
}