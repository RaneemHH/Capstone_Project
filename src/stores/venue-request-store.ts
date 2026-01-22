import { create } from 'zustand';
import { venueRequestService } from '@/services/venue-request-service';
import { municipalityService } from '@/services/municipalityService';
import type { VenueRequestResponse } from '@/types/municipality';
import { toast } from "sonner";

interface VenueRequestStore {
    venueRequests: VenueRequestResponse[];
    isLoading: boolean;
    error: string | null;
    fetchVenueRequests: (exhibitionId: number) => Promise<void>;
    clearVenueRequests: () => void;
    reviewVenueRequest: (requestId: number, approve: boolean, responseText: string) => Promise<void>;
}

export const useVenueRequestStore = create<VenueRequestStore>((set, get) => ({
    venueRequests: [],
    isLoading: false,
    error: null,

    fetchVenueRequests: async (exhibitionId: number) => {
        set({ isLoading: true, error: null });
        try {
            const requests = await venueRequestService.getRequestsForVenue(exhibitionId);
            set({ venueRequests: requests, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch venue requests:', error);
            set({
                error: error instanceof Error ? error.message : 'فشل في تحميل طلبات الأماكن',
                isLoading: false
            });
        }
    },

    reviewVenueRequest: async (requestId: number, approve: boolean, responseText: string) => {
        try {
            const updatedRequest = await municipalityService.reviewVenueRequest(requestId, approve, responseText);

            // Update the request in the local state
            set((state) => ({
                venueRequests: state.venueRequests.map((req) =>
                    req.id === requestId ? updatedRequest : req
                )
            }));

            toast.success(approve ? "تم قبول الطلب بنجاح" : "تم رفض الطلب بنجاح");
        } catch (error) {
            console.error('Failed to review venue request:', error);
            toast.error("حدث خطأ أثناء معالجة الطلب");
            throw error;
        }
    },

    clearVenueRequests: () => {
        set({ venueRequests: [], error: null });
    },
}));
