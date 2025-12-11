// Analytics page - Workspace-level analytics with app space selector
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ChevronRight,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { useAppSpaces } from '../hooks/useAppSpaces';
import MetricCard from '../components/analytics/MetricCard';
import AnalyticsChartCard from '../components/analytics/AnalyticsChartCard';
import AIInsightsPanel from '../components/analytics/AIInsightsPanel';
import ProductPerformanceTable from '../components/analytics/ProductPerformanceTable';
import { useAnalyticsOverview } from '../hooks/useAnalyticsOverview';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { data: appSpaces = [], isLoading: spacesLoading } = useAppSpaces();
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);

  // Fetch analytics for selected app space
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsOverview(selectedSpaceId);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Auto-select first app space
  const selectedSpace = useMemo(() => {
    if (!selectedSpaceId && appSpaces.length > 0) {
      setSelectedSpaceId(appSpaces[0]._id);
      return appSpaces[0];
    }
    return appSpaces.find(s => s._id === selectedSpaceId);
  }, [appSpaces, selectedSpaceId]);

  // Extract data from analytics response
  const { kpis, revenueTrend, productPerformance, aiInsights } = analyticsData || {};

  // Loading state
  if (spacesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin">
            <BarChart3 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-4">Loading app spaces...</p>
        </div>
      </div>
    );
  }

  // No app spaces error state
  if (appSpaces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-2">
            No App Spaces Found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Create an app space first to view analytics.
          </p>
          <button
            onClick={() => navigate('/app-spaces')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            Create App Space
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* App Space Selector */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
          Select App Space
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {appSpaces.map((space) => (
            <motion.button
              key={space._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSpaceId(space._id)}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-left ${
                selectedSpaceId === space._id
                  ? 'border-blue-600 bg-blue-600/10 dark:bg-blue-600/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <p className={`font-semibold ${
                selectedSpaceId === space._id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {space.name}
              </p>
              {space.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {space.description}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Analytics Content - Only show when space is selected and data is available */}
      {selectedSpace && (
        <>
          {analyticsLoading ? (
            // Loading skeleton
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 animate-pulse">
                    <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-slate-100 dark:bg-slate-900 rounded w-3/4 mb-3"></div>
                    <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded-full w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* KPI Metrics - Only show if data exists */}
              {kpis && Object.keys(kpis).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {kpis.totalRevenue && (
                    <MetricCard
                      label={kpis.totalRevenue.label || 'Total Revenue'}
                      value={formatCurrency(kpis.totalRevenue.value)}
                      delta={kpis.totalRevenue.delta}
                    />
                  )}
                  {kpis.orders && (
                    <MetricCard
                      label={kpis.orders.label || 'Total Orders'}
                      value={kpis.orders.value.toLocaleString()}
                      delta={kpis.orders.delta}
                    />
                  )}
                  {kpis.newUsers && (
                    <MetricCard
                      label={kpis.newUsers.label || 'New Users'}
                      value={kpis.newUsers.value.toLocaleString()}
                      delta={kpis.newUsers.delta}
                    />
                  )}
                  {kpis.conversion && (
                    <MetricCard
                      label={kpis.conversion.label || 'Conversion Rate'}
                      value={formatPercent(kpis.conversion.value)}
                      delta={kpis.conversion.delta}
                    />
                  )}
                </div>
              )}

              {/* Charts and Insights Row - Only show if data exists */}
              {(revenueTrend?.length > 0 || aiInsights?.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {revenueTrend && revenueTrend.length > 0 && (
                    <div className="lg:col-span-2">
                      <AnalyticsChartCard
                        title="Revenue Trend"
                        data={revenueTrend}
                        defaultRangeLabel="Last 7 days"
                      />
                    </div>
                  )}

                  {aiInsights && aiInsights.length > 0 && (
                    <div>
                      <AIInsightsPanel
                        insights={aiInsights}
                        loading={false}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Product Performance Table - Only show if data exists */}
              {productPerformance && productPerformance.length > 0 && (
                <ProductPerformanceTable rows={productPerformance} />
              )}

              {/* Empty state if all data is missing */}
              {(!kpis || Object.keys(kpis).length === 0) && 
               (!revenueTrend || revenueTrend.length === 0) && 
               (!productPerformance || productPerformance.length === 0) && 
               (!aiInsights || aiInsights.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center"
                >
                  <TrendingUp className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-2">
                    No Analytics Data Available
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Add datasets to this app space to view analytics.
                  </p>
                  <button
                    onClick={() => navigate(`/app-spaces/${selectedSpace._id}`)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    Add Datasets
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;