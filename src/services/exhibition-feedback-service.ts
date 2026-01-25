import { api } from '@/api/axios';
import type { ExhibitionFeedbackResponse } from '@/types/exhibition-feedback';

class ExhibitionFeedbackService {
    // ----------------- Submit Feedback -----------------
    /**
     * Submit feedback for an exhibition
     * @param exhibitionId - Exhibition ID
     * @param rating - Rating (1-5)
     * @param comments - Optional comments
     * @returns ExhibitionFeedbackResponse
     */
    async submitFeedback(
        exhibitionId: number,
        rating: number,
        comments?: string
    ): Promise<ExhibitionFeedbackResponse> {
        const response = await api.post<ExhibitionFeedbackResponse>(
            '/api/feedback/submit',
            null,
            {
                params: {
                    exhibitionId,
                    rating,
                    comments
                }
            }
        );
        return response.data;
    }

    // ----------------- Get Feedback for Exhibition -----------------
    /**
     * Get all feedback for an exhibition (ORG_OWNER only)
     * @param exhibitionId - Exhibition ID
     * @returns List of ExhibitionFeedbackResponse
     */
    async getFeedbackForExhibition(exhibitionId: number): Promise<ExhibitionFeedbackResponse[]> {
        const response = await api.get<ExhibitionFeedbackResponse[]>(
            `/api/feedback/exhibition/${exhibitionId}`
        );
        return response.data;
    }
}

// Export singleton instance
export const exhibitionFeedbackService = new ExhibitionFeedbackService();
