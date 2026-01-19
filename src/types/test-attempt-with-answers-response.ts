import type {Metric} from "@/data/user-test-schema.ts";

export interface EvaluationResult {
  firstMetric: string | null;
  secondMetric: string | null;
  thirdMetric: string | null;
  metricScores: Record<string, number>;
}
export type AnswerType = "OPEN" | "CHECKBOX" | "SCALE";

export interface AnswerResponse {
    questionId: number;
    questionText: string;
    subQuestionId?: number;
    subQuestionText?: string;
    metric: Metric;
    answerType: AnswerType;
    binaryValue?: boolean;
    scaleValue?: number;
    openValues?: string[];
}

export interface TestAttemptWithAnswersResponse {
    attemptId: number;
    testId: number;
    testTitle: string;
    studentId: number;
    studentName: string;
    answers: AnswerResponse[];
    evaluationResult: EvaluationResult;
}