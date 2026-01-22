import { api } from '@/api/axios';
import type { Venue } from '@/types/venue';

class VenueService {
    // ----------------- Get Venues by Municipality ID -----------------
    async getVenuesByMunicipality(municipalityId: number): Promise<Venue[]> {
        const response = await api.get<Venue[]>(`/api/venues/municipality/${municipalityId}`);
        return response.data;
    }

    // ----------------- Get Venue by ID -----------------
    async getVenueById(venueId: number): Promise<Venue> {
        const response = await api.get<Venue>(`/api/venues/${venueId}`);
        return response.data;
    }
}

// Export singleton instance
export const venueService = new VenueService();
