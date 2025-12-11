// AIInsightsPanel component for displaying AI-generated insights
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * AIInsightsPanel component
 * Displays AI-powered insights in the Analytics Overview
 * 
 * @param {object} props
 * @param {Array} props.insights - Array of { title: string, body: string }
 * @param {boolean} [props.loading] - Loading state
 */
function AIInsightsPanel({ insights = [], loading = false }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-blue-600/40 rounded-2xl p-6 shadow-lg shadow-blue-500/10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-slate-900 dark:text-white text-lg font-semibold">
          AI-Powered Insights
        </h3>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Analyzing your data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Insights List */}
      {!loading && insights.length > 0 && (
        <div className="space-y-4 mb-6">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="pl-4 pr-3 py-3 border-l-2 border-blue-500/50 bg-slate-100 dark:bg-slate-900 rounded-r-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <h4 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">
                {insight.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {insight.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && insights.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            No insights available yet. Keep collecting data!
          </p>
        </div>
      )}

      {/* View Full Report Button */}
      {!loading && insights.length > 0 && (
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500/50 text-blue-400 font-medium text-sm rounded-lg hover:bg-blue-500/10 hover:border-blue-500 transition-colors duration-200 group cursor-pointer">
          <span>View Full Report</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      )}
    </div>
  );
}

export default AIInsightsPanel;
