import { create } from 'zustand';
import { getAllUsers } from '@/services/user-profile-service';

interface UserInfo {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface UsersStore {
    users: Map<number, UserInfo>;
    isLoading: boolean;
    error: string | null;
    
    // Actions
    fetchAllUsers: () => Promise<void>;
    getUserById: (id: number) => UserInfo | undefined;
    clearError: () => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
    users: new Map(),
    isLoading: false,
    error: null,

    fetchAllUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            // Fetch all users without pagination (get a large size)
            const response = await getAllUsers(0, 1000);
            const usersMap = new Map<number, UserInfo>();
            
            response.content.forEach(user => {
                usersMap.set(user.id, user);
            });
            
            set({ users: usersMap, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch users:', error);
            set({ 
                error: 'فشل في تحميل المستخدمين', 
                isLoading: false 
            });
        }
    },

    getUserById: (id: number) => {
        return get().users.get(id);
    },

    clearError: () => set({ error: null }),
}));
