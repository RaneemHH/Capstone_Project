import { api } from '@/api/axios';
import type { StudentRegistrationResponse } from '@/types/student-registration';

const BASE_URL = "/api/registrations";

/**
 * Attendance Service
 * Handles attendance marking for students, universities, schools, and activity providers
 */
export const attendanceService = {
    // ----------------- Mark Single Student Attendance -----------------
    /**
     * Mark attendance for a single student
     * @param registrationId - The registration ID
     * @param attended - true for ATTENDED, false for NO_SHOW
     * Role: ORG_OWNER, DEVELOPER
     */
    markStudentAttendance: async (
        registrationId: number,
        attended: boolean
    ): Promise<StudentRegistrationResponse> => {
        const response = await api.post<StudentRegistrationResponse>(
            `${BASE_URL}/attendance/${registrationId}`,
            null,
            {
                params: { attended }
            }
        );
        return response.data;
    },

    // ----------------- Mark Multiple Students Attendance -----------------
    /**
     * Mark attendance for multiple students at once
     * @param registrationIds - Array of registration IDs
     * @param attended - true for ATTENDED, false for NO_SHOW
     * Role: ORG_OWNER, DEVELOPER
     */
    markMultipleStudentAttendance: async (
        registrationIds: number[],
        attended: boolean
    ): Promise<StudentRegistrationResponse[]> => {
        const response = await api.post<StudentRegistrationResponse[]>(
            `${BASE_URL}/attendance-multiple`,
            registrationIds,
            {
                params: { attended }
            }
        );
        return response.data;
    },

    // ----------------- Mark University Attendance -----------------
    /**
     * Mark attendance for a university participation
     * @param participationId - The university participation ID
     * Role: ORG_OWNER, DEVELOPER
     */
    markUniversityAttendance: async (participationId: number): Promise<void> => {
        await api.post(
            `${BASE_URL}/university/${participationId}/attend`
        );
    },

    // ----------------- Mark School Attendance -----------------
    /**
     * Mark attendance for a school participation
     * @param participationId - The school participation ID
     * Role: ORG_OWNER, DEVELOPER
     */
    markSchoolAttendance: async (participationId: number): Promise<void> => {
        await api.post(
            `${BASE_URL}/school/${participationId}/attend`
        );
    },

    // ----------------- Mark Provider Attendance -----------------
    /**
     * Mark attendance for an activity provider request
     * @param requestId - The activity provider request ID
     * Role: ORG_OWNER, DEVELOPER
     */
    markProviderAttendance: async (requestId: number): Promise<void> => {
        await api.post(
            `${BASE_URL}/provider/${requestId}/attend`
        );
    }
};

export default attendanceService;
