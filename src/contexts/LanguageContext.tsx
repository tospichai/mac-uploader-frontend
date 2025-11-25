"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Import all translation files
import thTranslations from "@/translations/th.json";
import enTranslations from "@/translations/en.json";
import chTranslations from "@/translations/ch.json";
import vnTranslations from "@/translations/vn.json";

// Define supported languages
export type SupportedLanguage = "th" | "en" | "ch" | "vn";

// Translation data structure
interface Translations {
  [key: string]: string | Translations;
}

// All translations
const translations: Record<SupportedLanguage, Translations> = {
  th: thTranslations,
  en: enTranslations,
  ch: chTranslations,
  vn: vnTranslations,
};

// Language display names
export const languageNames: Record<SupportedLanguage, string> = {
  th: "ไทย",
  en: "English",
  ch: "中文",
  vn: "Tiếng Việt",
};

// Context interface
interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  availableLanguages: SupportedLanguage[];
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get default language from browser or localStorage
const getDefaultLanguage = (): SupportedLanguage => {
  if (typeof window !== "undefined") {
    // Check localStorage first
    const savedLanguage = localStorage.getItem("language") as SupportedLanguage;
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      return savedLanguage;
    }

    // Check browser language
    const browserLanguage = navigator.language.split("-")[0];
    const mappedLanguage: Record<string, SupportedLanguage> = {
      th: "th",
      en: "en",
      zh: "ch",
      vi: "vn",
    };

    if (mappedLanguage[browserLanguage]) {
      return mappedLanguage[browserLanguage];
    }
  }

  // Default to Thai
  return "th";
};

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>("th");

  // Initialize language on mount
  useEffect(() => {
    const defaultLanguage = getDefaultLanguage();
    setCurrentLanguage(defaultLanguage);
  }, []);

  // Save language preference to localStorage
  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    const keys = key.split(".");
    let translation: string | Translations | undefined = translations[currentLanguage];

    for (const k of keys) {
      if (translation && typeof translation === "object" && translation[k]) {
        translation = translation[k];
      } else {
        // Fallback to English if key not found in current language
        let fallbackTranslation: string | Translations | undefined = translations.en;
        for (const fk of keys) {
          if (fallbackTranslation && typeof fallbackTranslation === "object" && fallbackTranslation[fk]) {
            fallbackTranslation = fallbackTranslation[fk];
          } else {
            return fallback || key;
          }
        }
        return typeof fallbackTranslation === "string" ? fallbackTranslation : (fallback || key);
      }
    }

    return typeof translation === "string" ? translation : (fallback || key);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages: Object.keys(translations) as SupportedLanguage[],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}