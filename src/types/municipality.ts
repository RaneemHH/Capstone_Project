// Municipality Types based on Java backend DTOs

export type VenueRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VenueRequestResponse {
    id: number;
    exhibitionId: number;
    venueId: number;
    venueName: string;
    venueAddress: string;
    status: VenueRequestStatus;
    orgNotes: string | null;
    municipalityResponse: string | null;
    responseDeadline: string; // LocalDateTime format: YYYY-MM-DDTHH:mm:ss
    requestedAt: string;
    reviewedAt: string | null;
}

export interface MunicipalityResponse {
    id: number;
    name: string;
    region: string;
    contactEmail: string;
    contactPhone: string;
    ownerId: number;
}

// Utility labels for VenueRequestStatus in Arabic
export const VenueRequestStatusLabels: Record<VenueRequestStatus, string> = {
    PENDING: 'بانتظار المراجعة',
    APPROVED: 'موافق عليه',
    REJECTED: 'مرفوض'
};

// Utility function to get status badge class
export const getVenueRequestStatusBadgeClass = (status: VenueRequestStatus): string => {
    const statusClasses: Record<VenueRequestStatus, string> = {
        PENDING: 'bg-secondary text-secondary-foreground',
        APPROVED: 'bg-primary text-primary-foreground',
        REJECTED: 'bg-destructive text-destructive-foreground'
    };
    return statusClasses[status];
};
