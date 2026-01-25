import { create } from 'zustand';
import type { School } from '@/types/school';
import { schoolService } from '@/services/school-service';

interface SchoolStore {
    schools: School[];
    isLoadingSchools: boolean;
    
    ownerSchools: School[];
    isLoadingOwnerSchools: boolean;
    
    fetchAllActiveSchools: () => Promise<void>;
    fetchSchoolsByOwnerId: (ownerId: number) => Promise<void>;
    clearStore: () => void;
}

export const useSchoolStore = create<SchoolStore>((set) => ({
    schools: [],
    isLoadingSchools: false,
    
    ownerSchools: [],
    isLoadingOwnerSchools: false,
    
    fetchAllActiveSchools: async () => {
        set({ isLoadingSchools: true });
        try {
            const schools = await schoolService.getAllActiveSchools();
            console.log('Fetched schools:', schools);
            set({ schools });
        } catch (error) {
            console.error('Failed to fetch schools:', error);
            set({ schools: [] });
        } finally {
            set({ isLoadingSchools: false });
        }
    },
    
    fetchSchoolsByOwnerId: async (ownerId: number) => {
        set({ isLoadingOwnerSchools: true });
        try {
            const schools = await schoolService.getSchoolsByOwnerId(ownerId);
            set({ ownerSchools: schools });
        } catch (error) {
            console.error('Failed to fetch owner schools:', error);
            set({ ownerSchools: [] });
        } finally {
            set({ isLoadingOwnerSchools: false });
        }
    },
    
    clearStore: () => {
        set({
            schools: [],
            ownerSchools: [],
            isLoadingSchools: false,
            isLoadingOwnerSchools: false
        });
    }
}));
