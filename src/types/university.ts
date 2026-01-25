// University Participation Types based on backend DTOs

export type ParticipationStatus =
    | 'INVITED'
    | 'REGISTERED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'FINALIZED';

export interface UniversityParticipationResponse {
    id: number;
    exhibitionId: number;
    universityId: number;
    universityName: string;
    contactEmail: string;
    status: ParticipationStatus;
    approvedBoothsCount: number | null;
    boothDetails: string | null;
    participationFee: number;
    paymentStatus: string;
    paymentDate: string | null;
    responseDeadline: string | null;
    confirmationDeadline: string | null;
    invitedAt: string | null;
    registeredAt: string | null;
    confirmedAt: string | null;
    attendedAt: string | null;
}

export interface UniversityResponse {
    id: number;
    name: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    ownerId: number;
    ownerName?: string; // Populated from user store
}

// Request types for API calls
export interface InviteUniversityRequest {
    participationFee: number;
    responseDeadline?: string;
}

export interface RegisterUniversityRequest {
    requestedBooths: number;
    boothDetails: Record<number, {
        content: string;
    }>;
}

export interface ReviewUniversityRequest {
    approve: boolean;
    confirmationDeadline?: string;
}
