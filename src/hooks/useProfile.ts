import { useMutation, useQueryClient } from "@tanstack/react-query";
import authApiClient from "@/lib/api/auth";
import { ProfileUpdateRequest } from "@/types/auth";

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ProfileUpdateRequest | FormData) => {
            const response = await authApiClient.updateProfile(data);
            if (!response.success && response.message) {
                throw new Error(response.message);
            }
            return response.user;
        },
        onSuccess: (data) => {
            // If we were using React Query for auth user, we would invalidate here.
            // queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        },
    });
}
