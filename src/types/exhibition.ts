// Exhibition Types based on Java backend DTOs

export type ExhibitionStatus =
    | 'DRAFT'
    | 'VENUE_PENDING'
    | 'VENUE_APPROVED'
    | 'PLANNING'
    | 'CONFIRMED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'CANCELLED_BY_ORG'
    | 'CANCELLED_BY_MUNICIPALITY';

export interface ExhibitionRequest {
    title: string;
    description: string;
    theme: string;
    startDate: string; // LocalDate format: YYYY-MM-DD
    endDate: string;
    startTime: string; // LocalTime format: HH:mm:ss
    endTime: string;
    standardBoothSqm: number;
    expectedVisitors: number;
    scheduleJson?: string;
}

export interface ExhibitionResponse {
    id: number;
    organizationId: number;
    title: string;
    description: string;
    theme: string;
    status: ExhibitionStatus;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    standardBoothSqm: number;
    expectedVisitors: number;
    actualVisitors: number | null;
    scheduleJson: string | null;
    createdAt: string;
    updatedAt: string;
    finalizationDeadline?: string;
}

export interface InvitationCapacityResponse {
    maxUniversitiesToInvite: number;
    maxProvidersToInvite: number;
    remainingBooths: number;
}

export interface AvailableBoothsMap {
    [key: string]: number;
}

export interface ExhibitionFinancialResponse {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
}

// Utility type for status labels in Arabic
export const ExhibitionStatusLabels: Record<ExhibitionStatus, string> = {
    DRAFT: 'مسودة',
    VENUE_PENDING: 'بانتظار البلدية',
    VENUE_APPROVED: 'المكان موافق',
    PLANNING: 'التخطيط',
    CONFIRMED: 'مؤكد',
    ACTIVE: 'نشط',
    COMPLETED: 'مكتمل',
    CANCELLED_BY_ORG: 'ملغي من المنظمة',
    CANCELLED_BY_MUNICIPALITY: 'ملغي من البلدية'
};

// Utility function to get status badge class
export const getStatusBadgeClass = (status: ExhibitionStatus): string => {
    const statusClasses: Record<ExhibitionStatus, string> = {
        DRAFT: 'bg-muted text-muted-foreground',
        VENUE_PENDING: 'bg-secondary text-secondary-foreground',
        VENUE_APPROVED: 'bg-primary text-primary-foreground',
        PLANNING: 'bg-accent text-accent-foreground',
        CONFIRMED: 'bg-primary text-primary-foreground',
        ACTIVE: 'bg-primary text-primary-foreground',
        COMPLETED: 'bg-secondary text-secondary-foreground',
        CANCELLED_BY_ORG: 'bg-destructive text-destructive-foreground',
        CANCELLED_BY_MUNICIPALITY: 'bg-destructive text-destructive-foreground'
    };
    return statusClasses[status];
};

// Helper to determine if a step is locked based on status
export const isStepLocked = (currentStep: number, stepNumber: number, status: ExhibitionStatus): boolean => {
    // Step 4 (Exhibition & Evaluation) is only accessible when ACTIVE or COMPLETED
    if (stepNumber === 4) {
        return !['ACTIVE', 'COMPLETED'].includes(status);
    }

    // Other steps follow sequential logic
    return stepNumber > currentStep;
};

// Map status to current step
export const getStepFromStatus = (status: ExhibitionStatus): number => {
    const statusToStep: Record<ExhibitionStatus, number> = {
        DRAFT: 1,
        VENUE_PENDING: 1,
        VENUE_APPROVED: 2,
        PLANNING: 2,
        CONFIRMED: 3,
        ACTIVE: 4,
        COMPLETED: 4,
        CANCELLED_BY_ORG: 1,
        CANCELLED_BY_MUNICIPALITY: 1
    };
    return statusToStep[status] || 1;
};
