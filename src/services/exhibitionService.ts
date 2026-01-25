import { api } from '@/api/axios';
import type {
    ExhibitionRequest,
    ExhibitionResponse,
    ExhibitionStatus,
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


    // ----------------- Cancel Exhibition -----------------
    async cancelExhibition(exhibitionId: number, reason: string): Promise<ExhibitionResponse> {
        const response = await api.post<ExhibitionResponse>(
            `/api/exhibitions/${exhibitionId}/cancel?reason=${encodeURIComponent(reason)}`
        );
        return response.data;
    }

    // ----------------- Confirm Exhibition -----------------
    async confirmExhibition(exhibitionId: number, finalizationDeadline: string): Promise<ExhibitionResponse> {
        // Ensure the finalizationDeadline is in ISO DateTime format (add seconds if missing)
        const formattedDeadline = finalizationDeadline.includes(':00') 
            ? finalizationDeadline 
            : `${finalizationDeadline}:00`;
        
        const response = await api.post<ExhibitionResponse>(
            `/api/exhibitions/confirm/${exhibitionId}`,
            null,
            { 
                params: { 
                    finalizationDeadline: formattedDeadline 
                } 
            }
        );
        return response.data;
    }

    // ----------------- Start Exhibition -----------------
    async startExhibition(exhibitionId: number): Promise<ExhibitionResponse> {
        const response = await api.post<ExhibitionResponse>(
            `/api/exhibitions/start/${exhibitionId}`
        );
        return response.data;
    }

    // ----------------- Complete Exhibition -----------------
    async completeExhibition(exhibitionId: number): Promise<ExhibitionResponse> {
        const response = await api.post<ExhibitionResponse>(
            `/api/exhibitions/complete/${exhibitionId}`
        );
        return response.data;
    }
}

// Export singleton instance
export const exhibitionService = new ExhibitionService();
