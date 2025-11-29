"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-[#00C7A5] mx-auto mb-4"></div>
          <p className="text-gray-600 thai-text">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show fallback or null
  if (!isAuthenticated) {
    return fallback || null;
  }

  // If authenticated, show children
  return <>{children}</>;
}