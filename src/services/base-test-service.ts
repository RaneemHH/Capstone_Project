import { api } from "@/api/axios";

// Types matching the Java BaseTest model
export interface BaseTest {
    id: number;
    code: string;  // e.g. PER_01
    type: string;  // PERSONALITY, MATH, IQ
}

// Types matching the Java BaseTestRequest DTO
export interface BaseTestRequest {
    code: string;
    type: string;
}

const url = "/api/base-tests";

/**
 * Create a new base test
 * POST /api/base-tests
 */
export const createBaseTest = async (data: BaseTestRequest): Promise<BaseTest> => {
    console.log("Creating base test with data:", data);
    const response = await api.post<BaseTest>(url, data);
    return response.data;
};

/**
 * Get all base tests
 * GET /api/base-tests
 */
export const getAllBaseTests = async (): Promise<BaseTest[]> => {
    const response = await api.get<BaseTest[]>(url);
    return response.data;
};
