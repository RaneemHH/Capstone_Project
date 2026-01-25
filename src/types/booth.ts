export type BoothType = 'UNIVERSITY' | 'ACTIVITY_PROVIDER';

export interface BoothResponse {
    id: number;
    exhibitionId: number;
    type: BoothType;
    universityParticipationId?: number;
    activityProviderRequestId?: number;
    activityId?: number;
    zone: string;
    boothNumber: number;
    durationMinutes?: number;
    maxParticipants?: number;
    createdAt: string;
}

export interface BoothAllocationUpdateRequest {
    boothId: number;
    zone: string;
    boothNumber: number;
}

export interface BoothLimitsRequest {
    maxBoothsPerUniversity: number;
    maxBoothsPerProvider: number;
}

export interface InvitationCapacityResponse {
    maxBoothsPerUniversity: number;
    maxBoothsPerProvider: number;
    maxUniversitiesToInvite: number;
    maxProvidersToInvite: number;
    totalAvailableBooths: number;
    remainingBooths: number;
}
