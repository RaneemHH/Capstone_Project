import { create } from "zustand";
import type { TestAttemptWithAnswersResponse } from "@/types/test-attempt-with-answers-response.ts";

interface TestAttemptsState {
  attempts: TestAttemptWithAnswersResponse[];
  setAttempts: (attempts: TestAttemptWithAnswersResponse[]) => void;
  loading: boolean;
  error: string | null;
}

export const useTestAttemptsStore = create<TestAttemptsState>((set) => ({
  attempts: [],
  loading: false,
  error: null,
  setAttempts: (attempts) => set({ attempts }),
}));