// Venue Types based on Java backend model

export interface Venue {
    id: number;
    municipalityId: number;
    name: string;
    address: string;
    maxCapacity: number;
    spaceSqm: number;
    rentalFeePerDay: number; // BigDecimal in Java -> number in TypeScript
    active: boolean;
    available: boolean; // true if venue is not currently reserved
}
// export interface VenueRequestResponse {

//     status: VenueRequestStatus;
//     orgNotes: string | null;
//     municipalityResponse: string | null;
//     responseDeadline: string; // LocalDateTime format: YYYY-MM-DDTHH:mm:ss
//     requestedAt: string;
// } 

// Utility function to format rental fee
export const formatRentalFee = (fee: number): string => {
    return new Intl.NumberFormat('ar-LB', {
        style: 'currency',
        currency: 'LBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(fee);
};

// Utility function to format space
export const formatSpace = (spaceSqm: number): string => {
    return `${spaceSqm.toLocaleString('ar')} م²`;
};

// Utility function to get availability badge class
export const getAvailabilityBadgeClass = (available: boolean): string => {
    return available
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground';
};

// Utility function to get availability label in Arabic
export const getAvailabilityLabel = (available: boolean): string => {
    return available ? 'متاح' : 'محجوز';
};
