// ============================================================================
// Dataset Hooks using React Query
// ============================================================================
// Backend Routes:
// - GET    /api/datasets?appSpaceId=...      → Array of Datasets for appSpace
// - POST   /api/datasets/upload              → Multipart upload (file, appSpaceId, name)
// - POST   /api/datasets/connect             → Connect external DB (PostgreSQL/MySQL/MongoDB)
// - GET    /api/datasets/:id                 → Single dataset with populated appSpaceId
// - GET    /api/datasets/:id/data?limit=X    → Sample rows from file or external DB
// - DELETE /api/datasets/:id                 → Delete dataset and associated file
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiRequest } from '../api/apiClient';

// ============================================================================
// RETRIEVAL HOOKS (Queries)
// ============================================================================

/**
 * Hook to fetch all datasets for an AppSpace
 * GET /api/datasets?appSpaceId=<id>
 * 
 * @param {string} appSpaceId - The AppSpace ID
 * @returns {useQuery result} { data: Dataset[], isLoading, isError, error }
 */
export function useDatasets(appSpaceId) {
  return useQuery({
    queryKey: ['datasets', appSpaceId],
    queryFn: () => api.get(`/api/datasets?appSpaceId=${appSpaceId}`),
    enabled: !!appSpaceId,
  });
}

/**
 * Hook to fetch a single dataset by ID
 * GET /api/datasets/:id
 * 
 * @param {string} datasetId - The Dataset ID
 * @returns {useQuery result} { data: Dataset, isLoading, isError, error }
 */
export function useDataset(datasetId) {
  return useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: () => api.get(`/api/datasets/${datasetId}`),
    enabled: !!datasetId,
  });
}

/**
 * Hook to fetch dataset data/rows with pagination
 * GET /api/datasets/:id/data?limit=X&offset=Y
 * 
 * @param {string} datasetId - The Dataset ID
 * @param {Object} options - Pagination options
 * @param {number} options.limit - Number of rows (default: 100)
 * @param {number} options.offset - Number of rows to skip (default: 0)
 * @returns {useQuery result} { data: Object[], isLoading, isError, error }
 */
export function useDatasetData(datasetId, options = {}) {
  const { limit = 100, offset = 0 } = options;
  
  return useQuery({
    queryKey: ['datasetData', datasetId, limit, offset],
    queryFn: () => api.get(`/api/datasets/${datasetId}/data?limit=${limit}&offset=${offset}`),
    enabled: !!datasetId,
  });
}

// ============================================================================
// MUTATION HOOKS (Create, Update, Delete)
// ============================================================================

/**
 * Hook to upload a dataset file
 * POST /api/datasets/upload (multipart/form-data)
 * 
 * @param {string} appSpaceId - The AppSpace ID (used for cache invalidation)
 * @returns {useMutation result} { mutate(file), isPending, isError, error }
 * 
 * Usage:
 *   const uploadDataset = useUploadDataset(appSpaceId);
 *   uploadDataset.mutate(file);
 */
export function useUploadDataset(appSpaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('appSpaceId', appSpaceId);
      formData.append('name', file.name);
      
      // Use apiRequest directly with FormData (Content-Type will be set by browser)
      return apiRequest('/api/datasets/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      // Invalidate datasets list to reflect the newly uploaded dataset
      queryClient.invalidateQueries({ queryKey: ['datasets', appSpaceId] });
    },
  });
}

/**
 * Hook to connect an external database as a dataset
 * POST /api/datasets/connect
 * 
 * @param {string} appSpaceId - The AppSpace ID (used for cache invalidation)
 * @returns {useMutation result} { mutate(connectionData), isPending, isError, error }
 * 
 * Usage:
 *   const connectDatabase = useConnectDatabase(appSpaceId);
 *   connectDatabase.mutate({
 *     name: 'My Database',
 *     sourceType: 'postgresql',
 *     connectionDetails: { host, port, database, user, password, table }
 *   });
 * 
 * Connection Details Format:
 *   - PostgreSQL: { host, port?, database, user, password, table }
 *   - MySQL: { host, port?, database, user, password, table }
 *   - MongoDB: { uri, database, collection }
 */
export function useConnectDatabase(appSpaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionData) => 
      api.post('/api/datasets/connect', { ...connectionData, appSpaceId }),
    onSuccess: () => {
      // Invalidate datasets list to reflect the newly connected database
      queryClient.invalidateQueries({ queryKey: ['datasets', appSpaceId] });
    },
  });
}

/**
 * Hook to delete a dataset
 * DELETE /api/datasets/:id
 * 
 * @param {string} appSpaceId - The AppSpace ID (used for cache invalidation)
 * @returns {useMutation result} { mutate(datasetId), isPending, isError, error }
 * 
 * Usage:
 *   const deleteDataset = useDeleteDataset(appSpaceId);
 *   deleteDataset.mutate(datasetId);
 */
export function useDeleteDataset(appSpaceId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datasetId) => api.delete(`/api/datasets/${datasetId}`),
    onSuccess: () => {
      // Invalidate datasets list to reflect the deletion
      queryClient.invalidateQueries({ queryKey: ['datasets', appSpaceId] });
    },
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useDatasets;
