// Analytics Overview hook using React Query
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api/apiClient';

/**
 * Hook to fetch analytics overview for an AppSpace
 * GET /api/analytics/overview?appSpaceId=<id>
 * 
 * @param {string} appSpaceId - The ID of the app space
 * @returns {object} { data, isLoading, isError, refetch }
 */
export function useAnalyticsOverview(appSpaceId) {
  return useQuery({
    queryKey: ['analyticsOverview', appSpaceId],
    queryFn: () => apiRequest(`/api/analytics/overview?appSpaceId=${appSpaceId}`),
    enabled: !!appSpaceId, // Only fetch when appSpaceId is provided
  });
}
