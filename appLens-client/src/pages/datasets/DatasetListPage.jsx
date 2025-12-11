// DatasetListPage - Main "Data Sources" screen for an AppSpace
import { useRef, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDatasets, useUploadDataset, useConnectDatabase, useDeleteDataset } from '../../hooks/useDatasets';

function DatasetListPage() {
  const { appSpaceId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { data: datasets = [], isLoading, isError } = useDatasets(appSpaceId);
  const uploadMutation = useUploadDataset(appSpaceId);
  const connectDbMutation = useConnectDatabase(appSpaceId);
  const deleteMutation = useDeleteDataset(appSpaceId);

  // Connect Database modal state
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [dbType, setDbType] = useState('postgresql');
  const [form, setForm] = useState({
    name: '',
    host: '',
    port: '',
    database: '',
    user: '',
    password: '',
    table: '',
    uri: '',
    collection: ''
  });

  // Filter state
  const [filter, setFilter] = useState('all'); // 'all', 'files', 'databases'

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filtered datasets based on active filter
  const filteredDatasets = useMemo(() => {
    if (filter === 'files') {
      return datasets.filter(ds => ['csv', 'json', 'xlsx'].includes(ds.sourceType));
    }
    if (filter === 'databases') {
      return datasets.filter(ds => ['postgresql', 'mysql', 'mongodb'].includes(ds.sourceType));
    }
    return datasets;
  }, [datasets, filter]);

  // Handle file upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file, {
        onSuccess: () => {
          // Reset input so same file can be uploaded again
          e.target.value = '';
        }
      });
    }
  };

  // Handle database connection
  const handleConnectDatabase = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      sourceType: dbType,
      connectionDetails:
        dbType === 'mongodb'
          ? { uri: form.uri, database: form.database, collection: form.collection }
          : {
            host: form.host,
            port: Number(form.port) || undefined,
            database: form.database,
            user: form.user,
            password: form.password,
            table: form.table
          }
    };

    connectDbMutation.mutate(payload, {
      onSuccess: () => {
        // Close modal and reset form
        setIsConnectOpen(false);
        setForm({
          name: '',
          host: '',
          port: '',
          database: '',
          user: '',
          password: '',
          table: '',
          uri: '',
          collection: ''
        });
        setDbType('postgresql');
      }
    });
  };

  // Handle dataset click
  const handleDatasetClick = (datasetId) => {
    navigate(`/datasets/${datasetId}`);
  };

  // Handle delete
  const handleDeleteClick = (e, dataset) => {
    e.stopPropagation();
    setDeleteConfirm(dataset);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm._id, {
        onSuccess: () => {
          setDeleteConfirm(null);
        }
      });
    }
  };

  const getSourceTypeIcon = (sourceType) => {
    switch (sourceType) {
      case 'csv':
        return (
          <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
            <span className="text-green-400 text-xs font-bold">CSV</span>
          </div>
        );
      case 'json':
        return (
          <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center">
            <span className="text-yellow-400 text-xs font-bold">JSON</span>
          </div>
        );
      case 'xlsx':
        return (
          <div className="w-8 h-8 bg-teal-600/20 rounded-lg flex items-center justify-center">
            <span className="text-teal-400 text-xs font-bold">XLSX</span>
          </div>
        );
      case 'postgresql':
        return (
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <span className="text-blue-400 text-xs font-bold">PG</span>
          </div>
        );
      case 'mysql':
        return (
          <div className="w-8 h-8 bg-orange-600/20 rounded-lg flex items-center justify-center">
            <span className="text-orange-400 text-xs font-bold">SQL</span>
          </div>
        );
      case 'mongodb':
        return (
          <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
            <span className="text-emerald-400 text-xs font-bold">MDB</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-600 dark:text-slate-400 text-xs font-bold">?</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/app-spaces')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white mb-2 transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to App Spaces
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Data Sources</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Upload files or connect databases</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsConnectOpen(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            Connect Database
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUploadClick}
            disabled={uploadMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-600 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition flex items-center gap-2 cursor-pointer"
          >
            {uploadMutation.isPending ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload CSV / JSON / XLSX
              </>
            )}
          </motion.button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.json,.xlsx"
          className="hidden"
        />
      </div>

      {/* Upload Error */}
      {uploadMutation.isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3"
        >
          <p className="text-red-400">
            {uploadMutation.error?.response?.data?.error || uploadMutation.error?.message || 'Failed to upload file. Please try again.'}
          </p>
        </motion.div>
      )}

      {/* Upload Success */}
      {uploadMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/50 rounded-lg px-4 py-3"
        >
          <p className="text-green-400">File uploaded successfully!</p>
        </motion.div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3">
          <p className="text-red-400">Failed to load datasets. Please try again.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-300 dark:border-slate-700 last:border-b-0">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && datasets.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Datasets Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Upload a file or connect a database to get started</p>
          {/* <div className="flex items-center gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUploadClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-600 text-white font-medium rounded-lg transition cursor-pointer"
              >
                Upload CSV / JSON / XLSX
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsConnectOpen(true)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition cursor-pointer"
              >
                Connect Database
              </motion.button>
            </div> */}
        </div>
      )}

      {/* Filter Chips */}
      {!isLoading && !isError && datasets.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'
              }`}
          >
            All ({datasets.length})
          </button>
          <button
            onClick={() => setFilter('files')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${filter === 'files'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'
              }`}
          >
            Files ({datasets.filter(ds => ['csv', 'json', 'xlsx'].includes(ds.sourceType)).length})
          </button>
          <button
            onClick={() => setFilter('databases')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${filter === 'databases'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'
              }`}
          >
            Databases ({datasets.filter(ds => ['postgresql', 'mysql', 'mongodb'].includes(ds.sourceType)).length})
          </button>
        </div>
      )}

      {/* Datasets Table */}
      {!isLoading && !isError && filteredDatasets.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Source Type</div>
              <div className="col-span-2">Records</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            {filteredDatasets.map((dataset) => (
              <motion.div
                key={dataset._id}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                onClick={() => handleDatasetClick(dataset._id)}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-300 dark:border-slate-700 last:border-b-0 cursor-pointer transition group"
              >
                <div className="col-span-5 flex items-center gap-3">
                  {getSourceTypeIcon(dataset.sourceType)}
                  <span className="text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:hover:text-blue-400 transition">
                    {dataset.name}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-slate-600 dark:text-slate-400 capitalize">{dataset.sourceType}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    {dataset.recordsCount?.toLocaleString() || '-'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">
                    {new Date(dataset.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => handleDeleteClick(e, dataset)}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                    title="Delete dataset"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Connect Database Modal */}
      <AnimatePresence>
        {isConnectOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsConnectOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Connect Database</h2>
                <button
                  onClick={() => setIsConnectOpen(false)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleConnectDatabase} className="space-y-4">
                {/* Connection Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Connection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Production Database"
                  />
                </div>

                {/* Database Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Database Type *
                  </label>
                  <select
                    value={dbType}
                    onChange={(e) => setDbType(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>

                {/* PostgreSQL / MySQL Fields */}
                {(dbType === 'postgresql' || dbType === 'mysql') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                          Host *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.host}
                          onChange={(e) => setForm({ ...form, host: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="localhost"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                          Port
                        </label>
                        <input
                          type="number"
                          value={form.port}
                          onChange={(e) => setForm({ ...form, port: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={dbType === 'postgresql' ? '5432' : '3306'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Database *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.database}
                        onChange={(e) => setForm({ ...form, database: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="myapp_db"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                          User *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.user}
                          onChange={(e) => setForm({ ...form, user: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="postgres"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Table *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.table}
                        onChange={(e) => setForm({ ...form, table: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="users"
                      />
                    </div>
                  </>
                )}

                {/* MongoDB Fields */}
                {dbType === 'mongodb' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Connection URI *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.uri}
                        onChange={(e) => setForm({ ...form, uri: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="mongodb://localhost:27017"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Database *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.database}
                        onChange={(e) => setForm({ ...form, database: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="myapp_db"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                        Collection *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.collection}
                        onChange={(e) => setForm({ ...form, collection: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="users"
                      />
                    </div>
                  </>
                )}

                {/* Connection Error */}
                {connectDbMutation.isError && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3">
                    <p className="text-red-400 text-sm">
                      {connectDbMutation.error?.response?.data?.error || connectDbMutation.error?.message || 'Failed to connect. Please check your credentials.'}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsConnectOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={connectDbMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-600 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition cursor-pointer"
                  >
                    {connectDbMutation.isPending ? 'Connecting...' : 'Connect Database'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Dataset?</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Are you sure you want to delete <span className="text-slate-900 dark:text-white font-medium">"{deleteConfirm.name}"</span>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition cursor-pointer"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DatasetListPage;
