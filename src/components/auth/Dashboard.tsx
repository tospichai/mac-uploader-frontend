"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import LanguageButton from "@/components/LanguageButton";
import Sidebar from "./Sidebar";
import DashboardTab from "./tabs/DashboardTab";
import EventsTab from "./tabs/EventsTab";
import AccountTab from "./tabs/AccountTab";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!user) {
    return <div>Loading...</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "events":
        return <EventsTab />;
      case "account":
        return <AccountTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA]">
      <LanguageButton />
      <div className="mx-auto px-4 py-8 max-w-7xl">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          <div className="md:col-span-3 mt-16">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12">
          <Image
            src="/logo.png"
            alt="Live Moments Gallery"
            width={48}
            height={48}
            className="mx-auto mb-2"
          />
          <p className="text-[#00C7A5] text-sm">
            © 2025 Live Moments Gallery | All Rights Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
