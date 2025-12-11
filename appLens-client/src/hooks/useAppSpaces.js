// AppSpaces hooks using React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/apiClient';

/**
 * Hook to fetch all AppSpaces
 * GET /api/appspaces
 */
export function useAppSpaces() {
  return useQuery({
    queryKey: ['appSpaces'],
    queryFn: () => api.get('/api/appspaces'),
  });
}

/**
 * Hook to create a new AppSpace
 * POST /api/appspaces
 * Invalidates ['appSpaces'] query on success
 */
export function useCreateAppSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, description }) => 
      api.post('/api/appspaces', { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSpaces'] });
    },
  });
}

/**
 * Hook to update an AppSpace
 * PUT /api/appspaces/:id
 */
export function useUpdateAppSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, description }) => 
      api.put(`/api/appspaces/${id}`, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSpaces'] });
    },
  });
}

/**
 * Hook to delete an AppSpace
 * DELETE /api/appspaces/:id
 */
export function useDeleteAppSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`/api/appspaces/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSpaces'] });
    },
  });
}

export default useAppSpaces;
