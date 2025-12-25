"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import LanguageButton from "@/components/LanguageButton";
import Sidebar from "./Sidebar";
import Footer from "@/components/Footer";

interface MainLayoutProps {
  activeTab: string;
  children: React.ReactNode;
}

export default function MainLayout({ activeTab, children }: MainLayoutProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA] flex flex-col">
      <LanguageButton />
      <div className="flex-grow mx-auto px-4 py-8 max-w-6xl w-full">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar activeTab={activeTab} />
          </div>

          {/* Tab Content */}
          <div className="flex-1 mt-0 md:mt-16">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer className="mt-12 mb-8" />
    </div>
  );
}