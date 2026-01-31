import { create } from 'zustand';
import { getParticipationStats } from '@/services/dashboard-service';
import type { ParticipationStatsResponse } from '@/services/dashboard-service';
import { toast } from 'sonner';

interface DashboardStore {
    participationStats: ParticipationStatsResponse | null;
    isLoadingStats: boolean;
    error: string | null;
    fetchParticipationStats: (exhibitionId: number) => Promise<void>;
    clearStats: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    participationStats: null,
    isLoadingStats: false,
    error: null,

    fetchParticipationStats: async (exhibitionId: number) => {
        set({ isLoadingStats: true, error: null });
        try {
            const stats = await getParticipationStats(exhibitionId);
            set({ participationStats: stats, isLoadingStats: false });
        } catch (error) {
            const errorMessage = 'فشل في تحميل إحصائيات المشاركة';
            set({ error: errorMessage, isLoadingStats: false });
            toast.error(errorMessage);
            console.error('Failed to fetch participation stats:', error);
        }
    },

    clearStats: () => {
        set({ participationStats: null, error: null });
    },
}));
