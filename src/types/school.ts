export interface School {
    id: number;
    name: string;
    contactEmail: string;
    contactPhone: string | null;
    active: boolean;
    ownerId: number;
}
