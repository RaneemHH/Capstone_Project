import { create } from "zustand";

interface AIAnalysisResponse {
    success: boolean;
    message: string;
    attemptId: number;
    // analysis?: string; // Optional - available when analysis is complete
}

interface AIAnalysisStore {
    analysis: AIAnalysisResponse | null;
    isLoading: boolean;
    error: string | null;
    isProcessing: boolean; // True when analysis is triggered but not yet complete
    setAnalysis: (analysis: AIAnalysisResponse) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setProcessing: (processing: boolean) => void;
    clearAnalysis: () => void;
}

export const useAIAnalysisStore = create<AIAnalysisStore>((set) => ({
    analysis: null,
    isLoading: false,
    error: null,
    isProcessing: false,
    setAnalysis: (analysis) => set({ analysis, error: null, isProcessing: false }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, isProcessing: false }),
    setProcessing: (isProcessing) => set({ isProcessing }),
    clearAnalysis: () => set({ analysis: null, error: null, isLoading: false, isProcessing: false }),
}));
