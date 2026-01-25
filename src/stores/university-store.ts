import { create } from 'zustand';
import type { UniversityResponse, UniversityParticipationResponse } from '@/types/university';
import { universityParticipationService } from '@/services/university-participation-service';

interface UniversityStore {
    universities: UniversityResponse[];
    ownerUniversities: UniversityResponse[]; // Universities owned by current user
    participations: Map<number, UniversityParticipationResponse>; // universityId -> participation
    universityParticipations: Map<number, UniversityParticipationResponse[]>; // universityId -> its participations
    isLoading: boolean;
    isLoadingParticipations: boolean;
    isLoadingOwnerUniversities: boolean;
    error: string | null;
    
    // Actions
    fetchAllUniversities: () => Promise<void>;
    fetchParticipationsByExhibition: (exhibitionId: number) => Promise<void>;
    fetchUniversitiesByOwnerId: (ownerId: number) => Promise<void>;
    fetchParticipationsByUniversityId: (universityId: number) => Promise<void>;
    getParticipationByUniversityId: (universityId: number) => UniversityParticipationResponse | undefined;
    clearError: () => void;
}

export const useUniversityStore = create<UniversityStore>((set, get) => ({
    universities: [],
    ownerUniversities: [],
    participations: new Map(),
    universityParticipations: new Map(),
    isLoading: false,
    isLoadingParticipations: false,
    isLoadingOwnerUniversities: false,
    error: null,

    fetchAllUniversities: async () => {
        set({ isLoading: true, error: null });
        try {
            const universities = await universityParticipationService.getAllActiveUniversities();
            set({ universities, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch universities:', error);
            set({ 
                error: 'فشل في تحميل الجامعات', 
                isLoading: false,
                universities: []
            });
        }
    },

    fetchParticipationsByExhibition: async (exhibitionId: number) => {
        set({ isLoadingParticipations: true, error: null });
        try {
            const participations = await universityParticipationService.getParticipationsByExhibition(exhibitionId);
            const participationsMap = new Map<number, UniversityParticipationResponse>();
            
            participations.forEach(participation => {
                participationsMap.set(participation.universityId, participation);
            });
            
            set({ participations: participationsMap, isLoadingParticipations: false });
        } catch (error) {
            console.error('Failed to fetch participations:', error);
            set({ 
                error: 'فشل في تحميل بيانات المشاركات', 
                isLoadingParticipations: false
            });
        }
    },

    fetchUniversitiesByOwnerId: async (ownerId: number) => {
        set({ isLoadingOwnerUniversities: true, error: null });
        try {
            const ownerUniversities = await universityParticipationService.getUniversitiesByOwnerId(ownerId);
            set({ ownerUniversities, isLoadingOwnerUniversities: false });
        } catch (error) {
            console.error('Failed to fetch owner universities:', error);
            set({ 
                error: 'فشل في تحميل جامعاتك', 
                isLoadingOwnerUniversities: false,
                ownerUniversities: []
            });
        }
    },

    fetchParticipationsByUniversityId: async (universityId: number) => {
        try {
            const participations = await universityParticipationService.getParticipationsByUniversityId(universityId);
            const currentMap = new Map(get().universityParticipations);
            currentMap.set(universityId, participations);
            set({ universityParticipations: currentMap });
        } catch (error) {
            console.error(`Failed to fetch participations for university ${universityId}:`, error);
        }
    },

    getParticipationByUniversityId: (universityId: number) => {
        return get().participations.get(universityId);
    },

    clearError: () => set({ error: null }),
}));
