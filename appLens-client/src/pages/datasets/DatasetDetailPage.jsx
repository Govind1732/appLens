// DatasetDetailPage - View dataset details, charts, and AI insights
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDataset, useDatasetData } from '../../hooks/useDatasets';
import { useGenerateSummary, useSummaryInsight } from '../../hooks/useAIChat';
import SimpleChart from '../../components/charts/SimpleChart';

function DatasetDetailPage() {
  const { datasetId } = useParams();
  const navigate = useNavigate();

  const { data: dataset, isLoading: datasetLoading, isError: datasetError } = useDataset(datasetId);
  const { data: datasetData, isLoading: dataLoading, isError: dataError } = useDatasetData(datasetId, { limit: 1000 });

  // Use dedicated hooks: generation (mutation) and retrieval (query)
  const { mutate: triggerGenerate, isPending: isGenerating, isError: generationError } = useGenerateSummary(datasetId);
  const { data: summaryInsight, isLoading: summaryLoading } = useSummaryInsight(datasetId);

  // Debug: Log the normalized data from hook
  console.log('summaryInsight from hook:', summaryInsight);

  // The useSummaryInsight hook returns normalized data directly
  const aiSummary = useMemo(() => {
    if (!summaryInsight) return null;
    return {
      summary: summaryInsight.summary || '',
      insights: summaryInsight.insights || [],
      trendSummaries: summaryInsight.trendSummaries || [],
      chartSuggestions: summaryInsight.chartSuggestions || [],
    };
  }, [summaryInsight]);

  // Combined loading state and data availability - check for meaningful content
  const hasSummaryData = !!aiSummary && (!!aiSummary.summary || aiSummary.insights.length > 0 || aiSummary.trendSummaries.length > 0);
  const showLoader = summaryLoading || isGenerating;

  const [activeTab, setActiveTab] = useState('data');
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    xField: '',
    yField: '',
  });
  const [showChart, setShowChart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState('all');
  const [expandedSections, setExpandedSections] = useState({ summary: true, insights: true, trends: true });
  const pageSize = 10;

  // Memoized computed values for performance
  const schema = useMemo(() => dataset?.schema || [], [dataset]);
  const sampleRows = useMemo(() => datasetData?.data || datasetData || [], [datasetData]);
  const numericFields = useMemo(() =>
    schema.filter((f) => ['integer', 'float', 'number'].includes(f.type?.toLowerCase())),
    [schema]
  );

  // Pagination calculations
  const { totalRows, totalPages, startIndex, endIndex, paginatedRows } = useMemo(() => {
    const total = sampleRows.length;
    const pages = Math.ceil(total / pageSize) || 1;
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    return {
      totalRows: total,
      totalPages: pages,
      startIndex: start,
      endIndex: end,
      paginatedRows: sampleRows.slice(start, end),
    };
  }, [sampleRows, currentPage, pageSize]);

  const handleGenerateChart = () => {
    if (chartConfig.xField && chartConfig.yField) {
      setShowChart(true);
    }
  };

  const handleResetChart = () => {
    setChartConfig({ type: 'bar', xField: '', yField: '' });
    setShowChart(false);
    setCategoryLimit('all');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add toast notification here
    });
  };

  const exportToCSV = () => {
    if (!sampleRows.length || !schema.length) return;

    const headers = schema.map(col => col.field);
    const csvRows = [
      headers.join(','),
      ...sampleRows.map(row =>
        headers.map(h => {
          const val = row[h]?.toString() ?? '';
          // Escape quotes and wrap in quotes if contains comma
          return val.includes(',') || val.includes('"')
            ? `"${val.replace(/"/g, '""')}"`
            : val;
        }).join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset?.name || 'dataset'}_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'data', label: 'Data & Charts' },
    { id: 'ai', label: 'AI Insights' },
  ];

  if (datasetLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading dataset...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white mb-2 transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Datasets
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{dataset?.name || 'Dataset'}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {dataset?.recordsCount?.toLocaleString() || 0} records • {schema.length} columns • {dataset?.sourceType?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition cursor-pointer ${activeTab === tab.id
              ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data & Charts Tab */}
      {activeTab === 'data' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-300 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Sample Data</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {totalRows} rows • {schema.length} columns
              </p>
            </div>

            {dataLoading ? (
              <div className="p-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-slate-100 dark:bg-slate-900 rounded mb-2"></div>
                ))}
              </div>
            ) : sampleRows.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-max w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-900/50">
                        {schema.map((col) => (
                          <th key={col.field} className="px-4 py-2 text-left text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                            {col.field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, idx) => (
                        <tr key={idx} className="border-t border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/30">
                          {schema.map((col) => (
                            <td key={col.field} className="px-4 py-2 text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                              {row[col.field]?.toString() ?? '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-300 dark:border-slate-700 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <p className="text-slate-600 dark:text-slate-400">
                      Showing {startIndex + 1}–{endIndex} of {totalRows} rows
                    </p>
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalPages > 1 && (
                      <>
                        <span className="text-slate-600 dark:text-slate-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          Next
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-600 dark:text-slate-400">No data available</div>
            )}
          </div>

          {/* Chart Builder */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Chart Builder</h3>

            <div className="space-y-4">
              {/* Chart Type */}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Chart Type
                </label>
                <select
                  value={chartConfig.type}
                  onChange={(e) => setChartConfig({ ...chartConfig, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>

              {/* X Field */}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  X-Axis (Category)
                </label>
                <select
                  value={chartConfig.xField}
                  onChange={(e) => setChartConfig({ ...chartConfig, xField: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select field...</option>
                  {schema.map((col) => (
                    <option key={col.field} value={col.field}>
                      {col.field} ({col.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Y Field */}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Y-Axis (Value)
                </label>
                <select
                  value={chartConfig.yField}
                  onChange={(e) => setChartConfig({ ...chartConfig, yField: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select numeric field...</option>
                  {numericFields.map((col) => (
                    <option key={col.field} value={col.field}>
                      {col.field}
                    </option>
                  ))}
                  {numericFields.length === 0 && (
                    <option disabled>No numeric fields found</option>
                  )}
                </select>
              </div>

              {/* Category Limit */}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Show Top Categories
                </label>
                <select
                  value={categoryLimit}
                  onChange={(e) => setCategoryLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">Top 10</option>
                  <option value="25">Top 25</option>
                  <option value="50">Top 50</option>
                  <option value="all">All Categories</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateChart}
                  disabled={!chartConfig.xField || !chartConfig.yField}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition cursor-pointer"
                >
                  Generate Chart
                </button>
                {showChart && (
                  <button
                    onClick={handleResetChart}
                    className="py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Chart Display */}
          <AnimatePresence mode="wait">
            {showChart && chartConfig.xField && chartConfig.yField && (
              <motion.div
                key={`${chartConfig.type}-${chartConfig.xField}-${chartConfig.yField}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {chartConfig.type.charAt(0).toUpperCase() + chartConfig.type.slice(1)} Chart: {chartConfig.yField} by {chartConfig.xField}
                  </h3>
                </div>
                <SimpleChart data={sampleRows} config={chartConfig} categoryLimit={categoryLimit} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai' && (
        <div className="max-w-4xl">
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI-Generated Insights</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Powered by Google Gemini AI</p>
              </div>
              {hasSummaryData && (
                <button
                  onClick={() => triggerGenerate()}
                  disabled={showLoader}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-900/80 disabled:opacity-50 text-slate-900 dark:text-white font-medium rounded-lg transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg className={`w-4 h-4 ${showLoader ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
              )}
            </div>

            {/* Loading State */}
            {showLoader && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {isGenerating ? 'Generating AI Insights...' : 'Loading Saved AI Summary...'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {isGenerating ? 'This may take up to 30 seconds' : 'Fetching cached results'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 animate-pulse">
                  <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
                  <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
                  <div className="h-20 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
                </div>
              </div>
            )}

            {/* Error State */}
            {!showLoader && generationError && (
              <div className="flex flex-col items-center justify-center py-12 bg-red-500/10 rounded-lg border border-red-500/20">
                <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 font-medium mb-2">Error generating insights</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Please check the API key or try again</p>
                <button
                  onClick={() => triggerGenerate()}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Zero State - No Insights Yet */}
            {!showLoader && !generationError && !hasSummaryData && (
              <div className="flex flex-col items-center justify-center py-12 bg-slate-100 dark:bg-slate-900 rounded-lg">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">No AI Summary Found</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 text-center max-w-md">
                  Generate AI-powered insights to discover trends, patterns, and recommendations for this dataset.
                </p>
                <button
                  onClick={() => triggerGenerate()}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {isGenerating ? 'Generating...' : 'Generate AI Summary'}
                </button>
              </div>
            )}

            {/* Summary Content */}
            {!showLoader && !generationError && hasSummaryData && aiSummary && (
              <div className="space-y-4">
                {/* Copy All Button */}
                <div className="flex justify-end">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(
                      `Summary:\n${aiSummary.summary}\n\nInsights:\n${aiSummary.insights?.join('\n') || 'None'}\n\nTrends:\n${aiSummary.trendSummaries?.map(t => `${t.title}: ${t.description}`).join('\n') || 'None'}`
                    )}
                    className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy All
                  </motion.button>
                </div>

                {/* Summary - Collapsible */}
                {aiSummary.summary && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('summary')}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <h4 className="font-medium text-slate-900 dark:text-white">Summary</h4>
                      <svg className={`w-5 h-5 text-slate-500 transition-transform ${expandedSections.summary ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {expandedSections.summary && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-slate-600 dark:text-slate-400">{aiSummary.summary}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Insights - Collapsible */}
                {aiSummary.insights?.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('insights')}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <h4 className="font-medium text-slate-900 dark:text-white">Key Insights ({aiSummary.insights.length})</h4>
                      <svg className={`w-5 h-5 text-slate-500 transition-transform ${expandedSections.insights ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {expandedSections.insights && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2">
                            {aiSummary.insights.map((insight, idx) => (
                              <div key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">{idx + 1}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">{insight}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Trend Summaries - Collapsible */}
                {aiSummary.trendSummaries?.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('trends')}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <h4 className="font-medium text-slate-900 dark:text-white">Trends ({aiSummary.trendSummaries.length})</h4>
                      <svg className={`w-5 h-5 text-slate-500 transition-transform ${expandedSections.trends ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {expandedSections.trends && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 grid gap-3 sm:grid-cols-2">
                            {aiSummary.trendSummaries.map((trend, idx) => (
                              <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`w-2 h-2 rounded-full ${trend.trend === 'positive' ? 'bg-green-400' :
                                    trend.trend === 'negative' ? 'bg-red-400' : 'bg-slate-400'
                                    }`}></span>
                                  <h5 className="font-medium text-slate-900 dark:text-white text-sm">{trend.title}</h5>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">{trend.description}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Chart Suggestions */}
                {aiSummary.chartSuggestions?.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">Suggested Charts</h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {aiSummary.chartSuggestions.map((chart, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setChartConfig({
                              type: chart.type || chart.chartType || 'bar',
                              xField: chart.xField || chart.xAxis || chart.categoryField || '',
                              yField: chart.yField || chart.yAxis || '',
                            });
                            setShowChart(true);
                            setActiveTab('data');
                          }}
                          className="text-left p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{chart.title || `${chart.type}: ${chart.yField} by ${chart.xField}`}</p>
                          {chart.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{chart.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatasetDetailPage;
