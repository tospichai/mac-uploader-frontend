"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { HardDrive } from "lucide-react";
import SystemInfoCard from "@/components/SystemInfoCard";

export default function DashboardTab() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const formatStorage = (mb: number) => {
    const gb = mb / 1000;
    const formatted = gb.toFixed(2);

    return formatted.endsWith(".00") ? gb.toFixed(0) : formatted;
  };

  const storagePercentage = (user.storageUsedMb / user.storageQuotaMb) * 100;

  return (
    <div className="space-y-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-thai-bold text-gray-900 thai-text mb-2">
          {t("auth.welcome")}, {user.displayName}!
        </h1>
        <p className="text-gray-600 thai-text">{t("auth.dashboard")}</p>
      </header>
      {/* Storage Info Card */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-thai-bold text-gray-900 mb-4 flex items-center thai-text">
          <HardDrive className="w-5 h-5 mr-2 text-[#00C7A5]" />
          {t("auth.storageInfo")}
        </h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2 thai-text">
            <span>
              {t("auth.storageUsed")}: {formatStorage(user.storageUsedMb)} GB
            </span>
            <span>
              {t("auth.storageQuota")}: {formatStorage(user.storageQuotaMb)} GB
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-[#00C7A5] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>

          <div className="text-center mt-2 text-sm text-gray-600 thai-text">
            {storagePercentage.toFixed(1)}% {t("auth.storageUsed")}
          </div>
        </div>
      </div>

      {/* System Information Card */}
      <SystemInfoCard />
    </div>
  );
}
