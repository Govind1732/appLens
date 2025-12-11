// AI Insights hooks using React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/apiClient';

// ============================================================================
// DATASET SUMMARY HOOKS (Generation + Retrieval)
// ============================================================================

/**
 * Hook to generate AI summary for a dataset
 * POST /api/insights/summary/:datasetId
 * This triggers AI generation and saves the result to the database
 */
export function useGenerateSummary(datasetId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post(`/api/insights/summary/${datasetId}`, {}),

    // Invalidate related queries upon successful generation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summaryInsight', datasetId] });
      queryClient.invalidateQueries({ queryKey: ['datasetInsights', datasetId] });
      queryClient.invalidateQueries({ queryKey: ['chartSuggestions', datasetId] });
    },
  });
}

/**
 * Hook to retrieve stored AI summary insight for a dataset
 * GET /api/insights/insights/:datasetId?type=summary
 * This reads the cached/saved summary from the database
 * 
 * Normalizes response into consistent shape:
 * { summary, insights[], trendSummaries[], chartSuggestions[] }
 */
export function useSummaryInsight(datasetId) {
  return useQuery({
    queryKey: ['summaryInsight', datasetId],
    queryFn: async () => {
      try {
        // api.get() already returns response.data (unwrapped JSON)
        const data = await api.get(`/api/insights/insights/${datasetId}?type=summary`);

        // Debug: Log raw API response
        console.debug('[useSummaryInsight] Raw API data:', data);

        // Handle empty or 404 responses
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.debug('[useSummaryInsight] No summary data found');
          return null;
        }

        // Get the most recent insight (API returns array sorted by createdAt desc)
        const rawInsight = Array.isArray(data) ? data[0] : data;

        // Also check for { insight: {...} } wrapper format
        const insight = rawInsight.insight || rawInsight;

        console.debug('[useSummaryInsight] Raw insight object:', insight);

        // Normalize into consistent shape, handling all possible response formats
        const normalized = {
          // Main summary text
          summary: insight.summary || insight.responseText || '',

          // Insights array - check multiple possible locations
          insights: insight.structuredData?.insights
            || insight.insights
            || [],

          // Trend summaries - check multiple possible locations
          trendSummaries: insight.structuredData?.trendSummaries
            || insight.trendSummaries
            || [],

          // Chart suggestions - at root level in most responses
          chartSuggestions: insight.chartSuggestions || [],

          // Keep original metadata
          _id: insight._id,
          createdAt: insight.createdAt,
          type: insight.type,
        };

        console.debug('[useSummaryInsight] Normalized data:', normalized);

        return normalized;
      } catch (error) {
        // Return null on 404 or other errors (no summary exists yet)
        if (error.response?.status === 404) {
          console.debug('[useSummaryInsight] 404 - No summary exists');
          return null;
        }
        console.error('[useSummaryInsight] Error fetching summary:', error);
        throw error;
      }
    },
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (AI responses are expensive)
  });
}

// ============================================================================
// CHART SUGGESTIONS HOOKS (Generation + Retrieval)
// ============================================================================

/**
 * Hook to retrieve stored chart suggestions for a dataset
 * GET /api/insights/chart-suggestions/:datasetId
 */
export function useChartSuggestions(datasetId) {
  return useQuery({
    queryKey: ['chartSuggestions', datasetId],
    queryFn: () => api.get(`/api/insights/chart-suggestions/${datasetId}`),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to generate new chart suggestions based on schema
 * POST /api/insights/generate-chart-suggestions/:datasetId
 * This triggers chart generation and saves to the database
 */
export function useGenerateChartSuggestions(datasetId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post(`/api/insights/generate-chart-suggestions/${datasetId}`, {}),

    // Invalidate the chart suggestions query upon successful generation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chartSuggestions', datasetId] });
      // Invalidate the summary query key as well, since chart suggestions are part of the summary type
      queryClient.invalidateQueries({ queryKey: ['summaryInsight', datasetId] });
      // Invalidate general insights list
      queryClient.invalidateQueries({ queryKey: ['datasetInsights', datasetId] });
    },
  });
}

// ============================================================================
// AI CHAT HOOKS
// ============================================================================

/**
 * Hook to chat with AI about a dataset
 * POST /api/insights/chat/:datasetId
 */
export function useAIChat(datasetId) {
  const queryClient = useQueryClient();

  return useMutation({
    // Using destructuring is cleaner - accepts question and optional chatHistory
    mutationFn: ({ question }) =>
      api.post(`/api/insights/chat/${datasetId}`, { question }),

    // Invalidate chat history when new message is sent
    onSuccess: () => {
      // Invalidate the query that fetches ALL insights (which includes the new chat message)
      queryClient.invalidateQueries({ queryKey: ['datasetInsights', datasetId] });
      // If you have a dedicated chat history hook, invalidate that too:
      queryClient.invalidateQueries({ queryKey: ['chatHistory', datasetId] });
    },
  });
}

// ============================================================================
// ALL INSIGHTS HOOK (Both Summary + Chat)
// ============================================================================

/**
 * Hook to get all AI insights for a dataset
 * GET /api/insights/insights/:datasetId
 * Returns both summary and chat type insights
 */
export function useDatasetInsights(datasetId, type = null) {
  return useQuery({
    queryKey: ['datasetInsights', datasetId, type],
    queryFn: () => {
      const url = type
        ? `/api/insights/insights/${datasetId}?type=${type}`
        : `/api/insights/insights/${datasetId}`;
      return api.get(url);
    },
    enabled: !!datasetId,
  });
}

// ============================================================================
// LEGACY EXPORT (For backwards compatibility)
// ============================================================================

/**
 * @deprecated Use useGenerateSummary() for generation or useSummaryInsight() for retrieval
 * Hook to get AI-generated summary for a dataset
 * POST /api/insights/summary/:datasetId
 */
export function useDatasetSummary(datasetId) {
  return useMutation({
    mutationFn: () => api.post(`/api/insights/summary/${datasetId}`, {}),
  });
}

export default useGenerateSummary;

