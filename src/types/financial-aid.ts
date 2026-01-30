export const FinancialAidStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DISBURSED: 'DISBURSED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
} as const;

export type FinancialAidStatus = typeof FinancialAidStatus[keyof typeof FinancialAidStatus];

export interface FinancialAidDocuments {
  idCard: string;
  fees: string;
  grades: string;
}

export interface FinancialAidResponse {
  id: number;
  studentId: number;
  organizationId: number;
  organizationName: string;
  studentName: string;
  studentPhone: string;
  requestedAmount: number;
  approvedAmount: number | null;
  status: FinancialAidStatus;
  gpa: number;
  fieldOfStudy: string;
  universityName: string;
  familyIncome: number;
  documents: FinancialAidDocuments;
  reason: string;
  rejectionReason: string | null;
  donorId: number | null;
  donorName: string | null;
  requestedAt: string;
  reviewedAt: string | null;
}

export interface FinancialAidApplyRequest {
  organizationId: number;
  studentName: string;
  studentPhone: string;
  requestedAmount: number;
  gpa: number;
  fieldOfStudy: string;
  universityName: string;
  familyIncome: number;
  idCard: File;
  universityFees: File;
  gradeProof: File;
  reason: string;
}

export interface FinancialAidReviewRequest {
  decision: 'APPROVE' | 'REJECT';
  approvedAmount?: number;
  rejectionReason?: string;
}

export interface DonorResponse {
  id: number;
  name: string;
  totalBudget: number;
  availableBudget: number;
  active: boolean;
  amountDistributed: number;
  activeRequests: number;
}
