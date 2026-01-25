// Venue Request Types based on Java backend DTOs

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

export interface CreateVenueRequestParams {
    exhibitionId: number;
    venueId: number;
    orgNotes: string;
    responseDeadline: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
}

export interface ReviewVenueRequestParams {
    venueRequestId: number;
    approve: boolean;
    responseText: string;
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
        PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return statusClasses[status];
};

// Utility function to get status icon
export const getVenueRequestStatusIcon = (status: VenueRequestStatus): string => {
    const icons: Record<VenueRequestStatus, string> = {
        PENDING: '⏳',
        APPROVED: '✅',
        REJECTED: '❌'
    };
    return icons[status];
};
