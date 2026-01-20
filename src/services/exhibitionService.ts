import { api } from '@/api/axios';
import type {
    ExhibitionRequest,
    ExhibitionResponse,
    ExhibitionStatus,
    BoothLimitsRequest,
    InvitationCapacityResponse,
    AvailableBoothsMap
} from '@/types/exhibition';

class ExhibitionService {
    // ----------------- Create Exhibition -----------------
    async createExhibition(orgId: number, data: ExhibitionRequest): Promise<ExhibitionResponse> {
        const response = await api.post<ExhibitionResponse>(
            `/api/exhibitions?orgId=${orgId}`,
            data
        );
        return response.data;
    }

    // ----------------- Get Exhibitions by Organization -----------------
    async getExhibitionsByOrg(orgId: number): Promise<ExhibitionResponse[]> {
        const response = await api.get<ExhibitionResponse[]>(
            `/api/exhibitions/organization/${orgId}`
        );
        return response.data;
    }

    // ----------------- Get All Exhibitions -----------------
    async getAllExhibitions(): Promise<ExhibitionResponse[]> {
        const response = await api.get<ExhibitionResponse[]>('/api/exhibitions');
        return response.data;
    }

    // ----------------- Get Exhibition By ID -----------------
    async getExhibitionById(exhibitionId: number): Promise<ExhibitionResponse> {
        const response = await api.get<ExhibitionResponse>(
            `/api/exhibitions/${exhibitionId}`
        );
        return response.data;
    }

    // ----------------- Get All Active Exhibitions -----------------
    async getActiveExhibitions(): Promise<ExhibitionResponse[]> {
        const response = await api.get<ExhibitionResponse[]>('/api/exhibitions/active');
        return response.data;
    }

    // ----------------- Get Exhibition Status -----------------
    async getExhibitionStatus(exhibitionId: number): Promise<ExhibitionStatus> {
        const response = await api.get<ExhibitionStatus>(
            `/api/exhibitions/${exhibitionId}/status`
        );
        return response.data;
    }

    // ----------------- Get Available Booths -----------------
    async getAvailableBooths(exhibitionId: number): Promise<AvailableBoothsMap> {
        const response = await api.get<AvailableBoothsMap>(
            `/api/exhibitions/${exhibitionId}/available-booths`
        );
        return response.data;
    }

    // ----------------- Set Booth Limits -----------------
    async setBoothLimits(
        exhibitionId: number,
        request: BoothLimitsRequest
    ): Promise<InvitationCapacityResponse> {
        const response = await api.post<InvitationCapacityResponse>(
            `/api/exhibitions/${exhibitionId}/booth-limits`,
            request
        );
        return response.data;
    }

    // ----------------- Cancel Exhibition -----------------
    async cancelExhibition(exhibitionId: number, reason: string): Promise<ExhibitionResponse> {
        const response = await api.post<ExhibitionResponse>(
            `/api/exhibitions/${exhibitionId}/cancel?reason=${encodeURIComponent(reason)}`
        );
        return response.data;
    }
}

// Export singleton instance
export const exhibitionService = new ExhibitionService();
