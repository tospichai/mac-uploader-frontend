import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authApiClient from "@/lib/api/auth";

export const systemKeys = {
    all: ["system"] as const,
    info: () => [...systemKeys.all, "info"] as const,
};

export function useSystemInfo() {
    return useQuery({
        queryKey: systemKeys.info(),
        queryFn: async () => {
            const response = await authApiClient.getSystemInformation();
            if (!response.success && response.message) {
                throw new Error(response.message);
            }
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useGenerateApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await authApiClient.generateApiKey();
            if (!response.success && response.message) {
                throw new Error(response.message);
            }
            return response;
        },
        onSuccess: (data) => {
            // Invalidate queries or update context if necessary
            // Since API key is part of user profile, we might want to invalidate user profile
            // But for now, the component handles updating the user object locally or we rely on profile refetch
            queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
        },
    });
}
