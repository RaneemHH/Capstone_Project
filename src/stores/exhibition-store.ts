import { create } from 'zustand';
import { exhibitionService } from '@/services/exhibitionService';
import type { ExhibitionResponse } from '@/types/exhibition';

interface ExhibitionStore {
    exhibitions: ExhibitionResponse[];
    isLoading: boolean;
    error: string | null;
    fetchExhibitions: (orgId: number) => Promise<void>;
    fetchAllExhibitions: () => Promise<void>;
    addExhibition: (exhibition: ExhibitionResponse) => void;
    clearExhibitions: () => void;
}

export const useExhibitionStore = create<ExhibitionStore>((set) => ({
    exhibitions: [],
    isLoading: false,
    error: null,

    fetchExhibitions: async (orgId: number) => {
        set({ isLoading: true, error: null });
        try {
            const exhibitions = await exhibitionService.getExhibitionsByOrg(orgId);
            set({ exhibitions, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch exhibitions:', error);
            set({
                error: error instanceof Error ? error.message : 'فشل في تحميل المعارض',
                isLoading: false
            });
        }
    },

    fetchAllExhibitions: async () => {
        set({ isLoading: true, error: null });
        try {
            const exhibitions = await exhibitionService.getAllExhibitions();
            set({ exhibitions, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch all exhibitions:', error);
            set({
                error: error instanceof Error ? error.message : 'فشل في تحميل المعارض',
                isLoading: false
            });
        }
    },

    addExhibition: (exhibition: ExhibitionResponse) => {
        set((state) => ({
            exhibitions: [exhibition, ...state.exhibitions]
        }));
    },

    clearExhibitions: () => {
        set({ exhibitions: [], error: null });
    },
}));
