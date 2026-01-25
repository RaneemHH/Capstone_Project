export interface ExhibitionFeedbackResponse {
    id: number;
    exhibitionId: number;
    studentId: number;
    studentName: string;
    rating: number;
    comments: string | null;
    createdAt: string;
}
