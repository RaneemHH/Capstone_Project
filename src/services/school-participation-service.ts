import { api } from '@/api/axios';
import type {
    SchoolParticipationResponse,
    InviteSchoolRequest,
    SchoolRespondRequest,
    AcceptSchoolRequest
} from "@/types/school-participation";

/**
 * School Participation Service
 * Handles all school participation workflow operations
 */
export const schoolParticipationService = {
    /**
     * Step 1: Organization invites a school to participate in an exhibition
     * Status: INVITED
     * Role: ORG_OWNER
     */
    inviteSchool: async (
        exhibitionId: number,
        schoolId: number,
        request: InviteSchoolRequest
    ): Promise<SchoolParticipationResponse> => {
        const response = await api.post<SchoolParticipationResponse>(
            `/api/schools-participations/invite/${exhibitionId}/${schoolId}`,
            null,
            {
                params: {
                    responseDeadline: request.responseDeadline
                }
            }
        );
        return response.data;
    },

    /**
     * Step 2: School responds to invitation (accept/reject)
     * Status: REGISTERED (if accepted) or REJECTED
     * Role: SCHOOL_ADMIN
     */
    respondToInvitation: async (
        participationId: number,
        request: SchoolRespondRequest
    ): Promise<SchoolParticipationResponse> => {
        const response = await api.post<SchoolParticipationResponse>(
            `/api/schools-participations/respond/${participationId}`,
            null,
            {
                params: {
                    accept: request.accept,
                    rejectionReason: request.rejectionReason,
                    expectedStudents: request.expectedStudents
                }
            }
        );
        return response.data;
    },

    /**
     * Step 3: Organization reviews and accepts/rejects school registration
     * Status: ACCEPTED or REJECTED
     * Role: ORG_OWNER
     */
    acceptSchool: async (
        participationId: number,
        request: AcceptSchoolRequest
    ): Promise<SchoolParticipationResponse> => {
        const response = await api.post<SchoolParticipationResponse>(
            `/api/schools-participations/accept/${participationId}`,
            null,
            {
                params: {
                    approved: request.approved,
                    confirmationDeadline: request.confirmationDeadline
                }
            }
        );
        return response.data;
    },

    /**
     * Step 4: School confirms commitment to participate
     * Status: CONFIRMED
     * Role: SCHOOL_ADMIN
     */
    confirmSchool: async (
        participationId: number
    ): Promise<SchoolParticipationResponse> => {
        const response = await api.post<SchoolParticipationResponse>(
            `/api/schools-participations/confirm/${participationId}`
        );
        return response.data;
    },

    /**
     * Step 5: Finalize school participation
     * Status: FINALIZED
     * Role: SCHOOL_ADMIN
     */
    finalizeParticipation: async (
        participationId: number
    ): Promise<SchoolParticipationResponse> => {
        const response = await api.post<SchoolParticipationResponse>(
            `/api/schools-participations/finalize/${participationId}`
        );
        return response.data;
    },

    /**
     * Cancel school participation
     * Status: CANCELLED
     * Role: SCHOOL_ADMIN or ORG_OWNER
     */
    cancelParticipation: async (
        participationId: number
    ): Promise<SchoolParticipationResponse> => {
        const response = await api.post<SchoolParticipationResponse>(
            `/api/schools-participations/${participationId}/cancel`
        );
        return response.data;
    },

    // ----------------- DATA RETRIEVAL -----------------

    /**
     * Get participation by ID
     * Role: ORG_OWNER or SCHOOL_ADMIN
     */
    getParticipationById: async (
        participationId: number
    ): Promise<SchoolParticipationResponse> => {
        const response = await api.get<SchoolParticipationResponse>(
            `/api/schools-participations/${participationId}`
        );
        return response.data;
    },

    /**
     * Get all participations for an exhibition
     * Role: ORG_OWNER
     */
    getParticipationsByExhibition: async (
        exhibitionId: number
    ): Promise<SchoolParticipationResponse[]> => {
        const response = await api.get<SchoolParticipationResponse[]>(
            `/api/schools-participations/exhibition/${exhibitionId}`
        );
        return response.data;
    },

    /**
     * Get all participations for a school
     * Role: SCHOOL_ADMIN
     */
    getParticipationsBySchoolId: async (
        schoolId: number
    ): Promise<SchoolParticipationResponse[]> => {
        const response = await api.get<SchoolParticipationResponse[]>(
            `/api/schools-participations/school/${schoolId}/participations`
        );
        return response.data;
    }
};
