"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageModal from "./LanguageModal";
import { SupportedLanguage } from "@/contexts/LanguageContext";

interface LanguageButtonProps {
  className?: string;
}

export default function LanguageButton({ className = "" }: LanguageButtonProps) {
  const { currentLanguage, setLanguage } = useTranslation();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const handleLanguageSelect = (language: SupportedLanguage) => {
    setLanguage(language);
  };

  const handleCloseLanguageModal = () => {
    setIsLanguageModalOpen(false);
  };

  return (
    <>
      {/* Language Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={handleCloseLanguageModal}
        onLanguageSelect={handleLanguageSelect}
        currentLanguage={currentLanguage}
      />

      {/* Language Button - Fixed in top right corner */}
      <button
        onClick={() => setIsLanguageModalOpen(true)}
        className={`fixed top-4 right-4 z-50 flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/60 shadow-lg rounded-full hover:bg-white hover:shadow-xl transition-all duration-200 group ${className}`}
        title="Change Language"
        aria-label="Change Language"
      >
        <Globe
          size={20}
          className="text-gray-600 group-hover:text-[#00C7A5] transition-colors duration-200"
        />
      </button>
    </>
  );
}