import { create } from "zustand";
import type {UserTest} from "@/data/user-test-schema.ts";



type UserTestStore = {
    userTestResponse: UserTest | null;
    setUserTestResponse: (testResponse: UserTest) => void;
};

export const useUserTestStore = create<UserTestStore>((set) => ({
    userTestResponse: null,
    setUserTestResponse: (testResponse) => set({ userTestResponse: testResponse }),
}));
