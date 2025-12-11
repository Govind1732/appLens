// AnalyticsOverviewPage - AI-powered analytics dashboard for AppLens
import { useParams } from 'react-router-dom';
import { useAnalyticsOverview } from '../../hooks/useAnalyticsOverview';
import MetricCard from '../../components/analytics/MetricCard';
import AnalyticsChartCard from '../../components/analytics/AnalyticsChartCard';
import AIInsightsPanel from '../../components/analytics/AIInsightsPanel';
import ProductPerformanceTable from '../../components/analytics/ProductPerformanceTable';
import { AlertCircle } from 'lucide-react';

function AnalyticsOverviewPage() {
  const { appSpaceId } = useParams();
  const { data, isLoading, isError } = useAnalyticsOverview(appSpaceId);

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

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-slate-100 dark:bg-slate-900 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded-full w-16"></div>
            </div>
          ))}
        </div>

        {/* Skeleton for Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 h-80 animate-pulse">
            <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded"></div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 h-80 animate-pulse">
            <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded"></div>
            </div>
          </div>
        </div>

        {/* Skeleton for Table */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900 rounded"></div>
            ))}
          </div>
        </div>
        </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-slate-800 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-500/10 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-2">
            Failed to Load Analytics
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            We couldn't retrieve your analytics data. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const { kpis, revenueTrend, productPerformance, aiInsights } = data || {};

  // Check if we have any data to display
  const hasKpis = kpis && Object.keys(kpis).length > 0;
  const hasRevenueTrend = revenueTrend && revenueTrend.length > 0;
  const hasAiInsights = aiInsights && aiInsights.length > 0;
  const hasProductPerformance = productPerformance && productPerformance.length > 0;
  
  const hasAnyData = hasKpis || hasRevenueTrend || hasAiInsights || hasProductPerformance;

  // No data available state
  if (!hasAnyData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-full">
              <AlertCircle className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-2">
            No Analytics Data Available
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Analytics data will appear here once you have datasets in this app space.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Metrics Row */}
      {hasKpis && (
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

      {/* Charts and Insights Row */}
      {(hasRevenueTrend || hasAiInsights) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend Chart - 2/3 width on desktop */}
          {hasRevenueTrend && (
            <div className="lg:col-span-2">
              <AnalyticsChartCard
                title="Revenue Trend"
                data={revenueTrend}
                defaultRangeLabel="Last 7 days"
              />
            </div>
          )}

          {/* AI Insights Panel - 1/3 width on desktop */}
          {hasAiInsights && (
            <div>
              <AIInsightsPanel
                insights={aiInsights}
                loading={false}
              />
            </div>
          )}
        </div>
      )}

      {/* Product Performance Table - Full Width */}
      {hasProductPerformance && (
        <ProductPerformanceTable rows={productPerformance} />
      )}
    </div>
  );
}

export default AnalyticsOverviewPage;
