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
