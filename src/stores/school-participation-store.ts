import { create } from 'zustand';
import type { SchoolParticipationResponse } from '@/types/school-participation';
import { schoolParticipationService } from '@/services/school-participation-service';
import { exhibitionService } from '@/services/exhibitionService';
import { schoolService } from '@/services/school-service';
import { getMergedSchoolParticipations } from '@/mockDataForCharts/mockExhibitionDetails';

interface SchoolParticipationStore {
    // School's participations
    schoolParticipations: SchoolParticipationResponse[];
    isLoadingSchoolParticipations: boolean;
    
    // Exhibition participations (for org admin)
    exhibitionParticipations: Map<number, SchoolParticipationResponse[]>;
    isLoadingExhibitionParticipations: boolean;
    
    // Actions
    fetchParticipationsBySchoolId: (schoolId: number) => Promise<void>;
    fetchParticipationsBySchoolIds: (schoolIds: number[]) => Promise<void>;
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
    
    fetchParticipationsBySchoolIds: async (schoolIds: number[]) => {
        set({ isLoadingSchoolParticipations: true });
        try {
            const allParticipations: SchoolParticipationResponse[] = [];
            
            // Fetch participations for all schools and merge them
            await Promise.all(
                schoolIds.map(async (schoolId) => {
                    try {
                        const participations = await schoolParticipationService.getParticipationsBySchoolId(schoolId);
                        allParticipations.push(...participations);
                    } catch (error) {
                        console.error(`Failed to fetch participations for school ${schoolId}:`, error);
                    }
                })
            );
            
            // Enrich participations with exhibition and school details
            const enrichedParticipations = await Promise.all(
                allParticipations.map(async (participation) => {
                    try {
                        // Fetch exhibition details
                        const exhibition = await exhibitionService.getExhibitionById(participation.exhibitionId);
                        
                        // Fetch school details
                        const school = await schoolService.getSchoolById(participation.schoolId);
                        
                        return {
                            ...participation,
                            exhibitionTitle: exhibition.title,
                            exhibitionStartDate: exhibition.startDate,
                            school: {
                                id: school.id,
                                name: school.name,
                                contactEmail: school.contactEmail,
                                contactPhone: school.contactPhone
                            }
                        };
                    } catch (error) {
                        console.error(`Failed to enrich participation ${participation.id}:`, error);
                        return participation;
                    }
                })
            );
            
            set({ schoolParticipations: enrichedParticipations });
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
            const mergedParticipations = getMergedSchoolParticipations(participations, exhibitionId);
            
            // Enrich participations with exhibition and school details
            const enrichedParticipations = await Promise.all(
                mergedParticipations.map(async (participation) => {
                    try {
                        // Fetch exhibition details
                        const exhibition = await exhibitionService.getExhibitionById(participation.exhibitionId);
                        
                        // Fetch school details
                        const school = await schoolService.getSchoolById(participation.schoolId);
                        
                        return {
                            ...participation,
                            exhibitionTitle: exhibition.title,
                            exhibitionStartDate: exhibition.startDate,
                            school: {
                                id: school.id,
                                name: school.name,
                                contactEmail: school.contactEmail,
                                contactPhone: school.contactPhone
                            }
                        };
                    } catch (error) {
                        console.error(`Failed to enrich participation ${participation.id}:`, error);
                        return participation;
                    }
                })
            );
            
            const newMap = new Map(get().exhibitionParticipations);
            newMap.set(exhibitionId, enrichedParticipations);
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
