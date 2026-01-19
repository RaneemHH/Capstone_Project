import {api} from "@/api/axios";
import type {Question,AdminTest} from "@/data/admin-test-schema.ts"



export interface TestRequest {
    title?: string;
    description?: string;
    versionName?: string;
    baseTestId?: number;
}


export interface SectionRequest {
    title?: string;
}

export interface QuestionRequest {
    questionText?: string;
    answerType?: string;
    targetGender?: string;
}
export interface SubQuestionRequest {
    subQuestionText?: string;
    metricId?: number;
    targetGender?: string;
}

export interface CreateVersionRequest {
    baseTestId: number;
    sourceTestId?: number;
    versionName?: string;
}

const url = "api/tests";

// 1. Create a test
export const createTest = async (data: TestRequest): Promise<AdminTest> => {
    const response = await api.post(`${url}`, data);
    return response.data;
};

// 2. Add sections to a test
export const addSection = async (testId: number, sections: SectionRequest): Promise<AdminTest> => {
    const response = await api.patch(`${url}/${testId}/sections`, sections);
    return response.data;
};

// 3. Add questions to a section
export const addQuestion = async (
    testId: number,
    sectionId: number,
    question?: Partial<Question>,
): Promise<AdminTest> => {
    const response = await api.patch(`${url}/${testId}/sections/${sectionId}/questions`, question);
    return response.data;
};

// 4. Add subquestions to a question
export const addSubQuestion = async (
    testId: number,
    questionId: number,
    subQuestions: SubQuestionRequest
): Promise<AdminTest> => {
    const response = await api.patch(`${url}/${testId}/questions/${questionId}/subquestions`, subQuestions);
    return response.data;
};


// 5. Update test (title/description)
export const updateTest = async (
    testId: number,
    data: TestRequest,
): Promise<AdminTest> => {
    const response = await api.patch(`${url}/${testId}`, data);
    return response.data;
};

// 6. Update section
export const updateSection = async (
    testId: number,
    sectionId: number,
    data: SectionRequest
): Promise<AdminTest> => {
    const response = await api.patch(`${url}/${testId}/sections/${sectionId}`, data);
    return response.data;
};

// 7. Update question
export const updateQuestion = async (
    testId: number,
    questionId: number,
    data: Partial<QuestionRequest>
): Promise<AdminTest> => {
    const response = await api.patch(`${url}/${testId}/questions/${questionId}`, data);
    return response.data;
};

// 8. Update subquestion
export const updateSubQuestion = async (
    testId: number,
    subQuestionId: number,
    data: Partial<SubQuestionRequest>
): Promise<AdminTest> => {
    const response = await api.patch(`${url}/${testId}/subquestions/${subQuestionId}`, data);
    return response.data;
};








// 9. Delete test
export const deleteTest = async (testId: number): Promise<string> => {
    const response = await api.delete(`${url}/${testId}`);
    return response.data;
};

// 10. Delete section
export const deleteSection = async (testId: number, sectionId: number): Promise<string> => {
    const response = await api.delete(`${url}/${testId}/sections/${sectionId}`);
    return response.data;
};

// 11. Delete question
export const deleteQuestion = async (testId: number, questionId: number): Promise<string> => {
    const response = await api.delete(`${url}/${testId}/questions/${questionId}`);
    return response.data;
};

// 12. Delete subquestion
export const deleteSubQuestion = async (testId: number, subQuestionId: number): Promise<string> => {
    const response = await api.delete(`${url}/${testId}/subquestions/${subQuestionId}`);
    return response.data;
};
// 13. Get all tests
export const getAllTests = async (): Promise<AdminTest[]> => {
    const response = await api.get(`${url}`);
    return response.data;
};

// 14. Get test by ID
export const getTestById = async (id: number): Promise<AdminTest> => {
    const response = await api.get(`${url}/${id}`);
    return response.data;
};
// 15. Confirm test
export const confirmTest = async (testId: number): Promise<AdminTest> => {
    const response = await api.put(`${url}/${testId}/publish`);
    return response.data;
};
// 16. Set test active/inactive
export const setTestActive = async (
    testId: number,
    active: boolean
): Promise<AdminTest> => {
    const response = await api.put(`${url}/${testId}/active`, null, {
        params: { active },
    });
    return response.data;
};

// 17. Create version of existing test
export const createVersion = async (
    data: CreateVersionRequest
): Promise<AdminTest> => {
    const response = await api.post(`${url}/versions`, data);
    return response.data;
};