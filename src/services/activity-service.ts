import { api } from '@/api/axios';
import type { ActivityResponse } from '@/types/activity';

const BASE_URL = "/api/activities";

export const activityService = {
    // Get all activities
    getAllActivities: async (): Promise<ActivityResponse[]> => {
        const response = await api.get<ActivityResponse[]>(BASE_URL);
        return response.data;
    }
};

export default activityService;
