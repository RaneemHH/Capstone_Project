import { create } from "zustand";
import { getUserById } from "@/services/user-profile-service";

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface UserProfileState {
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchUserProfile: (userId: number) => Promise<void>;
    setUserProfile: (profile: UserProfile | null) => void;
    clearUserProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>((set) => ({
    userProfile: null,
    isLoading: false,
    error: null,

    fetchUserProfile: async (userId: number) => {
        set({ isLoading: true, error: null });
        try {
            const profile = await getUserById(userId);
            console.log("profile", profile);
            set({ userProfile: profile, isLoading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch user profile";
            set({ error: errorMessage, isLoading: false });
            console.error("Failed to fetch user profile:", error);
        }
    },

    setUserProfile: (profile: UserProfile | null) => {
        set({ userProfile: profile, error: null });
    },

    clearUserProfile: () => {
        set({ userProfile: null, error: null, isLoading: false });
    },
}));
