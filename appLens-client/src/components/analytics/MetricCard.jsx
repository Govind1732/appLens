// MetricCard component for displaying KPIs in Analytics Overview
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/**
 * MetricCard component
 * 
 * @param {object} props
 * @param {string} props.label - KPI label (e.g., "Total Revenue")
 * @param {string|number} props.value - Formatted value to display
 * @param {number} props.delta - Percentage change (positive/negative)
 * @param {string} [props.format] - Format type: "currency" | "number" | "percent" (reserved for future use)
 */
function MetricCard({ label, value, delta }) {
  // Determine delta styling and icon based on value
  const getDeltaStyle = () => {
    if (delta > 0) {
      return {
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        icon: ArrowUpRight
      };
    } else if (delta < 0) {
      return {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        icon: ArrowDownRight
      };
    } else {
      return {
        color: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-400/10',
        icon: Minus
      };
    }
  };

  const deltaStyle = getDeltaStyle();
  const DeltaIcon = deltaStyle.icon;
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl px-5 py-4 hover:border-blue-600 dark:hover:border-blue-400/50 transition-colors duration-200">
      {/* Label */}
      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
        {label}
      </p>

      {/* Main Value */}
      <p className="text-slate-900 dark:text-white text-3xl font-bold mb-3">
        {value}
      </p>

      {/* Delta Indicator */}
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${deltaStyle.bg} ${deltaStyle.color}`}>
        <DeltaIcon className="w-3.5 h-3.5" />
        <span>
          {deltaSign}{Math.abs(delta).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default MetricCard;
