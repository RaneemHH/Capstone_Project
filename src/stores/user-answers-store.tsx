import { create } from "zustand";
import type { AnswerResponse } from "@/services/test-attempt.ts";

interface UserAnswersStore {
    answers: AnswerResponse[];
    setAnswers: (answers: AnswerResponse[]) => void;
}

export const useUserAnswersStore = create<UserAnswersStore>(set => ({
    answers: [],
    setAnswers: (answers) => set({ answers }),

}));
