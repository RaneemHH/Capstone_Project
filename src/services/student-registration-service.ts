import { api } from '@/api/axios';
import type { StudentRegistrationResponse } from '@/types/student-registration';

export interface RegisterStudentRequest {
    exhibitionId: number;
    schoolId: number;
}

/**
 * Student Registration Service
 * Handles student registration for exhibitions
 */
class StudentRegistrationService {
    // ----------------- REGISTER STUDENT -----------------
    /**
     * Register student for an exhibition
     * Status: PENDING
     * Role: STUDENT
     */
    async registerStudent(request: RegisterStudentRequest): Promise<StudentRegistrationResponse> {
        const response = await api.post<StudentRegistrationResponse>(
            `/api/students/register/${request.exhibitionId}`,
            null
        );
        return response.data;
    }

    // ----------------- GET REGISTRATIONS -----------------
    /**
     * Get all registrations for current student
     * Role: STUDENT
     */
    async getStudentRegistrations(): Promise<StudentRegistrationResponse[]> {
        const response = await api.get<StudentRegistrationResponse[]>(
            '/api/students/registrations'
        );
        return response.data;
    }

    /**
     * Get registration by ID
     * Role: STUDENT, ORG_OWNER
     */
    async getRegistrationById(registrationId: number): Promise<StudentRegistrationResponse> {
        const response = await api.get<StudentRegistrationResponse>(
            `/api/students/${registrationId}`
        );
        return response.data;
    }

    /**
     * Get registrations by exhibition
     * Role: ORG_OWNER
     */
    async getRegistrationsByExhibition(exhibitionId: number): Promise<StudentRegistrationResponse[]> {
        const response = await api.get<StudentRegistrationResponse[]>(
            `/api/students/exhibition/${exhibitionId}`
        );
        return response.data;
    }

    // ----------------- APPROVE STUDENT -----------------
    /**
     * Approve single student registration
     * Status: REGISTERED
     * Role: ORG_OWNER
     */
    async approveStudent(registrationId: number): Promise<StudentRegistrationResponse> {
        const response = await api.post<StudentRegistrationResponse>(
            `/api/students/approve/${registrationId}`
        );
        return response.data;
    }

    // ----------------- APPROVE MULTIPLE STUDENTS -----------------
    /**
     * Approve multiple student registrations
     * Status: REGISTERED
     * Role: ORG_OWNER
     */
    async approveStudents(registrationIds: number[]): Promise<StudentRegistrationResponse[]> {
        const response = await api.post<StudentRegistrationResponse[]>(
            '/api/students/approve-multiple',
            registrationIds
        );
        return response.data;
    }

    // ----------------- CANCEL REGISTRATION -----------------
    /**
     * Cancel student registration
     * Status: CANCELLED
     * Role: STUDENT or ORG_OWNER
     */
    async cancelRegistration(registrationId: number): Promise<StudentRegistrationResponse> {
        const response = await api.post<StudentRegistrationResponse>(
            `/api/students/${registrationId}/cancel`
        );
        return response.data;
    }
}

// Export singleton instance
export const studentRegistrationService = new StudentRegistrationService();
