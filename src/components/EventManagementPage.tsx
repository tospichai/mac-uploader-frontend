"use client";

import { useState, useEffect } from "react";
import {
  EventInfo,
  EventCreateRequest,
  EventUpdateRequest,
  EventsListResponse,
  EventStatisticsResponse,
} from "@/types";
import { eventApiClient } from "@/lib/api/events";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Image,
  HardDrive,
  Check,
  X,
  Save,
  AlertCircle,
} from "lucide-react";

export default function EventManagementPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [statistics, setStatistics] = useState<
    EventStatisticsResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventInfo | null>(null);
  const [formData, setFormData] = useState<EventCreateRequest>({
    title: "",
    eventDate: "",
    subtitle: "",
    description: "",
    folderName: "",
    defaultLanguage: "th",
    status: "draft",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    loadEvents();
    loadStatistics();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApiClient.getEventsList();
      if (response.success) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      showNotification("ไม่สามารถโหลดข้อมูลอีเวนต์ได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await eventApiClient.getEventStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t("events.validation.eventNameRequired");
    }
    if (!formData.eventDate) {
      newErrors.eventDate = t("events.validation.eventDateRequired");
    }
    if (!formData.folderName.trim()) {
      newErrors.folderName = t("events.validation.folderNameRequired");
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.folderName)) {
      newErrors.folderName = t("events.validation.folderNameInvalid");
    }
    if (!formData.defaultLanguage) {
      newErrors.defaultLanguage = t("events.validation.languageRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    try {
      // Validate folder name
      const validation = await eventApiClient.validateFolderName(
        formData.folderName
      );
      if (validation.success && validation.data && !validation.data.available) {
        setErrors({ folderName: t("events.validation.folderNameExists") });
        return;
      }

      const response = await eventApiClient.createEvent(formData);
      if (response.success) {
        showNotification(t("events.eventCreated"), "success");
        setShowCreateModal(false);
        resetForm();
        loadEvents();
        loadStatistics();
      }
    } catch (error) {
      console.error("Error creating event:", error);
      showNotification("ไม่สามารถสร้างอีเวนต์ได้", "error");
    }
  };

  const handleUpdateEvent = async () => {
    if (!validateForm() || !selectedEvent) return;

    try {
      // Validate folder name if changed
      if (formData.folderName !== selectedEvent.folderName) {
        const validation = await eventApiClient.validateFolderName(
          formData.folderName,
          selectedEvent.eventCode
        );
        if (
          validation.success &&
          validation.data &&
          !validation.data.available
        ) {
          setErrors({ folderName: t("events.validation.folderNameExists") });
          return;
        }
      }

      const updateData: EventUpdateRequest = {
        title: formData.title,
        eventDate: formData.eventDate,
        subtitle: formData.subtitle,
        description: formData.description,
        folderName: formData.folderName,
        defaultLanguage: formData.defaultLanguage,
        status: formData.status,
      };

      const response = await eventApiClient.updateEvent(
        selectedEvent.eventCode,
        updateData
      );
      if (response.success) {
        showNotification(t("events.eventUpdated"), "success");
        setShowEditModal(false);
        resetForm();
        loadEvents();
        loadStatistics();
      }
    } catch (error) {
      console.error("Error updating event:", error);
      showNotification("ไม่สามารถอัพเดทอีเวนต์ได้", "error");
    }
  };

  const handleDeleteEvent = async (eventCode: string) => {
    if (!confirm(t("events.confirmDelete"))) return;

    try {
      const response = await eventApiClient.deleteEvent(eventCode);
      if (response.success) {
        showNotification(t("events.eventDeleted"), "success");
        loadEvents();
        loadStatistics();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      showNotification("ไม่สามารถลบอีเวนต์ได้", "error");
    }
  };

  const handlePublishEvent = async (eventCode: string) => {
    try {
      const response = await eventApiClient.publishEvent(eventCode);
      if (response.success) {
        showNotification(t("events.eventPublished"), "success");
        loadEvents();
        loadStatistics();
      }
    } catch (error) {
      console.error("Error publishing event:", error);
      showNotification("ไม่สามารถเผยแพร่อีเวนต์ได้", "error");
    }
  };

  const handleUnpublishEvent = async (eventCode: string) => {
    try {
      const response = await eventApiClient.unpublishEvent(eventCode);
      if (response.success) {
        showNotification(t("events.eventUnpublished"), "success");
        loadEvents();
        loadStatistics();
      }
    } catch (error) {
      console.error("Error unpublishing event:", error);
      showNotification("ไม่สามารถยกเลิกเผยแพร่อีเวนต์ได้", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      eventDate: "",
      subtitle: "",
      description: "",
      folderName: "",
      defaultLanguage: "th",
      status: "draft",
    });
    setErrors({});
    setSelectedEvent(null);
  };

  const openEditModal = (event: EventInfo) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      eventDate: event.eventDate,
      subtitle: event.subtitle || "",
      description: event.description || "",
      folderName: event.folderName,
      defaultLanguage: event.defaultLanguage,
      status: event.status,
    });
    setShowEditModal(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-[#00C7A5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 thai-text">
            {t("events.title")}
          </h1>
          <p className="mt-2 text-gray-600 thai-text">
            จัดการอีเวนต์และรูปภาพของคุณ
          </p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("events.statistics.totalEvents")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.totalEvents}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("events.statistics.publishedEvents")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.publishedEvents}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <EyeOff className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("events.statistics.draftEvents")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.draftEvents}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Image className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("events.statistics.totalPhotos")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statistics.totalPhotos}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <HardDrive className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {t("events.statistics.totalSize")}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatFileSize(statistics.totalSize)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div></div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-[#00C7A5] text-white rounded-lg hover:bg-[#00B595] transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t("events.create")}
          </button>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 thai-text">
              {t("events.noEvents")}
            </h3>
            <p className="text-gray-600 thai-text">
              {t("events.createFirstEvent")}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {events.map((event) => (
                <li key={event.eventCode}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 thai-text">
                            {event.title}
                          </h3>
                          <span
                            className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {event.status === "published" ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                {t("events.published")}
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                {t("events.draft")}
                              </>
                            )}
                          </span>
                        </div>
                        {event.subtitle && (
                          <p className="text-sm text-gray-600 mt-1 thai-text">
                            {event.subtitle}
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="mr-4">
                            {t("events.eventDate")}:{" "}
                            {new Date(event.eventDate).toLocaleDateString(
                              "th-TH"
                            )}
                          </span>
                          <span className="mr-4">
                            {t("events.totalPhotos")}: {event.totalPhotos}
                          </span>
                          <span>
                            {t("events.folderName")}: {event.folderName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {event.status === "draft" ? (
                          <button
                            onClick={() => handlePublishEvent(event.eventCode)}
                            className="p-2 text-green-600 hover:text-green-900"
                            title={t("events.publish")}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUnpublishEvent(event.eventCode)
                            }
                            className="p-2 text-gray-600 hover:text-gray-900"
                            title={t("events.unpublish")}
                          >
                            <EyeOff className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-2 text-blue-600 hover:text-blue-900"
                          title={t("events.edit")}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.eventCode)}
                          className="p-2 text-red-600 hover:text-red-900"
                          title={t("events.delete")}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 thai-text">
                {showCreateModal ? t("events.create") : t("events.edit")}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 thai-text">
                    {t("events.eventName")} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00C7A5] focus:border-[#00C7A5]"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 thai-text">
                    {t("events.eventDate")} *
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00C7A5] focus:border-[#00C7A5]"
                  />
                  {errors.eventDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 thai-text">
                    {t("events.eventSubtitle")}
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subtitle: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00C7A5] focus:border-[#00C7A5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 thai-text">
                    {t("events.eventDescription")}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00C7A5] focus:border-[#00C7A5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 thai-text">
                    {t("events.folderName")} *
                  </label>
                  <input
                    type="text"
                    value={formData.folderName}
                    onChange={(e) =>
                      setFormData({ ...formData, folderName: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00C7A5] focus:border-[#00C7A5]"
                  />
                  {errors.folderName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.folderName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 thai-text">
                    {t("events.defaultLanguage")} *
                  </label>
                  <select
                    value={formData.defaultLanguage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultLanguage: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00C7A5] focus:border-[#00C7A5]"
                  >
                    <option value="th">ไทย</option>
                    <option value="en">English</option>
                    <option value="cn">中文</option>
                    <option value="vn">Tiếng Việt</option>
                  </select>
                  {errors.defaultLanguage && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.defaultLanguage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 thai-text">
                    {t("events.status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "draft" | "published",
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#00C7A5] focus:border-[#00C7A5]"
                  >
                    <option value="draft">{t("events.draft")}</option>
                    <option value="published">{t("events.published")}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 inline mr-1" />
                  {t("gallery.cancel")}
                </button>
                <button
                  onClick={
                    showCreateModal ? handleCreateEvent : handleUpdateEvent
                  }
                  className="px-4 py-2 bg-[#00C7A5] text-white rounded-md hover:bg-[#00B595]"
                >
                  <Save className="h-4 w-4 inline mr-1" />
                  {showCreateModal ? t("events.create") : t("events.edit")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="fixed bottom-4 right-4 z-50">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : notification.type === "error"
                  ? "bg-red-500 text-white"
                  : notification.type === "warning"
                  ? "bg-yellow-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {notification.type === "success" ? (
                <Check className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {notification.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
