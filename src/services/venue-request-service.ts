import { api } from '@/api/axios';
import type { VenueRequestResponse } from '@/types/municipality';

interface CreateVenueRequestParams {
    exhibitionId: number;
    venueId: number;
    orgNotes: string;
    responseDeadline: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
}

class VenueRequestService {
    // ----------------- Create Venue Request -----------------
    async createVenueRequest(params: CreateVenueRequestParams): Promise<VenueRequestResponse> {
        const { exhibitionId, venueId, orgNotes, responseDeadline } = params;

        const response = await api.post<VenueRequestResponse>(
            `/api/venue-requests/create/${exhibitionId}/${venueId}`,
            { orgNotes },
            {
                params: {
                    responseDeadline
                }
            }
        );
        return response.data;
    }

    // ----------------- Get All Requests for Exhibition -----------------
    async getRequestsForVenue(exhibitionId: number): Promise<VenueRequestResponse[]> {
        const response = await api.get<VenueRequestResponse[]>(
            `/api/venue-requests/exhibition/${exhibitionId}`
        );
        return response.data;
    }
}

// Export singleton instance
export const venueRequestService = new VenueRequestService();
