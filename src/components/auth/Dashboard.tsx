"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, LogOut, Camera, Globe, HardDrive, User2 } from "lucide-react";
import { siFacebook, siInstagram, siX } from "simple-icons";
import Image from "next/image";
import ProfileEdit from "./ProfileEdit";
import LanguageButton from "@/components/LanguageButton";
import SimpleIcon from "@/components/SimpleIcon";

export default function Dashboard() {
  const { t } = useTranslation();
  const { logout, user, checkAuth } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  if (!user) {
    return <div>Loading...</div>;
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleLogout = async () => {
    if (window.confirm(t("auth.logout") + "?")) {
      await logout();
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const formatStorage = (mb: number) => {
    const gb = mb / 1000;
    const formatted = gb.toFixed(2);

    return formatted.endsWith(".00") ? gb.toFixed(0) : formatted;
  };

  const storagePercentage = (user.storageUsedMb / user.storageQuotaMb) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA]">
      <LanguageButton />
      <div className="mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-thai-bold text-gray-900 thai-text mb-2">
            {t("auth.welcome")}, {user.displayName}!
          </h1>
          <p className="text-gray-600 thai-text">{t("auth.dashboard")}</p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="sm:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="text-center">
                {user.logoUrl ? (
                  <img
                    src={`${user.logoUrl}?v=${encodeURIComponent(
                      user.updatedAt
                    )}`}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4"
                  />
                ) : (
                  <div className="w-30 h-30 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg mx-auto mb-4">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <h2 className="text-2xl font-thai-bold text-gray-900 thai-text mb-6">
                  {user.displayName}
                </h2>
                {/*
                <p className="text-gray-500 thai-text mb-3">@{user.username}</p>
                <div className="flex items-center text-gray-600 justify-center mb-4">
                  <Mail className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="text-sm thai-text">{user.email}</span>
                </div> */}

                {/* Action Buttons */}
                <div className="flex flex-col justify-center gap-2">
                  <button
                    onClick={handleLogout}
                    className="flex justify-center items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 thai-text cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("auth.logout")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="sm:col-span-2 space-y-8">
            {/* Storage Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-thai-bold text-gray-900 mb-4 flex items-center thai-text">
                <HardDrive className="w-5 h-5 mr-2 text-[#00C7A5]" />
                {t("auth.storageInfo")}
              </h3>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2 thai-text">
                  <span>
                    {t("auth.storageUsed")}: {formatStorage(user.storageUsedMb)}{" "}
                    GB
                  </span>
                  <span>
                    {t("auth.storageQuota")}:{" "}
                    {formatStorage(user.storageQuotaMb)} GB
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

            {/* Account Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex mb-4 gap-4">
                <h3 className="text-xl font-thai-bold text-gray-900 flex items-center thai-text">
                  <User2 className="w-5 h-5 mr-2 text-[#00C7A5]" />
                  {t("auth.profile")}
                </h3>
                <button
                  onClick={handleEditProfile}
                  className="flex justify-center text-gray-500 items-center rounded-xl transition-colors duration-200 cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t("auth.editProfile")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 thai-text mb-1">
                    {t("auth.username")}
                  </p>
                  <p className="font-thai-medium text-gray-900 thai-text">
                    {user.username}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 thai-text mb-1">
                    {t("auth.displayName")}
                  </p>
                  <p className="font-thai-medium text-gray-900 thai-text">
                    {user.displayName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 thai-text mb-1">
                    {t("auth.email")}
                  </p>
                  <p className="font-thai-medium text-gray-900 thai-text">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 thai-text mb-1">
                    {t("auth.status")}
                  </p>
                  <p className="font-thai-medium">
                    <span
                      className={`inline-flex px-4 py-1 text-xs rounded-full ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActive ? t("auth.active") : t("auth.inactive")}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            {(user.facebookUrl ||
              user.instagramUrl ||
              user.twitterUrl ||
              user.websiteUrl) && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-thai-bold text-gray-900 mb-4 thai-text">
                  {t("auth.socialLinks")}
                </h3>

                <div className="flex gap-6 items-center text-gray-500 transition-colors duration-200">
                  {user.facebookUrl && (
                    <a
                      href={user.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer hover:text-gray-700"
                    >
                      <SimpleIcon icon={siFacebook} size={26} />
                    </a>
                  )}
                  {user.instagramUrl && (
                    <a
                      href={user.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer hover:text-gray-700"
                    >
                      <SimpleIcon icon={siInstagram} size={26} />
                    </a>
                  )}
                  {user.twitterUrl && (
                    <a
                      href={user.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer hover:text-gray-700"
                    >
                      <SimpleIcon icon={siX} size={25} />
                    </a>
                  )}
                  {user.websiteUrl && (
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer hover:text-gray-700"
                    >
                      <Globe className="w-6.5 h-6.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
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

      {/* Profile Edit Modal */}
      <ProfileEdit
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={user}
        onProfileUpdated={checkAuth}
      />
    </div>
  );
}
