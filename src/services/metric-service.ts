import { api } from "@/api/axios";

// Types matching the Java MetricResponse DTO
export interface MetricResponse {
    id: number;
    code: string;
    label: string;
    description: string;
    baseTestId: number;
    baseTestCode: string;
}

// Types matching the Java MetricRequest DTO
export interface MetricRequest {
    code: string;
    label: string;
    description?: string;
    baseTestId?: number;
}

const url = "/api/metrics";

// /**
//  * Create a new metric
//  * POST /api/metrics
//  * @requires ADMIN role
//  */
export const createMetric = async (data: MetricRequest): Promise<MetricResponse> => {
    const response = await api.post<MetricResponse>(url, data);
    return response.data;
};

/**
 * Get all metrics
 * GET /api/metrics
 */
export const getAllMetrics = async (): Promise<MetricResponse[]> => {
    const response = await api.get<MetricResponse[]>(url);
    return response.data;
};

/**
 * Get metrics by base test ID
 * GET /api/metrics/base-test/{baseTestId}
 */
export const getMetricsByBaseTestId = async (baseTestId: number): Promise<MetricResponse[]> => {
    const response = await api.get<MetricResponse[]>(`${url}/base-test/${baseTestId}`);
    return response.data;
};

/**
 * Get metric by ID
 * GET /api/metrics/{id}
 */
export const getMetricById = async (id: number): Promise<MetricResponse> => {
    const response = await api.get<MetricResponse>(`${url}/${id}`);
    return response.data;
};

/**
 * Update a metric
 * PATCH /api/metrics/{id}
 * @requires ADMIN role
 */
export const updateMetric = async (id: number, data: MetricRequest): Promise<MetricResponse> => {
    const response = await api.patch<MetricResponse>(`${url}/${id}`, data);
    return response.data;
};

/**
 * Delete a metric
 * DELETE /api/metrics/{id}
 * @requires ADMIN role
 */
export const deleteMetric = async (id: number): Promise<string> => {
    const response = await api.delete<string>(`${url}/${id}`);
    return response.data;
};
