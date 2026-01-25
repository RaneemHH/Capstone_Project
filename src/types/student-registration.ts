export type StudentRegistrationStatus = 
    | 'PENDING' 
    | 'REGISTERED' 
    | 'ATTENDED' 
    | 'NO_SHOW' 
    | 'CANCELLED';

export interface StudentRegistrationResponse {
    id: number;
    exhibitionId: number;
    exhibitionTitle: string;
    studentId: number;
    studentName: string;
    studentEmail: string;
    status: StudentRegistrationStatus;
    approved: boolean;
    registeredAt: string | null;
    approvedAt: string | null;
    attendedAt: string | null;
}
