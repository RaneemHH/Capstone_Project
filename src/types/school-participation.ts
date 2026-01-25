export type SchoolParticipationStatus = 
    | 'INVITED' 
    | 'REGISTERED' 
    | 'ACCEPTED' 
    | 'REJECTED' 
    | 'CONFIRMED' 
    | 'CANCELLED'
    | 'FINALIZED';

export interface SchoolParticipationResponse {
    id: number;
    exhibitionId: number;
    schoolId: number;
    schoolName: string;
    contactEmail: string;
    status: SchoolParticipationStatus;
    expectedStudents: number | null;
    responseDeadline: string | null;
    invitedAt: string | null;
    acceptedAt: string | null;
    rejectionReason: string | null;
    confirmedAt: string | null;
    attendedAt: string | null;
}

export interface InviteSchoolRequest {
    responseDeadline: string;
}

export interface SchoolRespondRequest {
    accept: boolean;
    rejectionReason?: string;
    expectedStudents?: number;
}

export interface AcceptSchoolRequest {
    approved: boolean;
    confirmationDeadline?: string;
}
