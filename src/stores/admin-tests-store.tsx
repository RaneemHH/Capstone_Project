import { create } from "zustand";
import type {AdminTest} from "@/data/admin-test-schema.ts"


type AdminTestsStore = {
    adminTestsResponse: AdminTest[];
    setAdminTestsResponse: (testsResponse: AdminTest[]) => void;
};

export const useAdminTestsStore = create<AdminTestsStore>((set) => ({
    adminTestsResponse: [],
    setAdminTestsResponse: (testsResponse) => set({ adminTestsResponse: testsResponse }),
}));
