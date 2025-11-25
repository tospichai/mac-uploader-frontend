"use client";

import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Custom hook for accessing translations
 * Returns a translation function that can be used throughout the app
 */
export function useTranslation() {
  const { t, currentLanguage, setLanguage, availableLanguages } = useLanguage();

  return {
    t,
    currentLanguage,
    setLanguage,
    availableLanguages,
  };
}

export default useTranslation;