import { api } from '@/api/axios';
import type { ExhibitionFinancialResponse } from '@/types/exhibition';

class ExhibitionFinanceService {
    // ----------------- Calculate/Recalculate Financials -----------------
    async calculateFinancials(exhibitionId: number): Promise<ExhibitionFinancialResponse> {
        const response = await api.post<ExhibitionFinancialResponse>(
            `/api/exhibitions/${exhibitionId}/calculate-financials`
        );
        return response.data;
    }

    // ----------------- Get Financial Report -----------------
    async getFinancialReport(exhibitionId: number): Promise<ExhibitionFinancialResponse> {
        const response = await api.get<ExhibitionFinancialResponse>(
            `/api/exhibitions/${exhibitionId}/financial-report`
        );
        return response.data;
    }
}

// Export singleton instance
export const exhibitionFinanceService = new ExhibitionFinanceService();
