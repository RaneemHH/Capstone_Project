import { api } from '@/api/axios';
import type {
    VenueRequestResponse,
    MunicipalityResponse
} from '@/types/municipality';

class MunicipalityService {
    // ----------------- Review Venue Request -----------------
    async reviewVenueRequest(
        venueRequestId: number,
        approve: boolean,
        responseText: string
    ): Promise<VenueRequestResponse> {
        const response = await api.post<VenueRequestResponse>(
            `/api/municipality/review/${venueRequestId}`,
            null,
            {
                params: {
                    approve,
                    responseText
                }
            }
        );
        return response.data;
    }

    // ----------------- Get All Municipalities -----------------
    async getAllMunicipalities(): Promise<MunicipalityResponse[]> {
        const response = await api.get<MunicipalityResponse[]>('/api/municipality');
        return response.data;
    }
}

// Export singleton instance
export const municipalityService = new MunicipalityService();
