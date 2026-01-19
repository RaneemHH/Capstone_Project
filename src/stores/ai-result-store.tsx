import { create } from "zustand";
import { type AIResultResponseDTO } from "@/services/ai-result-service.ts";

interface AIResultState {
    result: AIResultResponseDTO | null;
    isLoading: boolean;
    error: string | null;
    setResult: (result: AIResultResponseDTO | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useAIResultStore = create<AIResultState>((set) => ({
    result: null,
    isLoading: false,
    error: null,
    setResult: (result) => set({ result }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    reset: () => set({ result: null, isLoading: false, error: null }),
}));