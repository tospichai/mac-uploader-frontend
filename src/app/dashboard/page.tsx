"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Dashboard from "@/components/auth/Dashboard";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect will happen via ProtectedRoute
    // If authenticated but no user data, something is wrong
    if (isAuthenticated && !user && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-[#00C7A5] mx-auto mb-4"></div>
          <p className="text-gray-600 thai-text">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  // Show dashboard only when authenticated and user data is available
  return <Dashboard />;
}
