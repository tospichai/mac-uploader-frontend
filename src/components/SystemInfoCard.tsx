"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Copy, Check, Server, Key, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemInfo, useGenerateApiKey } from "@/hooks/useSystem";

export default function SystemInfoCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: systemInfo, isLoading: isLoadingInfo } = useSystemInfo();
  const { mutate: generateApiKey, isPending: isGeneratingApiKey } = useGenerateApiKey();
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerateApiKey = () => {
    generateApiKey(undefined, {
      onSuccess: (data) => {
        if (user && data.apiKey) {
          // We might need to update the user in context if we want immediate reflection without waiting for profile refetch
          // However, useGenerateApiKey invalidates "auth", "profile" so it should auto-refetch if we used useQuery for profile.
          // But useAuth uses manual useEffect. 
          // For now, let's manually update user object in place as a quick fix or just rely on the user object being updated via some other means?
          // The original code did: user.apiKey = response.apiKey.
          user.apiKey = data.apiKey;
        }
      }
    });
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (isLoadingInfo) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!systemInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-thai-bold text-gray-900 mb-4 flex items-center thai-text">
        <Server className="w-5 h-5 mr-2 text-[#00C7A5]" />
        {t("system.systemInfo")}
      </h3>

      <div className="space-y-4">
        {/* Backend Endpoint */}
        <div>
          <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
            {t("system.backendEndpoint")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Server className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={systemInfo.backendEndpoint}
              readOnly
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text"
            />
            <button
              onClick={() => handleCopy(systemInfo.backendEndpoint, "backend")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-[#00C7A5] transition-colors duration-200"
              title={t("system.copyToClipboard")}
            >
              {copied === "backend" ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* API Key Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-thai-medium text-gray-700 thai-text">
              {t("system.apiKey")}
            </label>
            <button
              onClick={handleGenerateApiKey}
              disabled={isGeneratingApiKey}
              className="flex items-center gap-2 px-3 py-1 text-xs bg-[#00C7A5] text-white rounded-lg hover:bg-[#00B595] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 thai-text cursor-pointer"
            >
              {isGeneratingApiKey ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  {t("system.generating")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  {t("system.generateApiKey")}
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={user?.apiKey || ""}
              readOnly
              placeholder={t("system.noApiKey")}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text"
            />
            <button
              onClick={() => handleCopy(user?.apiKey || "", "apikey")}
              disabled={!user?.apiKey}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-[#00C7A5] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t("system.copyToClipboard")}
            >
              {copied === "apikey" ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
