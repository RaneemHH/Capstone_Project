import { api } from '@/api/axios';
import type { 
    BoothResponse, 
    BoothAllocationUpdateRequest,
    BoothLimitsRequest,
    InvitationCapacityResponse 
} from '@/types/booth';

export const boothService = {
    /**
     * Get all booths for an exhibition
     * Role: ORG_OWNER, DEVELOPER
     */
    getBoothsByExhibition: async (exhibitionId: number): Promise<BoothResponse[]> => {
        const response = await api.get<BoothResponse[]>(
            `/api/exhibitions/${exhibitionId}/booths`
        );
        return response.data;
    },

    /**
     * Get booth by ID
     * Role: ORG_OWNER, DEVELOPER, UNIVERSITY_ADMIN, ACTIVITY_PROVIDER
     */
    getBoothById: async (boothId: number): Promise<BoothResponse> => {
        const response = await api.get<BoothResponse>(
            `/api/exhibitions/booths/${boothId}`
        );
        return response.data;
    },

    /**
     * Update booth allocation (zone and booth number)
     * Role: ORG_OWNER, DEVELOPER
     */
    updateBoothAllocation: async (
        exhibitionId: number,
        request: BoothAllocationUpdateRequest
    ): Promise<void> => {
        await api.post(
            `/api/exhibitions/${exhibitionId}/booth-allocation`,
            request
        );
    },

    /**
     * Set booth limits per university and activity provider
     * Role: ORG_OWNER, DEVELOPER
     */
    setBoothLimits: async (
        exhibitionId: number,
        request: BoothLimitsRequest
    ): Promise<InvitationCapacityResponse> => {
        const response = await api.post<InvitationCapacityResponse>(
            `/api/exhibitions/${exhibitionId}/booth-limits`,
            request
        );
        return response.data;
    }
};
