import { create } from 'zustand';
import { getParticipationStats, getFeedbackAnalytics, getMonthlyFinancialAnalytics } from '@/services/dashboard-service';
import type { ParticipationStatsResponse, FeedbackAnalyticsResponse, MonthlyFinancialAnalyticsResponse } from '@/services/dashboard-service';
import { toast } from 'sonner';
import { getMockDataForExhibition } from '@/mockDataForCharts/mockExhibitionDetails';

interface DashboardStore {
    participationStats: ParticipationStatsResponse | null;
    isLoadingStats: boolean;
    feedbackAnalytics: FeedbackAnalyticsResponse | null;
    isLoadingFeedback: boolean;
    monthlyFinancials: MonthlyFinancialAnalyticsResponse | null;
    isLoadingMonthlyFinancials: boolean;
    error: string | null;
    fetchParticipationStats: (exhibitionId: number) => Promise<void>;
    fetchFeedbackAnalytics: (exhibitionId: number) => Promise<void>;
    fetchMonthlyFinancialAnalytics: (orgId?: number) => Promise<void>;
    clearStats: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    participationStats: null,
    isLoadingStats: false,
    feedbackAnalytics: null,
    isLoadingFeedback: false,
    monthlyFinancials: null,
    isLoadingMonthlyFinancials: false,
    error: null,

    fetchParticipationStats: async (exhibitionId: number) => {
        set({ isLoadingStats: true, error: null });
        try {
            const stats = await getParticipationStats(exhibitionId);
            
            // Merge with mock data if available for this exhibition
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.participationStats) {
                const mergedStats: ParticipationStatsResponse = {
                    universities: {
                        invited: stats.universities.invited + mockData.participationStats.universities.invited,
                        registered: stats.universities.registered + mockData.participationStats.universities.accepted,
                        confirmed: stats.universities.confirmed + mockData.participationStats.universities.finalized,
                        finalized: stats.universities.finalized + mockData.participationStats.universities.finalized,
                        attended: stats.universities.attended + mockData.participationStats.universities.finalized,
                    },
                    activityProviders: {
                        invited: stats.activityProviders.invited + mockData.participationStats.activityProviders.invited,
                        proposalSubmitted: stats.activityProviders.proposalSubmitted + mockData.participationStats.activityProviders.accepted,
                        finalized: stats.activityProviders.finalized + mockData.participationStats.activityProviders.finalized,
                        attended: stats.activityProviders.attended + mockData.participationStats.activityProviders.finalized,
                    },
                    schools: {
                        invited: stats.schools.invited + mockData.participationStats.schools.invited,
                        registered: stats.schools.registered + mockData.participationStats.schools.confirmed,
                        finalized: stats.schools.finalized + mockData.participationStats.schools.participated,
                        attended: stats.schools.attended + mockData.participationStats.schools.participated,
                    },
                    students: stats.students,
                };
                set({ participationStats: mergedStats, isLoadingStats: false });
            } else {
                set({ participationStats: stats, isLoadingStats: false });
            }
        } catch (error) {
            console.error('Failed to fetch participation stats:', error);
            // Use only mock data if available and API fails
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.participationStats) {
                const mockStats: ParticipationStatsResponse = {
                    universities: {
                        invited: mockData.participationStats.universities.invited,
                        registered: mockData.participationStats.universities.accepted,
                        confirmed: mockData.participationStats.universities.finalized,
                        finalized: mockData.participationStats.universities.finalized,
                        attended: mockData.participationStats.universities.finalized,
                    },
                    activityProviders: {
                        invited: mockData.participationStats.activityProviders.invited,
                        proposalSubmitted: mockData.participationStats.activityProviders.accepted,
                        finalized: mockData.participationStats.activityProviders.finalized,
                        attended: mockData.participationStats.activityProviders.finalized,
                    },
                    schools: {
                        invited: mockData.participationStats.schools.invited,
                        registered: mockData.participationStats.schools.confirmed,
                        finalized: mockData.participationStats.schools.participated,
                        attended: mockData.participationStats.schools.participated,
                    },
                    students: {
                        totalRegistered: 0,
                        approved: 0,
                        attended: 0,
                        pending: 0,
                    },
                };
                set({ participationStats: mockStats, isLoadingStats: false, error: null });
            } else {
                const errorMessage = 'فشل في تحميل إحصائيات المشاركة';
                set({ error: errorMessage, isLoadingStats: false });
                toast.error(errorMessage);
            }
        }
    },

    fetchFeedbackAnalytics: async (exhibitionId: number) => {
        set({ isLoadingFeedback: true, error: null });
        try {
            const analytics = await getFeedbackAnalytics(exhibitionId);
            
            // Merge with mock data if available for this exhibition
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.feedbacks && mockData.feedbacks.length > 0) {
                // Calculate mock feedback analytics
                const mockTotalFeedbacks = mockData.feedbacks.length;
                const mockAverageRating = mockData.feedbacks.reduce((sum, f) => sum + f.rating, 0) / mockTotalFeedbacks;
                const mockFeedbacksByRating: Record<number, number> = {};
                mockData.feedbacks.forEach(f => {
                    mockFeedbacksByRating[f.rating] = (mockFeedbacksByRating[f.rating] || 0) + 1;
                });
                
                // Merge with real data
                const totalFeedbacks = analytics.totalFeedbacks + mockTotalFeedbacks;
                const mergedAverageRating = (
                    (analytics.averageRating * analytics.totalFeedbacks) + 
                    (mockAverageRating * mockTotalFeedbacks)
                ) / totalFeedbacks;
                
                const mergedFeedbacksByRating: Record<number, number> = { ...analytics.feedbacksByRating };
                Object.entries(mockFeedbacksByRating).forEach(([rating, count]) => {
                    const ratingNum = parseInt(rating);
                    mergedFeedbacksByRating[ratingNum] = (mergedFeedbacksByRating[ratingNum] || 0) + count;
                });
                
                const mergedAnalytics: FeedbackAnalyticsResponse = {
                    totalFeedbacks,
                    averageRating: mergedAverageRating,
                    feedbacksByRating: mergedFeedbacksByRating
                };
                
                set({ feedbackAnalytics: mergedAnalytics, isLoadingFeedback: false });
            } else {
                set({ feedbackAnalytics: analytics, isLoadingFeedback: false });
            }
        } catch (error) {
            const errorMessage = 'فشل في تحميل إحصائيات التقييمات';
            set({ error: errorMessage, isLoadingFeedback: false });
            console.error('Failed to fetch feedback analytics:', error);
            
            // Use only mock data if available on error
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.feedbacks && mockData.feedbacks.length > 0) {
                const mockTotalFeedbacks = mockData.feedbacks.length;
                const mockAverageRating = mockData.feedbacks.reduce((sum, f) => sum + f.rating, 0) / mockTotalFeedbacks;
                const mockFeedbacksByRating: Record<number, number> = {};
                mockData.feedbacks.forEach(f => {
                    mockFeedbacksByRating[f.rating] = (mockFeedbacksByRating[f.rating] || 0) + 1;
                });
                
                const mockAnalytics: FeedbackAnalyticsResponse = {
                    totalFeedbacks: mockTotalFeedbacks,
                    averageRating: mockAverageRating,
                    feedbacksByRating: mockFeedbacksByRating
                };
                
                set({ feedbackAnalytics: mockAnalytics, isLoadingFeedback: false, error: null });
            } else {
                toast.error(errorMessage);
            }
        }
    },

    fetchMonthlyFinancialAnalytics: async (orgId?: number) => {
        set({ isLoadingMonthlyFinancials: true, error: null });
        try {
            const financials = await getMonthlyFinancialAnalytics(orgId);
            set({ monthlyFinancials: financials, isLoadingMonthlyFinancials: false });
        } catch (error) {
            console.error('Failed to fetch monthly financial analytics:', error);
            const errorMessage = 'فشل في تحميل الإحصائيات المالية الشهرية';
            set({ error: errorMessage, isLoadingMonthlyFinancials: false });
            toast.error(errorMessage);
        }
    },

    clearStats: () => {
        set({ participationStats: null, feedbackAnalytics: null, monthlyFinancials: null, error: null });
    },
}));
