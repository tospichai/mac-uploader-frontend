"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, User2, Mail, Globe, Shield, CreditCard } from "lucide-react";
import { siFacebook, siInstagram, siX } from "simple-icons";
import SimpleIcon from "@/components/SimpleIcon";
import ProfileEdit from "../ProfileEdit";

export default function AccountTab() {
  const { t } = useTranslation();
  const { user, checkAuth } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex mb-6 justify-between items-center">
          <h3 className="text-xl font-thai-bold text-gray-900 flex items-center thai-text">
            <User2 className="w-5 h-5 mr-2 text-[#00C7A5]" />
            {t("auth.profile")}
          </h3>
          <button
            onClick={handleEditProfile}
            className="flex justify-center items-center px-4 py-2 bg-[#00C7A5] text-white rounded-xl hover:bg-[#00A687] transition-colors duration-200 thai-text cursor-pointer"
          >
            <Edit className="w-4 h-4 mr-2" />
            {t("auth.editProfile")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Social Links */}
      {(user.facebookUrl ||
        user.instagramUrl ||
        user.twitterUrl ||
        user.websiteUrl) && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-thai-bold text-gray-900 mb-4 flex items-center thai-text">
            <Globe className="w-5 h-5 mr-2 text-[#00C7A5]" />
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

      {/* Account Settings */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6">
        <div className="absolute inset-0 bg-black/60 bg-opacity-50 rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-thai-bold text-lg thai-text">{t("auth.underDevelopment") || "กำลังพัฒนา"}</p>
            <p className="text-white text-sm thai-text mt-2">{t("auth.comingSoon") || "เร็วๆ นี้"}</p>
          </div>
        </div>
        <h3 className="text-xl font-thai-bold text-gray-900 mb-4 flex items-center thai-text">
          <Shield className="w-5 h-5 mr-2 text-[#00C7A5]" />
          {t("auth.accountSettings")}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-gray-600" />
              <div>
                <p className="font-thai-medium text-gray-900 thai-text">
                  {t("auth.emailNotifications")}
                </p>
                <p className="text-sm text-gray-600 thai-text">
                  {t("auth.emailNotificationsDesc")}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C7A5]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-3 text-gray-600" />
              <div>
                <p className="font-thai-medium text-gray-900 thai-text">
                  {t("auth.twoFactorAuth")}
                </p>
                <p className="text-sm text-gray-600 thai-text">
                  {t("auth.twoFactorAuthDesc")}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 text-[#00C7A5] border border-[#00C7A5] rounded-xl hover:bg-[#00C7A5] hover:text-white transition-colors duration-200 thai-text">
              {t("auth.enable")}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6">
        <div className="absolute inset-0 bg-black/60 bg-opacity-50 rounded-2xl z-10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-thai-bold text-lg thai-text">{t("auth.underDevelopment") || "กำลังพัฒนา"}</p>
            <p className="text-white text-sm thai-text mt-2">{t("auth.comingSoon") || "เร็วๆ นี้"}</p>
          </div>
        </div>
        <h3 className="text-xl font-thai-bold text-gray-900 mb-4 flex items-center thai-text">
          <CreditCard className="w-5 h-5 mr-2 text-[#00C7A5]" />
          {t("auth.subscription")}
        </h3>

        <div className="p-4 bg-gradient-to-r from-[#00C7A5] to-[#A4ECEA] rounded-xl text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="font-thai-bold">{t("auth.currentPlan")}</span>
            <span className="bg-white text-[#00C7A5] bg-opacity-20 px-3 py-1 rounded-full text-sm">
              {t("auth.proPlan")}
            </span>
          </div>
          <p className="text-sm opacity-90 mb-4">
            {t("auth.planDescription")}
          </p>
          <button className="w-full py-2 bg-white text-[#00C7A5] rounded-lg font-thai-medium hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
            {t("auth.manageSubscription")}
          </button>
        </div>
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