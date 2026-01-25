import { api } from '@/api/axios';
import type { 
    UniversityParticipationResponse, 
    UniversityResponse,
    InviteUniversityRequest,
    RegisterUniversityRequest,
    ReviewUniversityRequest
} from '@/types/university';

const BASE_URL = "/api/universities-participations";

export const universityParticipationService = {
    // Invite a university to participate in an exhibition
    inviteUniversity: async (
        exhibitionId: number,
        universityId: number,
        request: InviteUniversityRequest
    ): Promise<UniversityParticipationResponse> => {
        const params = new URLSearchParams();
        params.append('participationFee', request.participationFee.toString());
        if (request.responseDeadline) {
            params.append('responseDeadline', request.responseDeadline);
        }
        
        const response = await api.post<UniversityParticipationResponse>(
            `${BASE_URL}/invite/${exhibitionId}/${universityId}?${params.toString()}`
        );
        return response.data;
    },

    // University registers for an exhibition
    registerUniversity: async (
        participationId: number,
        request: RegisterUniversityRequest
    ): Promise<UniversityParticipationResponse> => {
        const response = await api.post<UniversityParticipationResponse>(
            `${BASE_URL}/register/${participationId}?requestedBooths=${request.requestedBooths}`,
            request.boothDetails
        );
        return response.data;
    },

    // Org owner reviews (approves/rejects) university participation
    reviewUniversity: async (
        participationId: number,
        request: ReviewUniversityRequest
    ): Promise<UniversityParticipationResponse> => {
        const params = new URLSearchParams();
        params.append('approve', request.approve.toString());
        if (request.confirmationDeadline) {
            params.append('confirmationDeadline', request.confirmationDeadline);
        }
        
        const response = await api.post<UniversityParticipationResponse>(
            `${BASE_URL}/review/${participationId}?${params.toString()}`
        );
        return response.data;
    },

    // University finalizes their participation
    finalizeParticipation: async (
        participationId: number
    ): Promise<UniversityParticipationResponse> => {
        const response = await api.post<UniversityParticipationResponse>(
            `${BASE_URL}/finalize/${participationId}`
        );
        return response.data;
    },

    // Org owner confirms payment received
    confirmPayment: async (
        participationId: number
    ): Promise<UniversityParticipationResponse> => {
        const response = await api.post<UniversityParticipationResponse>(
            `${BASE_URL}/confirm-payment/${participationId}`
        );
        return response.data;
    },

    // Cancel participation
    cancelParticipation: async (
        participationId: number
    ): Promise<UniversityParticipationResponse> => {
        const response = await api.post<UniversityParticipationResponse>(
            `${BASE_URL}/${participationId}/cancel`
        );
        return response.data;
    },

    // Get participation by ID
    getParticipationById: async (
        participationId: number
    ): Promise<UniversityParticipationResponse> => {
        const response = await api.get<UniversityParticipationResponse>(
            `${BASE_URL}/${participationId}`
        );
        return response.data;
    },

    // Get all participations for an exhibition
    getParticipationsByExhibition: async (
        exhibitionId: number
    ): Promise<UniversityParticipationResponse[]> => {
        const response = await api.get<UniversityParticipationResponse[]>(
            `${BASE_URL}/exhibition/${exhibitionId}`
        );
        return response.data;
    },

    // Get all participations by university ID
    getParticipationsByUniversityId: async (
        universityId: number
    ): Promise<UniversityParticipationResponse[]> => {
        const response = await api.get<UniversityParticipationResponse[]>(
            `${BASE_URL}/${universityId}/participations`
        );
        return response.data;
    },

    // Get universities by owner ID
    getUniversitiesByOwnerId: async (
        ownerId: number
    ): Promise<UniversityResponse[]> => {
        const response = await api.get<UniversityResponse[]>(
            `${BASE_URL}/owner/${ownerId}`
        );
        return response.data;
    },

    // Get all active universities (from bank)
    getAllActiveUniversities: async (): Promise<UniversityResponse[]> => {
        const response = await api.get<UniversityResponse[]>(
            `${BASE_URL}/all-universities`
        );
        return response.data;
    },

    // Get university by ID (from bank)
    getUniversityById: async (
        universityId: number
    ): Promise<UniversityResponse> => {
        const response = await api.get<UniversityResponse>(
            `${BASE_URL}/${universityId}`
        );
        return response.data;
    }
};

export default universityParticipationService;
