"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterRequest } from "@/types/auth";
import { Eye, EyeOff, Camera, Mail, Lock, User2 } from "lucide-react";
import Image from "next/image";
import RegistrationSuccess from "./RegistrationSuccess";

export default function RegisterForm() {
  const { t } = useTranslation();
  const { register, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    displayName: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    websiteUrl: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccessful, setRegistrationSuccessful] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = t("auth.requiredField");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("auth.requiredField");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth.invalidEmail");
    }

    if (!formData.password.trim()) {
      newErrors.password = t("auth.requiredField");
    } else if (formData.password.length < 6) {
      newErrors.password = t("auth.passwordTooShort");
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t("auth.requiredField");
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = t("auth.passwordMismatch");
    }

    if (!formData.displayName.trim()) {
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
      await register(formData);
      // Registration successful, show success page
      setRegistrationSuccessful(true);
    } catch (error: unknown) {
      const errorMessage = error as { message?: string };
      setErrors({ submit: errorMessage.message || t("auth.registerError") });
    }
  };

  const handleLoginClick = () => {
    router.push("/");
  };

  // If registration is successful and user is authenticated, show success page
  if (registrationSuccessful && isAuthenticated) {
    return <RegistrationSuccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA] flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
            <Camera className="w-12 h-12 text-[#00C7A5]" />
          </div>
          <h1 className="text-3xl font-thai-bold text-gray-900 thai-text mb-2">
            {t("auth.registerTitle")}
          </h1>
          <p className="text-gray-600 thai-text">
            {t("auth.registerSubtitle")}
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username and Display Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                  {t("auth.username")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={t("auth.username")}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 thai-text">{errors.username}</p>
                )}
              </div>

              {/* Display Name Field */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                  {t("auth.displayName")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${
                      errors.displayName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={t("auth.displayName")}
                    disabled={isLoading}
                  />
                </div>
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600 thai-text">{errors.displayName}</p>
                )}
              </div>
            </div>

            {/* Email Field - Full Width */}
            <div>
              <label htmlFor="email" className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                {t("auth.email")} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("auth.email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 thai-text">{errors.email}</p>
              )}
            </div>

            {/* Password and Confirm Password Fields in the same row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                  {t("auth.password")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={t("auth.password")}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 thai-text">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                  {t("auth.confirmPassword")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={t("auth.confirmPassword")}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 thai-text">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl thai-text">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-thai-bold text-white bg-[#00C7A5] hover:bg-[#00B595] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C7A5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 thai-text cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("common.loading")}
                </div>
              ) : (
                t("auth.register")
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 thai-text">
              {t("auth.hasAccount")}{" "}
              <button
                onClick={handleLoginClick}
                className="font-thai-medium text-[#00C7A5] hover:text-[#00B595] transition-colors duration-200 cursor-pointer"
              >
                {t("auth.login")}
              </button>
            </p>
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