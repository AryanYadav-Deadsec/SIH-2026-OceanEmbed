import { getBackendUrl } from './backendConfig';

export const api = {
  get baseUrl() {
    return getBackendUrl();
  },

  // Heatmap routes
  heatmapUrl: (date: string, depth: number) =>
    `${getBackendUrl()}/api/heatmap/${date}/${depth}`,

  heatmapJsonUrl: (date: string, depth: number) =>
    `${getBackendUrl()}/api/heatmap/${date}/${depth}/json`,

  heatmapAvailableUrl: () =>
    `${getBackendUrl()}/api/heatmap/available`,

  // Surface & environmental routes
  surfaceUrl: (date: string) =>
    `${getBackendUrl()}/api/surface/${date}`,

  // Cyclone Phase-1 & general prediction
  phase1Url: () =>
    `${getBackendUrl()}/api/cyclone/phase1/predict`,

  predictUrl: () =>
    `${getBackendUrl()}/api/predict`,

  // Health check routes (supports both /health and /api/health)
  healthUrl: () =>
    `${getBackendUrl()}/health`,

  healthApiUrl: () =>
    `${getBackendUrl()}/api/health`,

  // Models, metrics, and reports
  modelsUrl: () =>
    `${getBackendUrl()}/models`,

  metricsSummaryUrl: () =>
    `${getBackendUrl()}/metrics/summary`,

  reportUrl: (name: string) =>
    `${getBackendUrl()}/api/report/${encodeURIComponent(name)}`,

  // Embeddings comparison
  embeddingsCompareUrl: () =>
    `${getBackendUrl()}/api/embeddings/compare`,

  // Model explanation routes
  explainModelUrl: () =>
    `${getBackendUrl()}/explain/model`,

  explainDepthUrl: (depth: number) =>
    `${getBackendUrl()}/explain/depth/${depth}`,

  // AI Assistant Chat route
  chatUrl: () =>
    `${getBackendUrl()}/chat`,
};

export default api;