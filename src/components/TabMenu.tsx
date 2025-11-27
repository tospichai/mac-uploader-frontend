"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, Globe, Images, Download, X, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSelection } from "@/contexts/SelectionContext";
import LanguageModal from "./LanguageModal";
import { SupportedLanguage } from "@/contexts/LanguageContext";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
}

interface TabMenuProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  eventCode?: string;
  photographer?: string;
}

export default function TabMenu({
  activeTab,
  onTabChange,
  eventCode,
  photographer,
}: TabMenuProps) {
  const router = useRouter();
  const { t, currentLanguage, setLanguage } = useTranslation();
  const {
    isSelectionMode,
    selectedCount,
    MAX_SELECTION_LIMIT,
    isDownloading,
    handleBatchDownload,
    toggleSelectionMode
  } = useSelection();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const tabs: TabItem[] = [
    {
      id: "gallery",
      label: t("tabs.gallery"),
      icon: <Images size={20} />,
      onClick: () => {
        if (eventCode && photographer) {
          router.push(`/gallery/${photographer}_${eventCode}`);
        } else {
          router.push("/gallery");
        }
      },
    },
    // {
    //   id: "search",
    //   label: t("tabs.search"),
    //   icon: <Search size={20} />,
    //   onClick: () => {
    //     console.log("Search clicked");
    //   },
    // },
    {
      id: "favorites",
      label: t("tabs.favorites"),
      icon: <Heart size={20} />,
      onClick: () => {
        if (eventCode && photographer) {
          router.push(`/favorites/${photographer}_${eventCode}`);
        } else {
          router.push("/favorites");
        }
      },
    },
    {
      id: "language",
      label: t("tabs.language"),
      icon: <Globe size={20} />,
      onClick: () => {
        setIsLanguageModalOpen(true);
      },
    },
  ];


  const handleLanguageSelect = (language: SupportedLanguage) => {
    setLanguage(language);
  };

  const handleCloseLanguageModal = () => {
    setIsLanguageModalOpen(false);
  };

  return (
    <>
      {/* Language Modal - rendered outside the positioned nav */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={handleCloseLanguageModal}
        onLanguageSelect={handleLanguageSelect}
        currentLanguage={currentLanguage}
      />

      <nav className="fixed bottom-6 left-1/2 z-10 w-full -translate-x-1/2 px-4 sm:px-0">
        <div
          className="mx-auto max-w-xs rounded-[999px] border border-white/60 bg-white/70
             shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl h-20"
        >
          {isSelectionMode ? (
            // Selection Mode UI
            <div className="flex items-center justify-between px-6 py-3 text-xs font-medium h-full">
              {/* Cancel Button */}
              <button
                onClick={toggleSelectionMode}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 border border-white/60 backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer"
                title={t("gallery.cancel")}
              >
                <X size={18} className="text-gray-700" />
              </button>

              {/* Selection Count */}
              <div className="flex-1 text-center">
                <span className="text-gray-600 font-semibold text-sm">
                  {t("gallery.selectionCount", { count: selectedCount, limit: MAX_SELECTION_LIMIT })}
                </span>
              </div>

              {/* Download Button */}
              <button
                onClick={handleBatchDownload}
                disabled={selectedCount === 0 || isDownloading}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                  selectedCount > 0 && !isDownloading
                    ? "bg-[#00C7A5] shadow-[0_4px_12px_rgba(0,199,165,0.3)] hover:bg-[#00B595] hover:shadow-[0_6px_16px_rgba(0,199,165,0.4)] cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                title={t("gallery.downloadSelected")}
              >
                {isDownloading ? (
                  <Loader2
                    size={18}
                    className="text-white animate-spin"
                  />
                ) : (
                  <Download
                    size={18}
                    className={selectedCount > 0 ? "text-white" : "text-gray-500"}
                  />
                )}
              </button>
            </div>
          ) : (
            // Regular Tab Menu UI
            <ul className="flex items-center justify-between gap-2 px-8 py-3 text-xs font-medium">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => tab.onClick ? tab.onClick() : tab.path && router.push(tab.path)}
                    className={`group relative overflow-hidden flex flex-col items-center gap-1 rounded-xl
                      px-3 py-2 transition-colors duration-200 cursor-pointer min-w-16 ${
                        activeTab === tab.id && tab.id !== "language"
                          ? "bg-white text-gray-900 shadow-[0_4px_12px_rgba(15,23,42,0.1)]"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.id !== "language" && (
                      <span
                        className={`absolute bottom-[-4.5px] h-2 w-10 rounded-full bg-[#00C7A5] transition-opacity ${
                          activeTab === tab.id
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-0"
                        }`}
                      ></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </>
  );
}
