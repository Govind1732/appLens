// AnalyticsChartCard component with title and time range toggle
import { useState } from 'react';
import DynamicChart from '../charts/DynamicChart';

/**
 * AnalyticsChartCard component
 * Wraps DynamicChart with a header showing title and time range options
 * 
 * @param {object} props
 * @param {string} props.title - Chart title (e.g., "Revenue Trend")
 * @param {Array} props.data - Array of { label, value }
 * @param {string} [props.defaultRangeLabel] - Default time range label (e.g., "Last 7 days")
 */
function AnalyticsChartCard({ title, data, defaultRangeLabel = 'Last 7 days' }) {
  const [selectedRange, setSelectedRange] = useState(defaultRangeLabel);
  
  const timeRanges = ['Last 7 days', 'Last 30 days'];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-6 hover:border-blue-600 dark:hover:border-blue-400/50 transition-colors duration-200 h-80 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Title */}
        <h3 className="text-slate-900 dark:text-white text-lg font-semibold">
          {title}
        </h3>

        {/* Time Range Pills */}
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer ${
                selectedRange === range
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        <DynamicChart 
          type="line" 
          data={data} 
          xKey="label" 
          yKey="value" 
        />
      </div>
    </div>
  );
}

export default AnalyticsChartCard;
