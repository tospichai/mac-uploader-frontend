"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { useAuth } from "@/contexts/AuthContext";
import { Photographer, ProfileUpdateRequest } from "@/types/auth";
import { useUpdateProfile } from "@/hooks/useProfile";
import {
  X,
  Save,
  Camera,
  Globe,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

interface ProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  user: Photographer;
  onProfileUpdated?: () => void;
}

export default function ProfileEdit({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: ProfileEditProps) {
  const { t } = useTranslation();
  const { checkAuth } = useAuth();
  const { mutateAsync: updateProfile, isPending: isSubmitting } = useUpdateProfile();
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { isClosing, handleClose, getModalStyle, getBackdropStyle } =
    useModalAnimation({ isOpen, onClose });

  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    displayName: user.displayName,
    logoUrl: user.logoUrl || "",
    facebookUrl: user.facebookUrl || "",
    instagramUrl: user.instagramUrl || "",
    twitterUrl: user.twitterUrl || "",
    websiteUrl: user.websiteUrl || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset form when user changes
    const timer = setTimeout(() => {
      setFormData({
        displayName: user.displayName,
        logoUrl: user.logoUrl || "",
        facebookUrl: user.facebookUrl || "",
        instagramUrl: user.instagramUrl || "",
        twitterUrl: user.twitterUrl || "",
        websiteUrl: user.websiteUrl || "",
      });
      setErrors({});
    }, 0);

    return () => clearTimeout(timer);
  }, [user]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleClose, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      // Create preview URL for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName?.trim()) {
      newErrors.displayName = t("auth.requiredField");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add profile image if exists
      if (profileImageFile) {
        formDataToSend.append("profileImage", profileImageFile);
      }

      // Add other form fields with fallback to empty string
      formDataToSend.append("displayName", formData.displayName || "");
      formDataToSend.append("facebookUrl", formData.facebookUrl || "");
      formDataToSend.append("instagramUrl", formData.instagramUrl || "");
      formDataToSend.append("twitterUrl", formData.twitterUrl || "");
      formDataToSend.append("websiteUrl", formData.websiteUrl || "");

      await updateProfile(formDataToSend);
      await checkAuth();

      // Notify parent component that profile was updated
      if (onProfileUpdated) {
        onProfileUpdated();
      }

      handleClose();
    } catch (error: unknown) {
      const errorMessage = error as { message?: string };
      setErrors({
        submit: errorMessage.message || t("auth.profileUpdateError"),
      });
    }
  };

  const getLogoSrc = (url: string, updatedAt: string): string => {
    if (!url) return ""; // กัน null/undefined

    // ถ้าเป็น base64 (data:image/...)
    if (url.startsWith("data:image/")) {
      return url;
    }

    // ถ้าเป็น URL ปกติ เติม version กัน cache
    return `${url}?v=${encodeURIComponent(updatedAt)}`;
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${getBackdropStyle().opacity === 0 ? "opacity-0" : "opacity-100"
          }`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out"
        style={getModalStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-2xl font-thai-bold text-gray-900 thai-text">
            {t("auth.editProfile")}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Profile Picture Section */}
            <div>
              <div className="text-center">
                <div className="relative inline-block">
                  {formData.logoUrl ? (
                    <img
                      src={getLogoSrc(formData.logoUrl, user.updatedAt)}
                      alt="Profile"
                      className="w-45 h-45 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-45 h-45 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                    className="absolute bottom-2 right-2 bg-[#00C7A5] text-white p-2 rounded-full shadow-lg hover:bg-[#00B595] transition-colors duration-200 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div>
              <h3 className="text-lg font-thai-bold text-gray-900 mb-4 thai-text">
                {t("auth.accountInfo")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                    {t("auth.username")}
                  </label>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-200 text-gray-600 thai-text"
                    readOnly
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                    {t("auth.email")}
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-gray-200 text-gray-600 thai-text"
                    readOnly
                  />
                </div>
              </div>

              {/* Display Name - Full Width */}
              <div className="mt-6">
                <label
                  htmlFor="displayName"
                  className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text"
                >
                  {t("auth.displayName")} *
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${errors.displayName ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder={t("auth.displayName")}
                  disabled={isSubmitting}
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600 thai-text">
                    {errors.displayName}
                  </p>
                )}
              </div>
            </div>

            {/* Social Media Links Section */}
            <div>
              <h3 className="text-lg font-thai-bold text-gray-900 mb-4 thai-text">
                {t("auth.socialMediaLinks")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook URL */}
                <div>
                  <label
                    htmlFor="facebookUrl"
                    className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text"
                  >
                    <Facebook className="inline h-4 w-4 mr-1" />
                    {t("auth.facebookUrl")}
                  </label>
                  <input
                    id="facebookUrl"
                    name="facebookUrl"
                    type="url"
                    value={formData.facebookUrl}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text"
                    placeholder="https://facebook.com/yourpage"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Instagram URL */}
                <div>
                  <label
                    htmlFor="instagramUrl"
                    className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text"
                  >
                    <Instagram className="inline h-4 w-4 mr-1" />
                    {t("auth.instagramUrl")}
                  </label>
                  <input
                    id="instagramUrl"
                    name="instagramUrl"
                    type="url"
                    value={formData.instagramUrl}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text"
                    placeholder="https://instagram.com/yourprofile"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Twitter URL */}
                <div>
                  <label
                    htmlFor="twitterUrl"
                    className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text"
                  >
                    <Twitter className="inline h-4 w-4 mr-1" />
                    {t("auth.twitterUrl")}
                  </label>
                  <input
                    id="twitterUrl"
                    name="twitterUrl"
                    type="url"
                    value={formData.twitterUrl}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text"
                    placeholder="https://twitter.com/yourhandle"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Website URL */}
                <div>
                  <label
                    htmlFor="websiteUrl"
                    className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text"
                  >
                    <Globe className="inline h-4 w-4 mr-1 " />
                    {t("auth.websiteUrl")}
                  </label>
                  <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text"
                    placeholder="https://yourwebsite.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl thai-text">
                {errors.submit}
              </div>
            )}
          </form>
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="p-6 border-t border-gray-200 shrink-0">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-thai-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C7A5] transition-colors duration-200 thai-text cursor-pointer"
              disabled={isSubmitting}
            >
              {t("auth.cancel")}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async (e) => {
                e.preventDefault();
                if (formRef.current) {
                  // Create a synthetic form event to trigger validation
                  const syntheticEvent = new Event("submit", {
                    bubbles: true,
                    cancelable: true,
                  }) as unknown as React.FormEvent;

                  // Call handleSubmit directly with the synthetic event
                  await handleSubmit(syntheticEvent);
                }
              }}
              className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-thai-bold text-white bg-[#00C7A5] hover:bg-[#00B595] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C7A5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 thai-text flex items-center cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("auth.saveProfile")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
