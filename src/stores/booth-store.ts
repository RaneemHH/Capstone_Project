import { create } from 'zustand';
import { boothService } from '@/services/booth-service';
import { exhibitionService } from '@/services/exhibitionService';
import type { BoothResponse } from '@/types/booth';
import type { AvailableBoothsMap } from '@/types/exhibition';
import { toast } from 'sonner';

interface BoothStore {
    booths: BoothResponse[];
    isLoading: boolean;
    error: string | null;
    availableBooths: AvailableBoothsMap;
    isLoadingAvailable: boolean;
    fetchBooths: (exhibitionId: number) => Promise<void>;
    fetchAvailableBooths: (exhibitionId: number) => Promise<void>;
    clearBooths: () => void;
}

export const useBoothStore = create<BoothStore>((set) => ({
    booths: [],
    isLoading: false,
    error: null,
    availableBooths: {},
    isLoadingAvailable: false,

    fetchBooths: async (exhibitionId: number) => {
        set({ isLoading: true, error: null });
        try {
            const booths = await boothService.getBoothsByExhibition(exhibitionId);
            set({ booths, isLoading: false });
        } catch (error) {
            const errorMessage = 'فشل في تحميل الأكشاك';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            console.error('Failed to fetch booths:', error);
        }
    },

    fetchAvailableBooths: async (exhibitionId: number) => {
        set({ isLoadingAvailable: true, error: null });
        try {
            const availableBooths = await exhibitionService.getAvailableBooths(exhibitionId);
            set({ availableBooths, isLoadingAvailable: false });
        } catch (error) {
            const errorMessage = 'فشل في تحميل الأماكن المتاحة';
            set({ error: errorMessage, isLoadingAvailable: false });
            toast.error(errorMessage);
            console.error('Failed to fetch available booths:', error);
        }
    },

    clearBooths: () => {
        set({ booths: [], availableBooths: {}, error: null });
    },
}));
