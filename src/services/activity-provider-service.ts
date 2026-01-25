import { api } from '@/api/axios';
import type {
    ActivityProviderResponse,
    ActivityProviderRequestResponse,
    InviteProviderRequest,
    SubmitProposalRequest,
    ReviewProposalRequest
} from '@/types/activity-provider';

const BASE_URL = "/api/activity-providers";

export const activityProviderService = {
    // Invite a provider to participate in an exhibition
    inviteProvider: async (
        exhibitionId: number,
        providerId: number,
        request: InviteProviderRequest
    ): Promise<ActivityProviderRequestResponse> => {
        const params = new URLSearchParams();
        params.append('responseDeadline', request.responseDeadline);
        
        const response = await api.post<ActivityProviderRequestResponse>(
            `${BASE_URL}/invite/${exhibitionId}/${providerId}?${params.toString()}`,
            request.orgRequirements,
            {
                headers: {
                    'Content-Type': 'text/plain'
                }
            }
        );
        return response.data;
    },

    // Provider submits proposal for an exhibition
    submitProposal: async (
        requestId: number,
        request: SubmitProposalRequest
    ): Promise<ActivityProviderRequestResponse> => {
        const response = await api.post<ActivityProviderRequestResponse>(
            `${BASE_URL}/submit-proposal/${requestId}`,
            request
        );
        return response.data;
    },

    // Org owner reviews (approves/rejects) provider proposal
    reviewProposal: async (
        requestId: number,
        request: ReviewProposalRequest
    ): Promise<ActivityProviderRequestResponse> => {
        const params = new URLSearchParams();
        params.append('approve', request.approve.toString());
        if (request.confirmationDeadline) {
            params.append('confirmationDeadline', request.confirmationDeadline);
        }
        if (request.comments) {
            params.append('comments', request.comments);
        }
        
        const response = await api.post<ActivityProviderRequestResponse>(
            `${BASE_URL}/review/${requestId}?${params.toString()}`
        );
        return response.data;
    },

    // Provider confirms their participation
    confirmParticipation: async (
        requestId: number
    ): Promise<ActivityProviderRequestResponse> => {
        const response = await api.post<ActivityProviderRequestResponse>(
            `${BASE_URL}/confirm/${requestId}`
        );
        return response.data;
    },

    // Provider finalizes their participation
    finalizeParticipation: async (
        requestId: number
    ): Promise<ActivityProviderRequestResponse> => {
        const response = await api.post<ActivityProviderRequestResponse>(
            `${BASE_URL}/finalize/${requestId}`
        );
        return response.data;
    },

    // Cancel request
    cancelRequest: async (
        requestId: number,
        reason: string
    ): Promise<ActivityProviderRequestResponse> => {
        const params = new URLSearchParams();
        params.append('reason', reason);
        
        const response = await api.post<ActivityProviderRequestResponse>(
            `${BASE_URL}/${requestId}/cancel?${params.toString()}`
        );
        return response.data;
    },

    // Get request by ID
    getRequestById: async (
        requestId: number
    ): Promise<ActivityProviderRequestResponse> => {
        const response = await api.get<ActivityProviderRequestResponse>(
            `${BASE_URL}/${requestId}`
        );
        return response.data;
    },

    // Get all requests for an exhibition
    getRequestsByExhibition: async (
        exhibitionId: number
    ): Promise<ActivityProviderRequestResponse[]> => {
        const response = await api.get<ActivityProviderRequestResponse[]>(
            `${BASE_URL}/exhibition/${exhibitionId}`
        );
        return response.data;
    },

    // Get all requests by provider ID
    getRequestsByProviderId: async (
        providerId: number
    ): Promise<ActivityProviderRequestResponse[]> => {
        const response = await api.get<ActivityProviderRequestResponse[]>(
            `${BASE_URL}/provider/${providerId}/requests`
        );
        return response.data;
    },

    // Get all active providers (from bank)
    getAllActiveProviders: async (): Promise<ActivityProviderResponse[]> => {
        const response = await api.get<ActivityProviderResponse[]>(
            `${BASE_URL}/all-providers`
        );
        return response.data;
    },

    // Get provider by ID (from bank)
    getProviderById: async (
        providerId: number
    ): Promise<ActivityProviderResponse> => {
        const response = await api.get<ActivityProviderResponse>(
            `${BASE_URL}/provider/${providerId}`
        );
        return response.data;
    },

    // Get providers by owner ID
    getProvidersByOwnerId: async (
        ownerId: number
    ): Promise<ActivityProviderResponse[]> => {
        const response = await api.get<ActivityProviderResponse[]>(
            `${BASE_URL}/owner/${ownerId}`
        );
        return response.data;
    }
};

export default activityProviderService;
