"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   // If user is already authenticated, redirect to dashboard
  //   if (isAuthenticated && !isLoading) {
  //     router.push("/dashboard");
  //   }
  // }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-[#F4F8FA] via-[#E8F1F4] to-[#A4ECEA] flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-[#00C7A5] mx-auto mb-4"></div>
  //         <p className="text-gray-600 thai-text">กำลังตรวจสอบสถานะ...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // If authenticated, don't render anything (redirect will happen)
  // if (isAuthenticated) {
  //   return null;
  // }

  // Show register form for non-authenticated users
  return <RegisterForm />;
}