"use client";

import { useRef, useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Images,
  Trash2,
  MousePointer2,
  Grid3x3,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { useSelection } from "@/contexts/SelectionContext";
import { galleryApiClient, Photo } from "@/lib/api/gallery";

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
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"qr" | "management">("management");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    isSelectionMode,
    selectedCount,
    toggleSelectionMode,
    selectedPhotos,
    clearSelection,
    MAX_SELECTION_LIMIT,
    handleBatchDownload,
    togglePhotoSelection,
  } = useSelection();

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
      loadPhotos();
    }
  }, [isOpen, folderName]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearSelection();
      setActiveTab("qr");
    }
  }, [isOpen, clearSelection]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      // This would need to be implemented in the API
      // For now, we'll use a placeholder
      const response = await galleryApiClient.getPhotos(folderName);
      if (response.success) {
        // Transform Photo type to match the expected format in component
        const transformedPhotos = response.data.photos.map(photo => ({
          id: photo.id,
          url: photo.thumbnailUrl, // Use thumbnail for grid display
          name: photo.originalFilename || photo.id,
          originalUrl: photo.originalUrl,
          thumbnailUrl: photo.thumbnailUrl,
          originalFilename: photo.originalFilename,
        }));
        setPhotos(transformedPhotos);
      }
    } catch (error) {
      console.error("Error loading photos:", error);
      // For demo purposes, we'll use empty array
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return;

    if (window.confirm(t("gallery.confirmDeleteSelected"))) {
      try {
        // This would need to be implemented in the API
        const photoIds = Array.from(selectedPhotos);
        const response = await galleryApiClient.deletePhotos(folderName, photoIds);

        if (response.success) {
          setPhotos(photos.filter((photo) => !selectedPhotos.has(photo.id)));
          clearSelection();
          // Show success message
        }
      } catch (error) {
        console.error("Error deleting photos:", error);
        // Show error message
      }
    }
  };

  const handleDownloadZip = async () => {
    try {
      // This would need to be implemented in the API
      const photoIds =
        selectedCount > 0
          ? Array.from(selectedPhotos)
          : photos.map((p) => p.id);
      const blob = await galleryApiClient.downloadZip(folderName, photoIds);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderName}-photos.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading zip:", error);
      // Show error message
    }
  };

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

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
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
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out"
        style={getModalStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-thai-semibold text-gray-900 thai-text line-clamp-1">
            {t("galleryModal.title", { eventTitle })}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("management")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === "management"
                ? "text-[#00C7A5] border-b-2 border-[#00C7A5]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("galleryModal.managementTab")}
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
              activeTab === "qr"
                ? "text-[#00C7A5] border-b-2 border-[#00C7A5]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("galleryModal.qrTab")}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "qr" ? (
            <div className="p-6">
              {/* QR Code Section */}
              <div className="flex flex-col items-center mb-6">
                <h3 className="text-lg font-thai-medium text-gray-900 mb-4 thai-text">
                  {t("galleryModal.scanQR")}
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
                      className="w-56 h-56 rounded-xl shadow-md p-4"
                    />
                    <button
                      onClick={downloadQRCode}
                      className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      title={t("galleryModal.downloadQR")}
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl">
                    <p className="text-gray-500 thai-text">
                      {t("galleryModal.qrError")}
                    </p>
                  </div>
                )}
              </div>

              {/* Gallery URL */}
              <div className="mb-6">
                <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                  {t("galleryModal.galleryLink")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Images className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={galleryUrl}
                    readOnly
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text"
                  />
                  <button
                    onClick={() => handleCopy(galleryUrl, "gallery")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-[#00C7A5] transition-colors duration-200"
                    title={t("galleryModal.copyLink")}
                  >
                    {copied === "gallery" ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Gallery Management Section */}
              <div className="mb-6">
                {/* Management Controls */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-thai-medium text-gray-900 thai-text">
                    {t("galleryModal.photoManagement")}
                  </h3>
                  <div className="flex gap-2">
                    {!isSelectionMode ? (
                      <button
                        onClick={toggleSelectionMode}
                        className="flex items-center px-3 py-2 bg-[#00C7A5] text-white rounded-lg hover:bg-[#00B595] transition-colors duration-200 text-sm cursor-pointer"
                      >
                        <MousePointer2 className="w-4 h-4 mr-1" />
                        {t("galleryModal.select")}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        {selectedCount > 0 && (
                          <button
                            onClick={handleDeleteSelected}
                            className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {t("galleryModal.deleteSelected")} ({selectedCount})
                          </button>
                        )}
                        <button
                          onClick={toggleSelectionMode}
                          className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm cursor-pointer"
                        >
                          <X className="w-4 h-4 mr-1" />
                          {t("galleryModal.cancel")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Photos Grid */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-[#00C7A5]"></div>
                  </div>
                ) : photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.originalFilename || photo.id}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {isSelectionMode && (
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40  transition-all duration-200 rounded-lg">
                            <button
                              onClick={() => togglePhotoSelection(photo.id)}
                              className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                selectedPhotos.has(photo.id)
                                  ? "bg-[#00C7A5] border-[#00C7A5]"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              {selectedPhotos.has(photo.id) && (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Grid3x3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 thai-text">
                      {t("galleryModal.noPhotos")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 shrink-0">
          <div className="flex gap-3">
            <button
              onClick={openGallery}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-[#00C7A5] text-white rounded-xl hover:bg-[#00B595] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C7A5] transition-colors duration-200 thai-text cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("galleryModal.openGallery")}
            </button>
            {activeTab === "management" && (
              <button
                onClick={handleDownloadZip}
                className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 thai-text cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("galleryModal.downloadZip")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
