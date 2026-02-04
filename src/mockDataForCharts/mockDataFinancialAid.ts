// Mock financial aid data for scatter chart demo
export const mockFinancialAidScatterData = [
    { university: "جامعة الملك سعود", requestCount: 25, totalAmount: 18000 },
    { university: "جامعة الإمام محمد بن سعود", requestCount: 8, totalAmount: 35000 },
    { university: "جامعة الملك عبدالعزيز", requestCount: 32, totalAmount: 28000 },
    { university: "جامعة الملك فهد للبترول", requestCount: 12, totalAmount: 45000 },
    { university: "جامعة الأميرة نورة", requestCount: 19, totalAmount: 12000 },
    { university: "جامعة الملك فيصل", requestCount: 42, totalAmount: 38000 },
    { university: "جامعة أم القرى", requestCount: 15, totalAmount: 22000 },
    { university: "جامعة الطائف", requestCount: 28, totalAmount: 8000 },
    { university: "جامعة الدمام", requestCount: 6, totalAmount: 31000 },
    { university: "جامعة جازان", requestCount: 35, totalAmount: 15000 },
];

// Function to merge mock data with real data
export const getMergedFinancialAidData = (realData: typeof mockFinancialAidScatterData | null) => {
    // If we have real data and it's not empty, use it
    if (realData && realData.length > 0) {
        return realData;
    }
    // Otherwise use mock data for demo
    return mockFinancialAidScatterData;
};
