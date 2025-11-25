"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, Globe, Images } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
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
}

export default function TabMenu({ activeTab, onTabChange }: TabMenuProps) {
  const router = useRouter();
  const { t, currentLanguage, setLanguage } = useTranslation();
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const tabs: TabItem[] = [
    {
      id: "gallery",
      label: t("tabs.gallery"),
      icon: <Images size={20} />,
      path: "/gallery",
    },
    {
      id: "search",
      label: t("tabs.search"),
      icon: <Search size={20} />,
      onClick: () => {
        console.log("Search clicked");
      },
    },
    {
      id: "favorites",
      label: t("tabs.favorites"),
      icon: <Heart size={20} />,
      onClick: () => {
        console.log("Favorites clicked");
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

  const handleTabClick = (tab: TabItem) => {
    if (onTabChange) {
      onTabChange(tab.id);
    }

    if (tab.path) {
      router.push(tab.path);
    } else if (tab.onClick) {
      tab.onClick();
    }
  };

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
          className="mx-auto max-w-sm rounded-[999px] border border-white/60 bg-white/70
             shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl"
        >
          <ul className="flex items-center justify-between gap-2 px-5 py-3 text-xs font-medium">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => handleTabClick(tab)}
                  className={`group relative overflow-hidden flex flex-col items-center gap-1 rounded-2xl
                    px-3 py-2 transition-colors duration-200 ${
                      activeTab === tab.id && tab.id !== "language"
                        ? "bg-gray-200/60 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.id !== "language" && (
                    <span
                      className={`absolute bottom-[-0.5px] h-1 w-6 rounded-full bg-[#00C7A5] transition-opacity ${
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
        </div>
      </nav>
    </>
  );
}
