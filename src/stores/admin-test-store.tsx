import { create } from "zustand";
import type {AdminTest} from "@/data/admin-test-schema.ts"


type AdminTestStore = {
    adminTestResponse: AdminTest | null;
    setAdminTestResponse: (testResponse: AdminTest) => void;
};

export const useAdminTestStore = create<AdminTestStore>((set) => ({
    adminTestResponse: null,
    setAdminTestResponse: (testResponse) => set({ adminTestResponse: testResponse }),
}));
