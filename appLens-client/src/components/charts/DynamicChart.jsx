// DynamicChart component using Recharts
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Dark theme colors
const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

// Custom tooltip for dark theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-slate-900 dark:text-white text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function DynamicChart({ type = 'bar', data = [], xKey, yKey }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">No data available for chart</p>
      </div>
    );
  }

  const commonProps = {
    data,
    margin: { top: 20, right: 30, left: 20, bottom: 60 },
  };

  const axisStyle = {
    fontSize: 12,
    fill: '#9CA3AF', // applens-muted
  };

  const gridStyle = {
    strokeDasharray: '3 3',
    stroke: '#1F2933', // applens-border
  };

  // Render Bar Chart
  if (type === 'bar') {
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={axisStyle}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={axisStyle}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={yKey}
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Render Line Chart
  if (type === 'line') {
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis
              dataKey={xKey}
              tick={axisStyle}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={axisStyle}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#60a5fa' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Render Pie Chart
  if (type === 'pie') {
    // Transform data for pie chart
    const pieData = data.map((item) => ({
      name: item[xKey],
      value: typeof item[yKey] === 'number' ? item[yKey] : parseFloat(item[yKey]) || 0,
    }));

    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: '#64748b' }}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#9CA3AF' }}
              formatter={(value) => <span className="text-slate-600 dark:text-slate-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback for unknown chart type
  return (
    <div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
      <p className="text-slate-600 dark:text-slate-400">Unknown chart type: {type}</p>
    </div>
  );
}

DynamicChart.propTypes = {
  type: PropTypes.oneOf(['bar', 'line', 'pie']),
  data: PropTypes.arrayOf(PropTypes.object),
  xKey: PropTypes.string.isRequired,
  yKey: PropTypes.string.isRequired,
};

export default DynamicChart;
