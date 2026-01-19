import { create } from 'zustand';
import type { BaseTest } from '@/services/base-test-service';

interface BaseTestsState {
  baseTests: BaseTest[];
  isLoading: boolean;
  error: string | null;
  setBaseTests: (tests: BaseTest[]) => void;
  addBaseTest: (test: BaseTest) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBaseTestsStore = create<BaseTestsState>((set) => ({
  baseTests: [],
  isLoading: false,
  error: null,
  setBaseTests: (tests) => set({ baseTests: tests }),
  addBaseTest: (test) => set((state) => ({ baseTests: [...state.baseTests, test] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
