import { create } from 'zustand';
import { venueService } from '@/services/venueService';
import type { Venue } from '@/types/venue';

interface VenueStore {
    venues: Venue[];
    isLoading: boolean;
    error: string | null;
    selectedVenueId: number | null;
    fetchVenuesByMunicipality: (municipalityId: number) => Promise<void>;
    setSelectedVenue: (id: number) => void;
    clearVenues: () => void;
}

export const useVenueStore = create<VenueStore>((set) => ({
    venues: [],
    isLoading: false,
    error: null,
    selectedVenueId: null,

    fetchVenuesByMunicipality: async (municipalityId: number) => {
        set({ isLoading: true, error: null });
        try {
            const venues = await venueService.getVenuesByMunicipality(municipalityId);
            set({ venues, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch venues:', error);
            set({
                error: error instanceof Error ? error.message : 'فشل في تحميل الأماكن',
                isLoading: false
            });
        }
    },

    setSelectedVenue: (id: number) => {
        set({ selectedVenueId: id });
    },

    clearVenues: () => {
        set({ venues: [], error: null, selectedVenueId: null });
    },
}));
