// AppSpaceListPage - List and create app spaces
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FolderOpen, Database, BarChart3, ChevronRight, X, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { useAppSpaces, useCreateAppSpace, useUpdateAppSpace, useDeleteAppSpace } from '../../hooks/useAppSpaces';
import { api } from '../../api/apiClient';
import PageSkeleton from '../../components/common/Skeleton';

function AppSpaceListPage() {
  const navigate = useNavigate();
  const { data: appSpaces, isLoading, isError } = useAppSpaces();
  const createMutation = useCreateAppSpace();
  const updateMutation = useUpdateAppSpace();
  const deleteMutation = useDeleteAppSpace();

  // Fetch datasets per app space to compute counts client-side
  const datasetQueries = useQueries({
    queries: (appSpaces || []).map((space) => ({
      queryKey: ['datasets', space._id],
      queryFn: () => api.get(`/api/datasets?appSpaceId=${space._id}`),
      enabled: !!space?._id,
    })),
  });

  const datasetsCountMap = useMemo(() => {
    const map = {};
    datasetQueries.forEach((q, idx) => {
      const spaceId = appSpaces?.[idx]?._id;
      if (!spaceId) return;
      map[spaceId] = q.data?.length || 0;
    });
    return map;
  }, [datasetQueries, appSpaces]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppSpace, setSelectedAppSpace] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showDeleteToast, setShowDeleteToast] = useState(false);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(
      { name, description },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setName('');
          setDescription('');
        },
      }
    );
  };

  const handleEditClick = (e, space) => {
    e.stopPropagation();
    setSelectedAppSpace(space);
    setName(space.name);
    setDescription(space.description || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(
      { id: selectedAppSpace._id, name, description },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedAppSpace(null);
          setName('');
          setDescription('');
        },
      }
    );
  };

  const handleDeleteClick = (e, space) => {
    e.stopPropagation();
    setSelectedAppSpace(space);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(selectedAppSpace._id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedAppSpace(null);
        setShowDeleteToast(true);
        setTimeout(() => setShowDeleteToast(false), 3000);
      },
    });
  };

  const handleCardClick = (id) => {
    navigate(`/app-spaces/${id}/datasets`);
  };
  console.log('appSpaces:', appSpaces);
  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">App Spaces</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {appSpaces?.length || 0} workspace{appSpaces?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-glow cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            New App Space
          </motion.button>
        </div>

        {/* Loading State */}
        {isLoading && <PageSkeleton type="cards" count={6} />}

        {/* Error State */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
          >
            <p className="text-red-400">Failed to load app spaces. Please try again.</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && appSpaces?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl"
          >
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No App Spaces Yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first app space to start analyzing data</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-glow cursor-pointer"
            >
              Create App Space
            </motion.button>
          </motion.div>
        )}

        {/* App Spaces Grid */}
        {!isLoading && !isError && appSpaces?.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {appSpaces.map((space, index) => (
              <motion.div
                key={space._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-card-hover transition-all duration-300 group relative"
              >
                {/* Edit & Delete Icons - Top Right */}
                <div className="absolute top-4 right-12 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleEditClick(e, space)}
                    title="Edit app space"
                    className="p-2 cursor-pointer text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <Pencil className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleDeleteClick(e, space)}
                    title="Delete app space"
                    className="p-2 cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Card Header */}
                <div
                  onClick={() => handleCardClick(space._id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      className="w-12 h-12 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/20"
                    >
                      <FolderOpen className="w-6 h-6 text-blue-400" />
                    </motion.div>
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {space.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {space.description || ''}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      {datasetsCountMap[space._id] ?? space.datasetsCount ?? 0} datasets
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">New App Space</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="space-name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="space-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Sales Dashboard"
                      required
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="space-description" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Description
                    </label>
                    <textarea
                      id="space-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this app space for?"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  {createMutation.isError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                    >
                      <p className="text-red-400 text-sm">
                        {createMutation.error?.message || 'Failed to create app space.'}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={createMutation.isPending}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                    >
                      {createMutation.isPending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Creating...
                        </>
                      ) : (
                        'Create'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Edit App Space</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="edit-space-name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="edit-space-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Sales Dashboard"
                      required
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-space-description" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Description
                    </label>
                    <textarea
                      id="edit-space-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this app space for?"
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  {updateMutation.isError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
                    >
                      <p className="text-red-400 text-sm">
                        {updateMutation.error?.message || 'Failed to update app space.'}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-glow cursor-pointer"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Updating...
                        </>
                      ) : (
                        'Update'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Delete App Space?</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">"{selectedAppSpace?.name}"</span>? This action cannot be undone.
                </p>

                {deleteMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4"
                  >
                    <p className="text-red-400 text-sm">
                      {deleteMutation.error?.message || 'Failed to delete app space.'}
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleteMutation.isPending}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Success Toast */}
      <AnimatePresence>
        {showDeleteToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-3"
          >
            <p className="text-green-400 font-medium">App space deleted successfully.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AppSpaceListPage;
