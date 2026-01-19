import { api } from "@/api/axios";
import type {UserTest} from "@/data/user-test-schema.ts";
import type {Metric} from "@/data/user-test-schema.ts";
import type {TestAttemptWithAnswersResponse} from "@/types/test-attempt-with-answers-response.ts";
// === TYPES ===
export type AnswerType = "OPEN" | "CHECKBOX" | "SCALE";

export interface AnswerRequest {
    questionId: number;
    subQuestionId?: number;
    answerType: AnswerType;
    binaryValue?: boolean;
    scaleValue?:number;
    openValues?: string[];
}

// export type AnswerType = "OPEN" | "CHECKBOX" | "SCALE";
export interface PersonalityResult {
    id: number;
    type: string;
    description: string;
}



// export interface TestAttemptWithAnswersResponse {
//     attemptId: number;
//     testId: number;
//     testTitle: string;
//     studentId: number;
//     studentName: string;
//     answers: AnswerResponse[];
//     evaluationResult: EvaluationResult;
// }
//zabta
// export interface AnswerResponse {
//     questionId: number;
//     questionText: string;
//     subQuestionId?: number;
//     subQuestionText?: string;
//     metric: string;
//     answerType: string;
//     binaryValue?: boolean;
//     scaleValue?: number;
//     openValues?: string[];
// }
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

const url = "api/test-attempts";

// === API CALLS ===

// 1️⃣ Start a test
export const startTestAttempt = async (
    testId: number,
    studentId: number
): Promise<UserTest> => {
    const response = await api.get(`${url}/${testId}`, {
        params: { studentId },
    });
    return response.data;
};

// 2️⃣ Submit answers
export const submitAnswers = async (
    attemptId: number,
    answer: AnswerRequest
): Promise<string> => {
    const response = await api.patch(`${url}/${attemptId}/answers`, answer);
    return response.data;
};

// 3️⃣ Finalize test attempt
export const finalizeAttempt = async (
    attemptId: number
): Promise<PersonalityResult> => {
    const response = await api.patch(`${url}/${attemptId}/finalize`);
    return response.data;
};

// 4️⃣ Trigger AI Analysis
export const triggerAIAnalysis = async (
    attemptId: number
): Promise<{
    success: boolean;
    message: string;
    attemptId: number;
}> => {
    const response = await api.post(`${url}/${attemptId}/analyze`);
    return response.data;
};

// 5️⃣ Get all attempts (Admin only)
export const getAllTestAttempts = async (): Promise<
    TestAttemptWithAnswersResponse[]
> => {
    const response = await api.get(`${url}`);
    return response.data;
};

// 6️⃣ Get attempts by student
export const getAttemptsByStudent = async (
    studentId: number
): Promise<TestAttemptWithAnswersResponse[]> => {
    const response = await api.get(`${url}/students/${studentId}`);
    return response.data;
};
// 7️⃣ ✅ Get answers by attempt ID  →  GET /{attemptId}/answers
export const getAnswersByAttempt = async (
    attemptId: number
): Promise<AnswerResponse[]> => {
    const response = await api.get(`${url}/${attemptId}/answers`);
    return response.data;
};
// 8️⃣ ✅ Get full test attempt with answers → GET /fullAttempt/{attemptId}
export const getTestAttemptWithAnswersById = async (
    attemptId: number
): Promise<TestAttemptWithAnswersResponse> => {
    const response = await api.get(`${url}/fullAttempt/${attemptId}`);
    return response.data;
};
//used in useFetchUserTest.ts
//  9️⃣ ✅ Get test attempt basic info  →  GET /attempts/{attemptId}
//NO answers included - just the test template
export const getTestAttemptById = async (
    attemptId: number
): Promise<UserTest> => {
    const response = await api.get(`${url}/attempts/${attemptId}`);
    return response.data;
};

//used in useFetchUserTest.ts
// 🔟 ✅ Get all answers (Admin) → GET /answers
//duplicate of 7
export const getAllAnswersByTestAttemptId = async (
    attemptId: number
): Promise<AnswerResponse[]> => {
    const response = await api.get(`${url}/answers/${attemptId}`);
    return response.data;
};

