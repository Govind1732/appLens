// ProductPerformanceTable component for Analytics Overview
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * ProductPerformanceTable component
 * Displays product performance metrics in a table format
 * 
 * @param {object} props
 * @param {Array} props.rows - Array of { name, revenue, orders, conversion, trend? }
 */
function ProductPerformanceTable({ rows = [] }) {
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    } else if (trend === 'stable') {
      return <Minus className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-300 dark:border-slate-700">
        <h3 className="text-slate-900 dark:text-white text-lg font-semibold">Product Performance</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Conversion Rate
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 dark:divide-slate-700">
            {rows.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-slate-100 dark:bg-slate-900 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{row.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">{formatCurrency(row.revenue)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">{row.orders.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">{formatPercent(row.conversion)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    {getTrendIcon(row.trend)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {rows.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">No product data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductPerformanceTable;
