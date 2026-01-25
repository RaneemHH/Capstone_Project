import { create } from 'zustand';
import { boothService } from '@/services/booth-service';
import type { BoothResponse } from '@/types/booth';
import { toast } from 'sonner';

interface BoothStore {
    booths: BoothResponse[];
    isLoading: boolean;
    error: string | null;
    fetchBooths: (exhibitionId: number) => Promise<void>;
    clearBooths: () => void;
}

export const useBoothStore = create<BoothStore>((set) => ({
    booths: [],
    isLoading: false,
    error: null,

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

    clearBooths: () => {
        set({ booths: [], error: null });
    },
}));
