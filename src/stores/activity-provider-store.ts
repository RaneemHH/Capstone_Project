import { create } from 'zustand';
import type { 
    ActivityProviderResponse, 
    ActivityProviderRequestResponse 
} from '@/types/activity-provider';
import { activityProviderService } from '@/services/activity-provider-service';

interface ActivityProviderStore {
    // Owner's providers
    ownerProviders: ActivityProviderResponse[];
    isLoadingOwnerProviders: boolean;
    
    // Provider requests mapped by providerId
    providerRequests: Map<number, ActivityProviderRequestResponse[]>;
    isLoadingRequests: boolean;
    
    // All active providers (for selection)
    allProviders: ActivityProviderResponse[];
    isLoadingAllProviders: boolean;
    
    // Actions
    fetchProvidersByOwnerId: (ownerId: number) => Promise<void>;
    fetchRequestsByProviderId: (providerId: number) => Promise<void>;
    fetchRequestsByExhibition: (exhibitionId: number) => Promise<void>;
    fetchAllActiveProviders: () => Promise<void>;
    clearStore: () => void;
}

export const useActivityProviderStore = create<ActivityProviderStore>((set, get) => ({
    ownerProviders: [],
    isLoadingOwnerProviders: false,
    
    providerRequests: new Map(),
    isLoadingRequests: false,
    
    allProviders: [],
    isLoadingAllProviders: false,
    
    fetchProvidersByOwnerId: async (ownerId: number) => {
        set({ isLoadingOwnerProviders: true });
        try {
            const providers = await activityProviderService.getProvidersByOwnerId(ownerId);
            set({ ownerProviders: providers });
        } catch (error) {
            console.error('Failed to fetch providers by owner:', error);
            set({ ownerProviders: [] });
        } finally {
            set({ isLoadingOwnerProviders: false });
        }
    },
    
    fetchRequestsByProviderId: async (providerId: number) => {
        set({ isLoadingRequests: true });
        try {
            const requests = await activityProviderService.getRequestsByProviderId(providerId);
            const currentRequests = new Map(get().providerRequests);
            currentRequests.set(providerId, requests);
            set({ providerRequests: currentRequests });
        } catch (error) {
            console.error('Failed to fetch requests by provider:', error);
        } finally {
            set({ isLoadingRequests: false });
        }
    },
    
    fetchRequestsByExhibition: async (exhibitionId: number) => {
        set({ isLoadingRequests: true });
        try {
            const requests = await activityProviderService.getRequestsByExhibition(exhibitionId);
            // Group by providerId
            const requestsMap = new Map<number, ActivityProviderRequestResponse[]>();
            requests.forEach(request => {
                const existing = requestsMap.get(request.providerId) || [];
                requestsMap.set(request.providerId, [...existing, request]);
            });
            set({ providerRequests: requestsMap });
        } catch (error) {
            console.error('Failed to fetch requests by exhibition:', error);
        } finally {
            set({ isLoadingRequests: false });
        }
    },
    
    fetchAllActiveProviders: async () => {
        set({ isLoadingAllProviders: true });
        try {
            const providers = await activityProviderService.getAllActiveProviders();
            set({ allProviders: providers });
        } catch (error) {
            console.error('Failed to fetch all providers:', error);
            set({ allProviders: [] });
        } finally {
            set({ isLoadingAllProviders: false });
        }
    },
    
    clearStore: () => {
        set({
            ownerProviders: [],
            providerRequests: new Map(),
            allProviders: [],
            isLoadingOwnerProviders: false,
            isLoadingRequests: false,
            isLoadingAllProviders: false
        });
    }
}));
