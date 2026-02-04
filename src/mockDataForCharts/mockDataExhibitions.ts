// Mock financial data for exhibition charts demo
export const mockMonthlyFinancials = {
    monthlyStats: [
        {
            month: "كانون الثاني",
            totalRevenue: 45000,
            totalExpenses: 18000,
            netProfit: 27000,
        },
        {
            month: "شباط",
            totalRevenue: 52000,
            totalExpenses: 21000,
            netProfit: 31000,
        },
        {
            month: "آذار",
            totalRevenue: 38000,
            totalExpenses: 19500,
            netProfit: 18500,
        },
        {
            month: "نيسان",
            totalRevenue: 35000,
            totalExpenses: 42000,
            netProfit: -7000,
        },
        {
            month: "أيار",
            totalRevenue: 55000,
            totalExpenses: 22500,
            netProfit: 32500,
        },
        {
            month: "حزيران",
            totalRevenue: 68000,
            totalExpenses: 25000,
            netProfit: 43000,
        },
    ],
};

// Function to merge mock data with real data
export const getMergedFinancialData = (realData: typeof mockMonthlyFinancials | null) => {
    // Always add mock data to real data for demo purposes
    if (realData && realData.monthlyStats && realData.monthlyStats.length > 0) {
        // Merge: combine real data with mock data
        return {
            monthlyStats: [...realData.monthlyStats, ...mockMonthlyFinancials.monthlyStats]
        };
    }
    // Otherwise use only mock data for demo
    return mockMonthlyFinancials;
};
