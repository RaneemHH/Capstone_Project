import { api } from "@/api/axios";
import type { School } from "@/types/school";

export const schoolService = {
    /**
     * Get all active schools
     */
    getAllActiveSchools: async (): Promise<School[]> => {
        const response = await api.get<School[]>('/api/schools');
        return response.data;
    },

    /**
     * Get school by ID
     */
    getSchoolById: async (schoolId: number): Promise<School> => {
        const response = await api.get<School>(`/api/schools/${schoolId}`);
        return response.data;
    },

    /**
     * Get schools by owner ID
     */
    getSchoolsByOwnerId: async (ownerId: number): Promise<School[]> => {
        const response = await api.get<School[]>(`/api/schools/owner/${ownerId}`);
        return response.data;
    }
};
