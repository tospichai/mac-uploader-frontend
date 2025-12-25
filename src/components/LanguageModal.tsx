"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { SupportedLanguage, languageNames } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelect: (language: SupportedLanguage) => void;
  currentLanguage: SupportedLanguage;
}

export default function LanguageModal({
  isOpen,
  onClose,
  onLanguageSelect,
  currentLanguage,
}: LanguageModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is on the backdrop (the motion.div itself, which covers fullscreen)
      // or check if click is outside the modal content.
      // Since we now use a unified structure, we can handle it via onClick on the parent.
      // But for keyboard events, we keep this.
      // actually handleClickOutside is redundant if we use the backdrop click handler.
      // but let's keep keyboard.
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const languages: SupportedLanguage[] = ["th", "en", "ch", "vn"];

  const handleLanguageSelect = (language: SupportedLanguage) => {
    onLanguageSelect(language);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2"
      onClick={handleBackdropClick}
    >
      {/* Modal Content */}
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <h2 className="text-xl font-thai-semibold text-gray-900 thai-text">
            {t("languageModal.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Language Options - 2x2 Grid */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {languages.map((language) => (
              <button
                key={language}
                onClick={() => handleLanguageSelect(language)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${currentLanguage === language
                    ? "bg-[#00C7A5]/10 border-2 border-[#00C7A5]"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
              >
                {/* Language Flag/Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-3">
                  <span className="text-xl font-thai-medium">
                    {language === "th" && "🇹🇭"}
                    {language === "en" && "🇺🇸"}
                    {language === "ch" && "🇨🇳"}
                    {language === "vn" && "🇻🇳"}
                  </span>
                </div>

                {/* Language Name */}
                <div className="text-center">
                  <div className="font-thai-medium text-gray-900 text-sm thai-text">
                    {languageNames[language]}
                  </div>
                </div>

                {/* Selected Indicator */}
                {currentLanguage === language && (
                  <div className="absolute right-2 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#00C7A5] mt-2">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}