"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { EventInfo } from "@/types";
import { eventApiClient } from "@/lib/api/events";
import {
  Calendar,
  Plus,
  Eye,
  Trash2,
  X,
  AlertCircle,
  Images,
} from "lucide-react";
import CreateEventModal from "@/components/auth/CreateEventModal";
import ViewEditEventModal from "@/components/auth/ViewEditEventModal";
import GalleryModal from "@/components/auth/GalleryModal";

export default function EventsTab() {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [folderName, setFolderName] = useState<string>("");
  const [photographerDisplayname, setPhotographerDisplayname] =
    useState<string>("");
  const [galleryEventTitle, setGalleryEventTitle] = useState<string>("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    eventName: string;
  }>({
    isOpen: false,
    id: "",
    eventName: "",
  });

  // Use the modal animation hook for delete modal
  const { isClosing, handleClose, getModalStyle, getBackdropStyle } =
    useModalAnimation({
      isOpen: deleteModal.isOpen,
      onClose: () => setDeleteModal({ isOpen: false, id: "", eventName: "" }),
    });

  useEffect(() => {
    loadEvents();
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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, eventName: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      eventName,
    });
  };

  const confirmDeleteEvent = async () => {
    try {
      const response = await eventApiClient.deleteEvent(deleteModal.id);
      if (response.success) {
        setEvents(events.filter((event) => event.id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: "", eventName: "" });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const cancelDelete = () => {
    handleClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center py-12">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-[#00C7A5]"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-thai-bold text-gray-900 thai-text">
          {t("auth.events")}
        </h2>
        {events.length && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-[#00C7A5] text-white rounded-xl hover:bg-[#00A687] transition-colors duration-200 thai-text cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("auth.createEvent")}
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Event Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-[#00C7A5] to-[#A4ECEA] flex items-center justify-center">
              <Calendar className="w-16 h-16 text-white opacity-50" />
            </div>

            {/* Event Details */}
            <div className="p-6">
              <h3 className="text-xl font-thai-bold text-gray-900 thai-text mb-2">
                {event.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(event.eventDate)}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {event.totalPhotos} {t("auth.photos")}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex px-3 py-1 text-xs rounded-full ${
                    event.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.isPublished
                    ? t("gallery.eventDetails.published")
                    : t("gallery.eventDetails.draft")}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedEventId(event.id);
                    setIsViewEditModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t("auth.view")}
                </button>
                <button
                  onClick={() => {
                    setGalleryEventTitle(event.title);
                    setIsGalleryModalOpen(true);
                    setFolderName(event.folderName);
                    setPhotographerDisplayname(event.photographerName);
                  }}
                  className="flex items-center justify-center px-3 py-2 bg-[#00C7A5] text-white rounded-lg hover:bg-[#00B595] transition-colors duration-200 cursor-pointer"
                >
                  <Images className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id, event.title)}
                  className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-thai-medium text-gray-600 thai-text mb-2">
            {t("auth.noEvents")}
          </h3>
          <p className="text-gray-500 thai-text mb-6">
            {t("auth.createFirstEvent")}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-6 py-3 bg-[#00C7A5] text-white rounded-xl hover:bg-[#00A687] transition-colors duration-200 thai-text mx-auto cursor-pointer"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t("auth.createEvent")}
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={() =>
          setTimeout(() => {
            loadEvents();
          }, 0)
        }
      />

      {/* View/Edit Event Modal */}
      <ViewEditEventModal
        isOpen={isViewEditModalOpen}
        onClose={() => {
          setIsViewEditModalOpen(false);
          setSelectedEventId("");
        }}
        eventId={selectedEventId}
        onEventUpdated={() =>
          setTimeout(() => {
            loadEvents();
          }, 0)
        }
      />

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        folderName={folderName}
        eventTitle={galleryEventTitle}
        prefix={'gallery'}
      />

      {/* Delete Confirmation Modal */}
      {(deleteModal.isOpen || isClosing) && (
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
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl transform transition-all duration-300 ease-out"
            style={getModalStyle()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-thai-semibold text-gray-900 thai-text">
                ยืนยันการลบอีเวนต์
              </h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                <p className="text-gray-700 thai-text">
                  คุณต้องการลบอีเวนต์ &quot;
                  <span className="font-semibold">{deleteModal.eventName}</span>
                  &quot; ใช่หรือไม่?
                  <br />
                  <span className="text-sm text-gray-500">
                    การดำเนินการนี้ไม่สามารถยกเลิกได้
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 thai-text cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDeleteEvent}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 thai-text cursor-pointer"
                >
                  ลบอีเวนต์
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
