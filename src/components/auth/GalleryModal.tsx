"use client";

import { useRef, useState, useEffect } from "react";
import { X, ExternalLink, Download } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useModalAnimation } from "@/hooks/useModalAnimation";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  folderName: string;
  prefix: string;
}

export default function GalleryModal({
  isOpen,
  onClose,
  eventTitle,
  folderName,
  prefix,
}: GalleryModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Use the modal animation hook
  const { isClosing, handleClose, getModalStyle, getBackdropStyle } =
    useModalAnimation({
      isOpen,
      onClose,
    });

  // Generate gallery URL
  const galleryUrl = `${window.location.origin}/gallery/${prefix}_${folderName}`;

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen && folderName) {
      generateQRCode();
    }
  }, [isOpen, folderName]);

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      // Using a free QR code API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        galleryUrl
      )}`;
      setQrCodeUrl(qrApiUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode-${folderName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openGallery = () => {
    window.open(galleryUrl, "_blank");
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        style={getBackdropStyle()}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out"
        style={getModalStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-thai-semibold text-gray-900 thai-text">
            แกลเลอรี่: {eventTitle}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* QR Code Section */}
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-lg font-thai-medium text-gray-900 mb-4 thai-text">
              สแกน QR Code เพื่อเข้าชมแกลเลอรี่
            </h3>

            {isGeneratingQR ? (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-l-2 border-[#00C7A5]"></div>
              </div>
            ) : qrCodeUrl ? (
              <div className="relative">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for Gallery"
                  className="w-48 h-48 rounded-xl shadow-md"
                />
                <button
                  onClick={downloadQRCode}
                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                  title="ดาวน์โหลด QR Code"
                >
                  <Download className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl">
                <p className="text-gray-500 thai-text">
                  ไม่สามารถสร้าง QR Code
                </p>
              </div>
            )}
          </div>

          {/* Gallery URL */}
          <div className="mb-6">
            <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
              ลิงก์แกลเลอรี่
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={galleryUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-xl bg-gray-50 text-gray-700 text-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(galleryUrl)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r-xl transition-colors duration-200 text-sm"
              >
                คัดลอก
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 shrink-0">
          <button
            onClick={openGallery}
            className="w-full flex items-center justify-center px-6 py-3 bg-[#00C7A5] text-white rounded-xl hover:bg-[#00B595] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C7A5] transition-colors duration-200 thai-text cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            เปิดแกลเลอรี่
          </button>
        </div>
      </div>
    </div>
  );
}
