// AISummaryPanel - Display AI-generated insights
import PropTypes from 'prop-types';

function AISummaryPanel({ summaries = [], loading = false, onRegenerate }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI Insights</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs">Powered by AI analysis</p>
          </div>
        </div>
        
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-900/80 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-400 text-sm font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg 
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          // Loading state
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 mb-4">
              <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing dataset...</span>
            </div>
            {/* Skeleton placeholders */}
            <div className="animate-pulse space-y-3">
              <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
              <div className="h-16 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
            </div>
          </div>
        ) : summaries && summaries.length > 0 ? (
          // Summaries list
          <div className="space-y-3">
            {summaries.map((summary, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg border-l-2 border-blue-500/50"
              >
                <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{summary}</p>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">No insights generated yet</p>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition"
              >
                Generate Insights
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

AISummaryPanel.propTypes = {
  summaries: PropTypes.arrayOf(PropTypes.string),
  loading: PropTypes.bool,
  onRegenerate: PropTypes.func,
};

export default AISummaryPanel;
