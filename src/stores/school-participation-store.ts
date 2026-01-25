import { create } from 'zustand';
import type { SchoolParticipationResponse } from '@/types/school-participation';
import { schoolParticipationService } from '@/services/school-participation-service';

interface SchoolParticipationStore {
    // School's participations
    schoolParticipations: SchoolParticipationResponse[];
    isLoadingSchoolParticipations: boolean;
    
    // Exhibition participations (for org admin)
    exhibitionParticipations: Map<number, SchoolParticipationResponse[]>;
    isLoadingExhibitionParticipations: boolean;
    
    // Actions
    fetchParticipationsBySchoolId: (schoolId: number) => Promise<void>;
    fetchParticipationsByExhibition: (exhibitionId: number) => Promise<void>;
    clearStore: () => void;
}

export const useSchoolParticipationStore = create<SchoolParticipationStore>((set, get) => ({
    schoolParticipations: [],
    isLoadingSchoolParticipations: false,
    
    exhibitionParticipations: new Map(),
    isLoadingExhibitionParticipations: false,
    
    fetchParticipationsBySchoolId: async (schoolId: number) => {
        set({ isLoadingSchoolParticipations: true });
        try {
            const participations = await schoolParticipationService.getParticipationsBySchoolId(schoolId);
            set({ schoolParticipations: participations });
        } catch (error) {
            console.error('Failed to fetch school participations:', error);
            set({ schoolParticipations: [] });
        } finally {
            set({ isLoadingSchoolParticipations: false });
        }
    },
    
    fetchParticipationsByExhibition: async (exhibitionId: number) => {
        set({ isLoadingExhibitionParticipations: true });
        try {
            const participations = await schoolParticipationService.getParticipationsByExhibition(exhibitionId);
            const newMap = new Map(get().exhibitionParticipations);
            newMap.set(exhibitionId, participations);
            set({ exhibitionParticipations: newMap });
        } catch (error) {
            console.error('Failed to fetch exhibition participations:', error);
        } finally {
            set({ isLoadingExhibitionParticipations: false });
        }
    },
    
    clearStore: () => {
        set({
            schoolParticipations: [],
            exhibitionParticipations: new Map(),
            isLoadingSchoolParticipations: false,
            isLoadingExhibitionParticipations: false
        });
    }
}));
