// Mock data for attempts page

// Mock test analytics for bar chart
export const mockTestAnalytics = {
    totalAttempts: 145,
    averageScore: 75.5,
    attemptsByBaseTestType: {
        "اختبار الشخصية": 45,
        "اختبار القدرات": 38,
        "اختبار الميول": 32,
        "اختبار الذكاء": 30,
    },
    completionRate: 85.5,
};

// Mock attempts data for table
export const mockAttemptsData = [
    {
        attemptId: 1,
        studentName: "أحمد محمد السعيد",
        testTitle: "اختبار الشخصية الشامل",
        baseTestType: "اختبار الشخصية",
        score: 85.5,
        completedAt: "2026-01-15T10:30:00",
        status: "COMPLETED",
        duration: 45,
        evaluationResult: {
            firstMetric: "R",
            secondMetric: "I",
            thirdMetric: "A",
        },
    },
    {
        attemptId: 2,
        studentName: "فاطمة أحمد العلي",
        testTitle: "اختبار القدرات العامة",
        baseTestType: "اختبار القدرات",
        score: 92.0,
        completedAt: "2026-01-14T14:20:00",
        status: "COMPLETED",
        duration: 60,
        evaluationResult: {
            firstMetric: "S",
            secondMetric: "E",
            thirdMetric: "C",
        },
    },
    {
        attemptId: 3,
        studentName: "خالد عبدالله الغامدي",
        testTitle: "اختبار الميول المهنية",
        baseTestType: "اختبار الميول",
        score: 78.5,
        completedAt: "2026-01-13T09:15:00",
        status: "COMPLETED",
        duration: 40,
        evaluationResult: {
            firstMetric: "I",
            secondMetric: "R",
            thirdMetric: "E",
        },
    },
    {
        attemptId: 4,
        studentName: "نورة سعد القحطاني",
        testTitle: "اختبار الذكاء العام",
        baseTestType: "اختبار الذكاء",
        score: 88.0,
        completedAt: "2026-01-12T16:45:00",
        status: "COMPLETED",
        duration: 50,
        evaluationResult: {
            firstMetric: "A",
            secondMetric: "S",
            thirdMetric: "I",
        },
    },
    {
        attemptId: 5,
        studentName: "محمد علي الشمري",
        testTitle: "اختبار الشخصية المتقدم",
        baseTestType: "اختبار الشخصية",
        score: 75.5,
        completedAt: "2026-01-11T11:30:00",
        status: "COMPLETED",
        duration: 42,
        evaluationResult: {
            firstMetric: "C",
            secondMetric: "R",
            thirdMetric: "I",
        },
    },
    {
        attemptId: 6,
        studentName: "سارة عبدالرحمن الدوسري",
        testTitle: "اختبار القدرات التحليلية",
        baseTestType: "اختبار القدرات",
        score: 95.0,
        completedAt: "2026-01-10T13:00:00",
        status: "COMPLETED",
        duration: 55,
        evaluationResult: {
            firstMetric: "E",
            secondMetric: "A",
            thirdMetric: "S",
        },
    },
    {
        attemptId: 7,
        studentName: "عبدالعزيز فهد المطيري",
        testTitle: "اختبار الميول الأكاديمية",
        baseTestType: "اختبار الميول",
        score: 82.0,
        completedAt: "2026-01-09T10:20:00",
        status: "COMPLETED",
        duration: 38,
        evaluationResult: {
            firstMetric: "R",
            secondMetric: "E",
            thirdMetric: "C",
        },
    },
    {
        attemptId: 8,
        studentName: "ريم محمد العتيبي",
        testTitle: "اختبار الذكاء المنطقي",
        baseTestType: "اختبار الذكاء",
        score: 90.5,
        completedAt: "2026-01-08T15:30:00",
        status: "COMPLETED",
        duration: 48,
        evaluationResult: {
            firstMetric: "I",
            secondMetric: "A",
            thirdMetric: "C",
        },
    },
    {
        attemptId: 9,
        studentName: "عمر حسن الزهراني",
        testTitle: "اختبار الشخصية الأساسي",
        baseTestType: "اختبار الشخصية",
        score: 79.0,
        completedAt: "2026-01-07T09:45:00",
        status: "COMPLETED",
        duration: 35,
        evaluationResult: {
            firstMetric: "S",
            secondMetric: "R",
            thirdMetric: "A",
        },
    },
    {
        attemptId: 10,
        studentName: "هند سليمان القرني",
        testTitle: "اختبار القدرات اللفظية",
        baseTestType: "اختبار القدرات",
        score: 87.5,
        completedAt: "2026-01-06T14:15:00",
        status: "COMPLETED",
        duration: 52,
        evaluationResult: {
            firstMetric: "A",
            secondMetric: "E",
            thirdMetric: "S",
        },
    },
];

// Function to merge mock analytics with real data
export const getMergedTestAnalytics = (realData: typeof mockTestAnalytics | null) => {
    // Always merge real data with mock data for demo
    if (realData && realData.attemptsByBaseTestType) {
        const merged = { ...realData };
        // Add mock counts to real counts
        Object.entries(mockTestAnalytics.attemptsByBaseTestType).forEach(([testType, count]) => {
            (merged.attemptsByBaseTestType as Record<string, number>)[testType] = 
                ((merged.attemptsByBaseTestType as Record<string, number>)[testType] || 0) + count;
        });
        merged.totalAttempts = (realData.totalAttempts || 0) + mockTestAnalytics.totalAttempts;
        return merged;
    }
    // Otherwise use only mock data for demo
    return mockTestAnalytics;
};

// Function to merge mock attempts with real data
export const getMergedAttemptsData = (realData: typeof mockAttemptsData | null) => {
    // Always merge real data with mock data for demo
    if (realData && Array.isArray(realData)) {
        return [...realData, ...mockAttemptsData];
    }
    // Otherwise use only mock data for demo
    return mockAttemptsData;
};
