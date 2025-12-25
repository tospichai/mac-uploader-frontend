import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import eventApiClient from "@/lib/api/events";
import { EventCreateRequest, EventUpdateRequest } from "@/types";

export const eventKeys = {
    all: ["events"] as const,
    lists: () => [...eventKeys.all, "list"] as const,
    list: (page: number, limit: number) =>
        [...eventKeys.lists(), { page, limit }] as const,
    details: () => [...eventKeys.all, "detail"] as const,
    detail: (code: string) => [...eventKeys.details(), code] as const,
    statistics: () => [...eventKeys.all, "statistics"] as const,
};

export function useEvents(page: number = 1, limit: number = 10) {
    return useQuery({
        queryKey: eventKeys.list(page, limit),
        queryFn: async () => {
            const response = await eventApiClient.getEventsList(page, limit);
            if (!response.success) {
                throw new Error("Failed to fetch events");
            }
            return response.data;
        },
    });
}

export function useEvent(eventCode: string, enabled: boolean = true) {
    return useQuery({
        queryKey: eventKeys.detail(eventCode),
        queryFn: async () => {
            const response = await eventApiClient.getEvent(eventCode);
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch event");
            }
            return response.data;
        },
        enabled: enabled && !!eventCode,
    });
}

export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventData: EventCreateRequest) => {
            const response = await eventApiClient.createEvent(eventData);
            if (!response.success) {
                throw new Error(response.message || "Failed to create event");
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
        },
    });
}

export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            eventCode,
            eventData,
        }: {
            eventCode: string;
            eventData: EventUpdateRequest;
        }) => {
            const response = await eventApiClient.updateEvent(eventCode, eventData);
            if (!response.success) {
                throw new Error(response.message || "Failed to update event");
            }
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
            if (data && data.id) {
                queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.id) });
            }
        },
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventCode: string) => {
            const response = await eventApiClient.deleteEvent(eventCode);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to delete event");
            }
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
        },
    });
}

export function usePublishEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventCode: string) => {
            const response = await eventApiClient.publishEvent(eventCode);
            if (!response.success) {
                throw new Error(response.message || "Failed to publish event");
            }
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
            if (data && data.id) {
                queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.id) });
            }
        },
    });
}

export function useUnpublishEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventCode: string) => {
            const response = await eventApiClient.unpublishEvent(eventCode);
            if (!response.success) {
                throw new Error(response.message || "Failed to unpublish event");
            }
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
            if (data && data.id) {
                queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.id) });
            }
        },
    });
}

export function useValidateFolderName() {
    return useMutation({
        mutationFn: async ({
            folderName,
            excludeEventCode,
        }: {
            folderName: string;
            excludeEventCode?: string;
        }) => {
            const response = await eventApiClient.validateFolderName(
                folderName,
                excludeEventCode
            );
            return response;
        },
    });
}
