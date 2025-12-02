"use client";

import Image from "next/image";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`flex justify-center flex-col items-center text-[#00C7A5] text-sm ${className}`}>
      <Image
        src="/logo.png"
        alt="Live Moments Gallery"
        width={42}
        height={42}
        className="mb-2"
      />
      <p>© 2025 Live Moments Gallery | All Rights Reserved.</p>
    </footer>
  );
}