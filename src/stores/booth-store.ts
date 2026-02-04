import { create } from 'zustand';
import { boothService } from '@/services/booth-service';
import { exhibitionService } from '@/services/exhibitionService';
import type { BoothResponse } from '@/types/booth';
import type { AvailableBoothsMap } from '@/types/exhibition';
import { toast } from 'sonner';
import { getMergedBooths, getMockDataForExhibition } from '@/mockDataForCharts/mockExhibitionDetails';

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
            const mergedBooths = getMergedBooths(booths, exhibitionId);
            set({ booths: mergedBooths, isLoading: false });
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
            
            // Merge with mock data if available for this exhibition
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.boothDistributionData) {
                // Calculate totals from mock booth data
                const mockTotalBooths = mockData.booths.length;
                const mockUniversityBooths = mockData.booths.filter(b => b.type === 'UNIVERSITY').length;
                const mockActivityProviderBooths = mockData.booths.filter(b => b.type === 'ACTIVITY_PROVIDER').length;
                const currentRemaining = availableBooths.remainingBooths || 0;
                const mockRemainingBooths = Math.max(0, 50 - mockTotalBooths);
                
                const totalRemaining = currentRemaining + mockRemainingBooths;
                const totalUni = (availableBooths.usedUniBoothNb || 0) + mockUniversityBooths;
                const totalActivity = (availableBooths.usedActivityProvidersNb || 0) + mockActivityProviderBooths;
                
                const mergedAvailableBooths: AvailableBoothsMap = {
                    remainingBooths: totalRemaining,
                    usedUniBoothNb: totalUni,
                    usedActivityProvidersNb: totalActivity,
                    totalAvailableBooths: totalRemaining + totalUni + totalActivity,
                };
                set({ availableBooths: mergedAvailableBooths, isLoadingAvailable: false });
            } else {
                set({ availableBooths, isLoadingAvailable: false });
            }
        } catch (error) {
            console.error('Failed to fetch available booths:', error);
            // Use only mock data if available and API fails
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.boothDistributionData) {
                const totalBooths = mockData.booths.length;
                const universityBooths = mockData.booths.filter(b => b.type === 'UNIVERSITY').length;
                const activityProviderBooths = mockData.booths.filter(b => b.type === 'ACTIVITY_PROVIDER').length;
                const remainingBooths = Math.max(0, 50 - totalBooths);
                
                const mockAvailableBooths: AvailableBoothsMap = {
                    remainingBooths: remainingBooths,
                    usedUniBoothNb: universityBooths,
                    usedActivityProvidersNb: activityProviderBooths,
                    totalAvailableBooths: remainingBooths + universityBooths + activityProviderBooths,
                };
                set({ availableBooths: mockAvailableBooths, isLoadingAvailable: false, error: null });
            } else {
                const errorMessage = 'فشل في تحميل الأماكن المتاحة';
                set({ error: errorMessage, isLoadingAvailable: false });
                toast.error(errorMessage);
            }
        }
    },

    clearBooths: () => {
        set({ booths: [], availableBooths: {}, error: null });
    },
}));
