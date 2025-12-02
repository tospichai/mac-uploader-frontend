"use client";

import { useEffect, useRef, useState } from "react";
import { X, Save } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { eventApiClient } from "@/lib/api/events";
import { EventInfo, EventUpdateRequest } from "@/types";

interface ViewEditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onEventUpdated: () => void;
}

export default function ViewEditEventModal({
  isOpen,
  onClose,
  eventId,
  onEventUpdated,
}: ViewEditEventModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  // Use the modal animation hook
  const { isClosing, handleClose, getModalStyle, getBackdropStyle } =
    useModalAnimation({
      isOpen,
      onClose,
    });

  // Form state
  const [formData, setFormData] = useState<EventUpdateRequest>({
    title: "",
    eventDate: "",
    subtitle: "",
    description: "",
    folderName: "",
    defaultLanguage: "th",
    isPublished: true,
  });

  // Original event data
  const [originalData, setOriginalData] = useState<EventInfo | null>(null);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load event data when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      loadEventData();
    }
  }, [isOpen, eventId]);

  const loadEventData = async () => {
    setIsLoading(true);
    try {
      const response = await eventApiClient.getEvent(eventId);
      console.log("Event response:", response); // Debug log
      if (response.success) {
        // Ensure required fields are present before creating the event object
        const data = response.data
        const event: EventInfo = {
          id: data.id,
          title: data.title || "",
          eventDate: data.eventDate || "",
          subtitle: data.subtitle,
          description: data.description,
          folderName: data.folderName || "",
          defaultLanguage: data.defaultLanguage || "th",
          isPublished: data.isPublished || false,
          photographerName: data.photographerName || "",
          createdAt: data.createdAt || new Date().toISOString(),
          totalPhotos: data.totalPhotos || 0,
          totalSize: data.totalSize,
        };
        console.log("Event data:", event); // Debug log
        setOriginalData(event);

        // Format the date for the date input field (YYYY-MM-DD)
        let formattedDate = "";
        if (event.eventDate) {
          try {
            const date = new Date(event.eventDate);
            // Check if the date is valid
            if (!isNaN(date.getTime())) {
              // Format as YYYY-MM-DD for the input field
              formattedDate = date.toISOString().split('T')[0];
            }
          } catch (error) {
            console.error("Error formatting date:", error);
          }
        }

        setFormData({
          title: event.title,
          eventDate: formattedDate,
          subtitle: event.subtitle || "",
          description: event.description || "",
          folderName: event.folderName,
          defaultLanguage: event.defaultLanguage,
          isPublished: event.isPublished,
        });
      } else {
        setSubmitError(t("viewEditEventModal.loadEventError"));
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      setSubmitError(t("viewEditEventModal.loadEventError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [handleClose, isOpen, onClose]);

  if (!isOpen && !isClosing) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Event name validation
    if (!formData.title?.trim()) {
      newErrors.title = t("events.validation.eventNameRequired");
    } else if (formData.title.length > 200) {
      newErrors.title = t("viewEditEventModal.eventNameMaxLength");
    }

    // Event date validation
    if (!formData.eventDate) {
      newErrors.eventDate = t("events.validation.eventDateRequired");
    }

    // Folder name validation
    if (!formData.folderName?.trim()) {
      newErrors.folderName = t("events.validation.folderNameRequired");
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.folderName)) {
      newErrors.folderName = t("events.validation.folderNameInvalid");
    } else if (
      formData.folderName.length < 3 ||
      formData.folderName.length > 100
    ) {
      newErrors.folderName = t("viewEditEventModal.folderNameLength");
    }

    // Default language validation
    if (!formData.defaultLanguage) {
      newErrors.defaultLanguage = t("events.validation.languageRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convert the date from YYYY-MM-DD to ISO-8601 format for the backend
      const updatedFormData = {
        ...formData,
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : formData.eventDate,
      };

      const response = await eventApiClient.updateEvent(eventId, updatedFormData);
      if (response.success) {
        onEventUpdated();
        handleClose();
      } else {
        setSubmitError(t("viewEditEventModal.updateEventError"));
      }
    } catch (error: unknown) {
      console.error("Error updating event:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          setSubmitError(axiosError.response.data.message);
        } else {
          setSubmitError(t("viewEditEventModal.updateEventGenericError"));
        }
      } else {
        setSubmitError(t("viewEditEventModal.updateEventGenericError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for folder name - only allow valid characters
    if (name === "folderName") {
      const validValue = value.replace(/[^a-zA-Z0-9_-]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: validValue,
      }));

      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  //       <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
  //       <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-12">
  //         <div className="flex flex-col items-center justify-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-[#00C7A5]"></div>
  //           <p className="mt-4 text-gray-600 thai-text">กำลังโหลดข้อมูลอีเวนต์...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        style={getBackdropStyle()}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out"
        style={getModalStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 ">
          <h2 className="text-xl font-thai-semibold text-gray-900 thai-text">
            {t("viewEditEventModal.title")}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Event Date */}
            <div className="mb-4">
              <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                {t("events.eventDate")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    eventDate: dateValue,
                  }));
                  if (errors.eventDate) {
                    setErrors((prev) => ({
                      ...prev,
                      eventDate: "",
                    }));
                  }
                }}
                className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${
                  errors.eventDate ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("viewEditEventModal.datePlaceholder")}
              />
              {errors.eventDate && (
                <p className="mt-1 text-sm text-red-500 thai-text">
                  {errors.eventDate}
                </p>
              )}
            </div>

            {/* Event Name */}
            <div className="mb-4">
              <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                {t("events.eventName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("viewEditEventModal.eventNamePlaceholder")}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500 thai-text">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Event Subtitle (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                {t("events.eventSubtitle")}
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text"
                placeholder={t("viewEditEventModal.eventSubtitlePlaceholder")}
                maxLength={200}
              />
            </div>

            {/* Event Description (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                {t("events.eventDescription")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text resize-none"
                placeholder={t("viewEditEventModal.eventDescriptionPlaceholder")}
                rows={3}
                maxLength={5000}
              />
            </div>

            {/* Folder Name */}
            <div className="mb-4">
              <label className="block text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                {t("events.folderName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="folderName"
                value={formData.folderName}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text ${
                  errors.folderName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("viewEditEventModal.folderNamePlaceholder")}
              />
              {errors.folderName && (
                <p className="mt-1 text-sm text-red-500 thai-text">
                  {errors.folderName}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 thai-text">
                {t("viewEditEventModal.folderNameHelp")}
              </p>
            </div>

            {/* Default Language */}
            <div className="mb-4">
              <label className="block text-sm font-thai-medium text-gray-900 mb-2 thai-text">
                {t("events.defaultLanguage")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="defaultLanguage"
                value={formData.defaultLanguage}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:border-transparent thai-text text-gray-900 ${
                  errors.defaultLanguage ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="th">ไทย</option>
                <option value="en">English</option>
                <option value="cn">中文</option>
                <option value="vn">Tiếng Việt</option>
              </select>
              {errors.defaultLanguage && (
                <p className="mt-1 text-sm text-red-500 thai-text">
                  {errors.defaultLanguage}
                </p>
              )}
            </div>

            {/* Event Info Display */}
            {originalData && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-thai-medium text-gray-700 mb-2 thai-text">
                  {t("viewEditEventModal.additionalInfo")}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 thai-text">
                  <p>{t("viewEditEventModal.eventId")}: {originalData.id}</p>
                  <p>
                    {t("viewEditEventModal.createdAt")}:{" "}
                    {new Date(originalData.createdAt).toLocaleDateString(
                      "th-TH"
                    )}
                  </p>
                  <p>{t("viewEditEventModal.photoCount")}: {originalData.totalPhotos} รูป</p>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl">
                <p className="text-sm text-red-700 thai-text">{submitError}</p>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Submit Button */}
        <div className="p-6 border-t border-gray-200 shrink-0">
          <div className="flex justify-between items-center">
            {/* Status Toggle */}
            <div className="flex items-center">
              <label className="text-sm font-thai-medium text-gray-700 mr-3 thai-text">
                {t("events.status")}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublished: !prev.isPublished,
                    }))
                  }
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00C7A5] focus:ring-offset-2 cursor-pointer"
                  style={{
                    backgroundColor: formData.isPublished
                      ? "#00C7A5"
                      : "#D1D5DB",
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{
                      transform: formData.isPublished
                        ? "translateX(1.25rem)"
                        : "translateX(0.25rem)",
                    }}
                  />
                </button>
                <span className="ml-3 text-sm thai-text">
                  {formData.isPublished ? (
                    <span className="text-[#00C7A5] font-thai-medium">
                      {t("events.published")}
                    </span>
                  ) : (
                    <span className="text-gray-500 font-thai-medium">
                      {t("events.draft")}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Update Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async (e) => {
                e.preventDefault();
                const syntheticEvent = new Event("submit", {
                  bubbles: true,
                  cancelable: true,
                }) as unknown as React.FormEvent;
                await handleSubmit(syntheticEvent);
              }}
              className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-thai-bold text-white bg-[#00C7A5] hover:bg-[#00B595] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00C7A5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 thai-text flex items-center cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("viewEditEventModal.updating")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("viewEditEventModal.updateEvent")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
