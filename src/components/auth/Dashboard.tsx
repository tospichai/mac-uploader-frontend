"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import LanguageButton from "@/components/LanguageButton";
import Sidebar from "./Sidebar";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA] flex flex-col">
      <LanguageButton />
      <div className="flex-grow mx-auto px-4 py-8 max-w-7xl">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Sidebar activeTab={activeTab} />
          </div>

          {/* Tab Content */}
          <div className="flex-1 mt-0 md:mt-16">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer className="mt-12 mb-32" />
    </div>
  );
}
