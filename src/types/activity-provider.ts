// Activity Provider Types based on Java backend DTOs

export type ActivityProviderRequestStatus =
    | 'INVITED'
    | 'PROPOSED'
    | 'APPROVED'
    | 'REJECTED'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'FINALIZED';

export interface ActivityProviderResponse {
    id: number;
    name: string;
    contactEmail: string;
    contactPhone: string;
    active: boolean;
    ownerId: number;
}

export interface ActivityProviderRequestResponse {
    id: number;
    exhibitionId: number;
    providerId: number;
    name: string;
    email: string;
    status: ActivityProviderRequestStatus;
    orgRequirements: string | null;
    providerProposal: string | null;
    proposedBoothsCount: number | null;
    totalCost: number | null;
    responseDeadline: string | null;
    orgResponse: string | null;
    invitedAt: string | null;
    proposedAt: string | null;
    reviewedAt: string | null;
    approvedAt: string | null;
    attendedAt: string | null;
}

export interface InviteProviderRequest {
    orgRequirements: string;
    responseDeadline: string;
}

export interface SubmitProposalRequest {
    proposalText: string;
    boothsCount: number;
    totalCost: number;
    activityIds?: number[];
}

export interface ReviewProposalRequest {
    approve: boolean;
    confirmationDeadline?: string;
    comments?: string;
}
