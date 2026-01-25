// Activity Types based on Java backend DTOs

export type ActivityType =
    | 'GAME'
    | 'EXPERIMENT'
    | 'DEMO'
    | 'WORKSHOP';

export interface ActivityResponse {
    id: number;
    name: string;
    description: string;
    type: ActivityType;
    suggestedDurationMinutes: number;
    suggestedMaxParticipants: number;
    active: boolean;
    provider: {
        id: number;
        name: string;
        contactEmail: string;
        contactPhone: string;
        active: boolean;
        owner: {
            id: number;
            name: string;
            email: string;
            gender: string;
        };
    };
}

// Helper function to get activity type label in Arabic
export const getActivityTypeLabel = (type: ActivityType): string => {
    const labels: Record<ActivityType, string> = {
        GAME: 'لعبة',
        EXPERIMENT: 'تجربة',
        DEMO: 'عرض توضيحي',
        WORKSHOP: 'ورشة عمل'
    };
    return labels[type] || type;
};
