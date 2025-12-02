"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Camera, LayoutDashboard, Calendar, User, LogOut } from "lucide-react";
import LogoutModal from "./LogoutModal";

interface SidebarProps {
  activeTab: string;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const menuItems = [
    {
      id: "dashboard",
      label: t("auth.dashboard"),
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      id: "events",
      label: t("auth.events"),
      icon: Calendar,
      href: "/events",
    },
    {
      id: "account",
      label: t("auth.account"),
      icon: User,
      href: "/account",
    },
    {
      id: "logout",
      label: t("auth.logout"),
      icon: LogOut,
      action: handleLogoutClick,
    },
  ];

  return (
    <>
      <div className="p-4 sticky top-0">
        {/* Profile Section */}
        <div className="text-center mb-8">
          {user?.logoUrl ? (
            <img
              src={`${user.logoUrl}?v=${encodeURIComponent(user.updatedAt)}`}
              alt="Profile"
              className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4"
            />
          ) : (
            <div className="w-30 h-30 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg mx-auto mb-4">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Tab Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            // Determine active state based on current pathname
            const isActive = item.href ? pathname === item.href : activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 thai-text cursor-pointer ${
                  isActive
                    ? "bg-[#00C7A5] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                } ${
                  item.id === "logout"
                    ? "hover:bg-red-50 hover:text-red-500"
                    : ""
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}
