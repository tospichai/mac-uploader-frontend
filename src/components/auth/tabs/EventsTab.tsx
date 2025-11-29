"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Calendar, Plus, Eye, Settings, Trash2 } from "lucide-react";

// Mock events data - replace with actual API call
const mockEvents = [
  {
    id: 1,
    name: "Wedding Ceremony",
    date: "2025-01-15",
    photos: 245,
    status: "active",
  },
  {
    id: 2,
    name: "Birthday Party",
    date: "2025-01-10",
    photos: 132,
    status: "active",
  },
  {
    id: 3,
    name: "Corporate Event",
    date: "2024-12-20",
    photos: 567,
    status: "archived",
  },
];

export default function EventsTab() {
  const { t } = useTranslation();
  const [events] = useState(mockEvents);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-thai-bold text-gray-900 thai-text">
          {t("auth.events")}
        </h2>
        <button className="flex items-center px-4 py-2 bg-[#00C7A5] text-white rounded-xl hover:bg-[#00A687] transition-colors duration-200 thai-text">
          <Plus className="w-4 h-4 mr-2" />
          {t("auth.createEvent")}
        </button>
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
                {event.name}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {event.photos} {t("auth.photos")}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex px-3 py-1 text-xs rounded-full ${
                    event.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.status === "active" ? t("auth.active") : t("auth.archived")}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  {t("auth.view")}
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200">
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
          <button className="flex items-center px-6 py-3 bg-[#00C7A5] text-white rounded-xl hover:bg-[#00A687] transition-colors duration-200 thai-text mx-auto">
            <Plus className="w-5 h-5 mr-2" />
            {t("auth.createEvent")}
          </button>
        </div>
      )}
    </div>
  );
}