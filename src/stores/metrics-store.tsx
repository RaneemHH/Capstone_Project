import { create } from 'zustand';
import type { MetricResponse } from '@/services/metric-service';

interface MetricsState {
  metrics: MetricResponse[];
  isLoading: boolean;
  error: string | null;
  setMetrics: (metrics: MetricResponse[]) => void;
  addMetric: (metric: MetricResponse) => void;
  updateMetricInStore: (metric: MetricResponse) => void;
  removeMetric: (metricId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  metrics: [],
  isLoading: false,
  error: null,
  setMetrics: (metrics) => set({ metrics }),
  addMetric: (metric) => set((state) => ({ metrics: [...state.metrics, metric] })),
  updateMetricInStore: (metric) => set((state) => ({
    metrics: state.metrics.map((m) => (m.id === metric.id ? metric : m))
  })),
  removeMetric: (metricId) => set((state) => ({
    metrics: state.metrics.filter((m) => m.id !== metricId)
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
