"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Camera, CheckCircle } from "lucide-react";
import Image from "next/image";
import LanguageButton from "@/components/LanguageButton";

export default function RegistrationSuccess() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA] flex items-center justify-center px-4 py-8">
      <LanguageButton />
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
            <Camera className="w-12 h-12 text-[#00C7A5]" />
          </div>
          <h1 className="text-3xl font-thai-bold text-gray-900 thai-text mb-2">
            {t("auth.registrationSuccessTitle")}
          </h1>
          <p className="text-gray-600 thai-text">
            {t("auth.registrationSuccessSubtitle")}
          </p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <h2 className="text-2xl font-thai-bold text-gray-900 thai-text mb-4">
              {t("auth.registrationSuccessMessage")}
            </h2>

            <p className="text-gray-600 thai-text mb-8">
              {t("auth.registrationSuccessDescription")}
            </p>

            {/* Get Started Button */}
            <button
              onClick={handleGetStarted}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-thai-bold text-white bg-[#00C7A5] hover:bg-[#00B595] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C7A5] transition-colors duration-200 thai-text cursor-pointer"
            >
              {t("auth.getStarted")}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
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
        </div>
      </div>
    </div>
  );
}