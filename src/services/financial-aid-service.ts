import {api} from '@/api/axios';
import type {
  FinancialAidResponse,
  FinancialAidApplyRequest,
  FinancialAidReviewRequest,
  DonorResponse,
} from '@/types/financial-aid';
import { FinancialAidStatus } from '@/types/financial-aid';
import { uploadFileToFirebase, useFirebase, isFirebaseUrl } from '@/lib/firebase';

const FINANCIAL_AID_BASE_URL = '/api/financial-aid';

export const financialAidService = {
  // Student endpoints
  async requestFinancialAid(request: FinancialAidApplyRequest): Promise<FinancialAidResponse> {
    let idCardUrl: string;
    let universityFeesUrl: string;
    let gradeProofUrl: string;

    // If using Firebase (production), upload files and get URLs
    if (useFirebase) {
      const timestamp = Date.now();
      idCardUrl = await uploadFileToFirebase(
        request.idCard,
        `financial-aid/${timestamp}_idCard_${request.idCard.name}`
      );
      universityFeesUrl = await uploadFileToFirebase(
        request.universityFees,
        `financial-aid/${timestamp}_universityFees_${request.universityFees.name}`
      );
      gradeProofUrl = await uploadFileToFirebase(
        request.gradeProof,
        `financial-aid/${timestamp}_gradeProof_${request.gradeProof.name}`
      );

      // Send URLs to backend
      const response = await api.post(`${FINANCIAL_AID_BASE_URL}/request`, {
        organizationId: request.organizationId,
        studentName: request.studentName,
        studentPhone: request.studentPhone,
        requestedAmount: request.requestedAmount,
        gpa: request.gpa,
        fieldOfStudy: request.fieldOfStudy,
        universityName: request.universityName,
        familyIncome: request.familyIncome,
        reason: request.reason,
        idCardUrl,
        universityFeesUrl,
        gradeProofUrl,
      });
      return response.data;
    } else {
      // Development: Send files via FormData
      const formData = new FormData();
      formData.append('organizationId', request.organizationId.toString());
      formData.append('studentName', request.studentName);
      formData.append('studentPhone', request.studentPhone);
      formData.append('requestedAmount', request.requestedAmount.toString());
      formData.append('gpa', request.gpa.toString());
      formData.append('fieldOfStudy', request.fieldOfStudy);
      formData.append('universityName', request.universityName);
      formData.append('familyIncome', request.familyIncome.toString());
      formData.append('reason', request.reason);
      formData.append('idCard', request.idCard);
      formData.append('universityFees', request.universityFees);
      formData.append('gradeProof', request.gradeProof);

      const response = await api.post(`${FINANCIAL_AID_BASE_URL}/request`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
  },

  // Download file from backend API (development only)
  async downloadFile(fileName: string): Promise<Blob> {
    const response = await api.get(`${FINANCIAL_AID_BASE_URL}/files/${fileName}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Open/view a document (handles both Firebase URLs and local files)
  async openDocument(documentPath: string): Promise<void> {
    if (isFirebaseUrl(documentPath)) {
      // Production: Open Firebase URL directly
      window.open(documentPath, '_blank');
    } else {
      // Development: Download from API and open as blob
      const blob = await this.downloadFile(documentPath);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  },

  async getMyRequests(): Promise<FinancialAidResponse[]> {
    const response = await api.get<{ requests: FinancialAidResponse[] }>(`${FINANCIAL_AID_BASE_URL}/my-requests`);
    return response.data.requests;
  },

  async getRequestDetails(requestId: number): Promise<FinancialAidResponse> {
    const response = await api.get(`${FINANCIAL_AID_BASE_URL}/${requestId}`);
    return response.data;
  },

  async cancelRequest(requestId: number): Promise<FinancialAidResponse> {
    const response = await api.post(`${FINANCIAL_AID_BASE_URL}/${requestId}/cancel`);
    return response.data;
  },

  // Organization owner endpoints
  async getPendingRequests(): Promise<{ requests: FinancialAidResponse[]; availableBudget: number }> {
    const response = await api.get(`${FINANCIAL_AID_BASE_URL}/pending`);
    return response.data;
  },

  async getAllRequests(status?: FinancialAidStatus): Promise<{ requests: FinancialAidResponse[] }> {
    const params = status ? { status } : {};
    const response = await api.get(`${FINANCIAL_AID_BASE_URL}/all`, { params });
    return response.data;
  },

  async reviewRequest(
    requestId: number,
    reviewRequest: FinancialAidReviewRequest
  ): Promise<FinancialAidResponse> {
    const response = await api.post(`${FINANCIAL_AID_BASE_URL}/${requestId}/review`, reviewRequest);
    return response.data;
  },

  async disburseAid(requestId: number): Promise<FinancialAidResponse> {
    const response = await api.post(`${FINANCIAL_AID_BASE_URL}/${requestId}/disburse`);
    return response.data;
  },

  async getDonors(): Promise<DonorResponse[]> {
    const response = await api.get<{ donors: DonorResponse[] }>(`${FINANCIAL_AID_BASE_URL}/donors`);
    return response.data.donors;
  },

  async getDonorDetails(donorId: number): Promise<DonorResponse> {
    const response = await api.get(`${FINANCIAL_AID_BASE_URL}/donors/${donorId}`);
    return response.data;
  },

  async getStats(): Promise<Record<string, unknown>> {
    const response = await api.get(`${FINANCIAL_AID_BASE_URL}/stats`);
    return response.data;
  }
};
