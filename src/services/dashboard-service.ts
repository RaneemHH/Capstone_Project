import { api } from "@/api/axios";

/**
 * Base URL for dashboard endpoints
 */
const url = "api/dashboard";

/* =========================
   DTO Types (Responses)
========================= */

export interface ExhibitionOverviewResponse {
    totalExhibitions: number;
    activeExhibitions: number;
    planingExhibtion: number;
    completedExhibitions: number;
    cancelledExhibitions: number;
    statusBreakdown: Record<string, number>; // Status -> count
    totalRevenue: number;   // BigDecimal from backend -> number in TS
    totalExpenses: number;  // BigDecimal -> number
    netProfit: number;      // BigDecimal -> number
}

export interface ParticipationStatsResponse {
    exhibitionId: number;
    exhibitionTitle: string;

    universities: UniversityStats;
    schools: SchoolStats;
    students: StudentStats;
    activityProviders: ActivityProviderStats;

    totalExpectedVisitors: number;
    actualAttendees: number;
    attendanceRate: number;
}

export interface UniversityStats {
    invited: number;
    registered: number;
    confirmed: number;
    finalized: number;
    attended: number;
    totalBooths: number;
    attendanceRate: number;
}

export interface SchoolStats {
    invited: number;
    registered: number;
    finalized: number;
    attended: number;
    attendanceRate: number;
}

export interface StudentStats {
    registered: number;
    attended: number;
    noShow: number;
    attendanceRate: number;
}

export interface ActivityProviderStats {
    invited: number;
    proposalSubmitted: number;
    finalized: number;
    attended: number;
    totalBooths: number;
    attendanceRate: number;
}

export interface FinancialAidAnalyticsResponse {
    totalRequests: number;
    requestsByUniversity: Record<string, number>; // University name -> count
    requestsByMajor: Record<string, number>; // Field of study/major -> count
    requestsByStatus: Record<string, number>; // Status -> count
}

export interface FeedbackAnalyticsResponse {
    totalFeedbacks: number;
    averageRating: number;
    feedbacksByRating: Record<number, number>; // Rating (1-5) -> Number of students
}

export interface TestAnalyticsResponse {
    totalAttempts: number;
    attemptsByBaseTestType: Record<string, number>;
}

export interface MonthlyFinancialAnalyticsResponse {
    monthlyStats: MonthlyStat[];
}

export interface MonthlyStat {
    month: string; // Format: YYYY-MM
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
}

/* =========================
   Service Methods
========================= */

/**
 * 1) Get Exhibition Overview Dashboard
 * GET /api/dashboard/exhibitions/overview?orgId={orgId}
 */
export const getExhibitionsOverview = async (
    orgId?: number
): Promise<ExhibitionOverviewResponse> => {
    const response = await api.get(`${url}/exhibitions/overview`, {
        params: orgId ? { orgId } : undefined,
    });
    return response.data;
};

/**
 * 2) Get Participation Stats for a specific Exhibition
 * GET /api/dashboard/exhibitions/{exhibitionId}/participation-stats
 */
export const getParticipationStats = async (
    exhibitionId: number
): Promise<ParticipationStatsResponse> => {
    const response = await api.get(
        `${url}/exhibitions/${exhibitionId}/participation-stats`
    );
    return response.data;
};

/**
 * 3) Get Financial Aid Analytics
 * GET /api/dashboard/financial-aid/analytics?orgId={orgId}
 */
export const getFinancialAidAnalytics = async (
    orgId?: number
): Promise<FinancialAidAnalyticsResponse> => {
    const response = await api.get(`${url}/financial-aid/analytics`, {
        params: orgId ? { orgId } : undefined,
    });
    return response.data;
};

/**
 * 4) Get Feedback Analytics for a specific Exhibition
 * GET /api/dashboard/exhibitions/{exhibitionId}/feedback-analytics
 */
export const getFeedbackAnalytics = async (
    exhibitionId: number
): Promise<FeedbackAnalyticsResponse> => {
    const response = await api.get(
        `${url}/exhibitions/${exhibitionId}/feedback-analytics`
    );
    return response.data;
};

/**
 * 5) Get Test Analytics (Global)
 * GET /api/dashboard/test/analytics
 */
export const getTestAnalytics = async (): Promise<TestAnalyticsResponse> => {
    const response = await api.get(`${url}/test/analytics`);
    return response.data;
};

/**
 * 6) Get Monthly Financial Analytics for completed exhibitions
 * GET /api/dashboard/financials/monthly?orgId={orgId}
 */
export const getMonthlyFinancialAnalytics = async (
    orgId?: number
): Promise<MonthlyFinancialAnalyticsResponse> => {
    const response = await api.get(`${url}/financials/monthly`, {
        params: orgId ? { orgId } : undefined,
    });
    return response.data;
};
