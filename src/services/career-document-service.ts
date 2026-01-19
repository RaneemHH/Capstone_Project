import { api } from "@/api/axios";


export interface CareerDocumentResponse {
    id: number;
    originalFilename: string;
    fileType: string;
    fileSize: number;
    baseTestId?: number;
    baseTestCode?: string;
    uploadedAt: string;
    uploadedBy: string;
    indexed: boolean;
    description?: string;
}


export const uploadDocument = async (
    file: File,
    baseTestId?: number,
    description?: string
): Promise<CareerDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (baseTestId) {
        formData.append('baseTestId', baseTestId.toString());
    }
    
    if (description) {
        formData.append('description', description);
    }

    const response = await api.post('/api/admin/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.document;
};


export const getDocumentsByBaseTest = async (
    baseTestId: number
): Promise<CareerDocumentResponse[]> => {
    const response = await api.get(`/api/admin/documents/base-test/${baseTestId}`);
    return response.data;
};


export const getDocument = async (id: number): Promise<CareerDocumentResponse> => {
    const response = await api.get(`/api/admin/documents/${id}`);
    return response.data;
};


export const deleteDocument = async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/admin/documents/${id}`);
    return response.data;
};




