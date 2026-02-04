import { create } from 'zustand';
import { municipalityService } from '@/services/municipalityService';
import type { MunicipalityResponse } from '@/types/municipality';

interface MunicipalityStore {
    municipalities: MunicipalityResponse[];
    isLoading: boolean;
    error: string | null;
    selectedMunicipalityId: number | null;
    fetchMunicipalities: () => Promise<void>;
    setSelectedMunicipality: (id: number) => void;
    clearMunicipalities: () => void;
}

export const useMunicipalityStore = create<MunicipalityStore>((set) => ({
    municipalities: [],
    isLoading: false,
    error: null,
    selectedMunicipalityId: null,

    fetchMunicipalities: async () => {
        set({ isLoading: true, error: null });
        try {
            const municipalities = await municipalityService.getAllMunicipalities();
            // Note: Merging will happen at component level based on exhibition ID
            set({ municipalities, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch municipalities:', error);
            set({
                error: error instanceof Error ? error.message : 'فشل في تحميل البلديات',
                isLoading: false
            });
        }
    },

    setSelectedMunicipality: (id: number) => {
        set({ selectedMunicipalityId: id });
    },

    clearMunicipalities: () => {
        set({ municipalities: [], error: null, selectedMunicipalityId: null });
    },
}));
