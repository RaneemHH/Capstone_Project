import { api } from "@/api/axios";

export interface AIResultResponseDTO {
    id: number;
    testAttemptId: number;
    personalityCode: string;
    careerRecommendations: string;
    learningPath: string;
    jobMatches: string; // JSON string array of job matches
    emailSent: boolean;
    createdAt: string;
}

export const getAIResultByAttempt = async (attemptId: number): Promise<AIResultResponseDTO | null> => {
    try {
        const response = await api.get<AIResultResponseDTO>(`api/ai-results/attempt/${attemptId}`);
        
        if (response.status === 200) {
            // AI results are ready
            return response.data;
        } else if (response.status === 202) {
            // AI analysis still in progress
            return null;
        } else {
            // Unexpected status
            throw new Error(`Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching AI result:", error);
        throw error; // Re-throw to let the caller handle it
    }
};
