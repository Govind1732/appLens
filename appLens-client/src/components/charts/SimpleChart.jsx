// SimpleChart - Responsive chart component using Recharts
import { memo, useMemo } from 'react';
import {
    ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
    LineChart, Line,
    PieChart, Pie, Cell
} from 'recharts';

// Shared color palette
const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#f97316'];

// Check if value looks like a date string
const isDateLike = (value) => {
    if (!value) return false;
    const str = String(value);
    // Detect "YYYY-MM-DD" or "YYYY-MM-DD hh:mm:ss" patterns
    return /^\d{4}-\d{2}-\d{2}/.test(str);
};

// Format category labels (especially dates → YYYY-MM-DD)
const formatCategoryLabel = (value) => {
    if (!value) return '';
    const str = String(value);
    if (isDateLike(str)) {
        return str.slice(0, 10); // Just YYYY-MM-DD
    }
    return str;
};

// Format large numbers for axis labels
const formatAxisValue = (value) => {
    if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
    return value.toLocaleString();
};

/**
 * Aggregate data by xField, summing yField values
 * PRESERVES insertion order (for chronological dates)
 * Returns { chartData, maxValue, totalValue }
 */
function buildChartData(data, xField, yField, categoryLimit) {
    if (!data || !xField || !yField) {
        return { chartData: [], maxValue: 1, totalValue: 0 };
    }

    // Use Map to preserve insertion order
    const order = new Map();
    data.forEach((row) => {
        const key = row[xField] != null ? String(row[xField]) : 'Unknown';
        const value = parseFloat(row[yField]);
        if (!Number.isFinite(value)) return;
        if (!order.has(key)) order.set(key, 0);
        order.set(key, order.get(key) + value);
    });

    // Convert to array in insertion order (NO sorting by value!)
    let entries = Array.from(order.entries()).map(([label, value]) => ({ label, value }));

    // Apply category limit
    if (categoryLimit !== 'all') {
        const limit = parseInt(categoryLimit, 10);
        if (!isNaN(limit) && limit > 0) {
            entries = entries.slice(0, limit);
        }
    }

    const maxValue = entries.reduce((max, d) => Math.max(max, d.value), 0) || 1;
    const totalValue = entries.reduce((sum, d) => sum + d.value, 0) || 1;

    return { chartData: entries, maxValue, totalValue };
}

function SimpleChart({ data, config, categoryLimit = 'all' }) {
    const { type, xField, yField } = config;

    // Build aggregated chart data (preserves insertion order)
    const { chartData } = useMemo(
        () => buildChartData(data, xField, yField, categoryLimit),
        [data, xField, yField, categoryLimit]
    );

    // Early returns for invalid state
    if (!data || !xField || !yField) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-500 dark:text-slate-400 text-sm">
                Select fields and generate a chart.
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-500 dark:text-slate-400 text-sm">
                No numeric data available for this chart.
            </div>
        );
    }

    const isLargeDataset = chartData.length > 50;

    // Calculate dynamic width for horizontal scrolling
    const minWidth = Math.max(600, chartData.length * 30);

    // ═══════════════════════════════════════════════════════════════════════════
    // PIE CHART (with Top 10 + Others for large datasets)
    // ═══════════════════════════════════════════════════════════════════════════
    if (type === 'pie') {
        // Condense to Top 10 + "Others" for large datasets
        let pieData = chartData;
        if (chartData.length > 12) {
            const sorted = [...chartData].sort((a, b) => b.value - a.value);
            const top = sorted.slice(0, 10);
            const othersValue = sorted.slice(10).reduce((sum, d) => sum + d.value, 0);
            pieData = [...top, { label: 'Others', value: othersValue }];
        }

        return (
            <div className="w-full p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                {chartData.length > 12 && (
                    <p className="text-xs text-slate-500 mb-2">
                        Showing Top 10 categories + Others ({chartData.length - 10} grouped)
                    </p>
                )}
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                formatter={(value) => value.toLocaleString()}
                                labelFormatter={formatCategoryLabel}
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#f1f5f9'
                                }}
                            />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                wrapperStyle={{ fontSize: 11, maxHeight: 280, overflowY: 'auto', paddingLeft: 10 }}
                                formatter={(value) => formatCategoryLabel(value)}
                            />
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="label"
                                cx="40%"
                                cy="50%"
                                outerRadius={120}
                                fill="#3b82f6"
                                label={pieData.length <= 12 ? ({ label, percent }) =>
                                    `${formatCategoryLabel(label)} (${(percent * 100).toFixed(0)}%)` : false
                                }
                                labelLine={pieData.length <= 12}
                                animationDuration={800}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LINE CHART
    // ═══════════════════════════════════════════════════════════════════════════
    if (type === 'line') {
        return (
            <div className="w-full p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                {isLargeDataset && (
                    <p className="text-xs text-slate-500 mb-2">Large dataset — scroll horizontally to see all data points.</p>
                )}
                <div className="w-full overflow-x-auto">
                    <div style={{ minWidth: `${minWidth}px` }} className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="label"
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    interval={chartData.length > 20 ? Math.floor(chartData.length / 15) : 0}
                                    tickFormatter={formatCategoryLabel}
                                />
                                <YAxis
                                    tickFormatter={formatAxisValue}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    width={60}
                                />
                                <Tooltip
                                    formatter={(value) => value.toLocaleString()}
                                    labelFormatter={formatCategoryLabel}
                                    labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    name={yField}
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: '#3b82f6' }}
                                    activeDot={{ r: 6 }}
                                    animationDuration={800}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BAR CHART (default)
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <div className="w-full p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
            {isLargeDataset && (
                <p className="text-xs text-slate-500 mb-2">Large dataset — scroll horizontally to see all categories.</p>
            )}
            <div className="w-full overflow-x-auto">
                <div style={{ minWidth: `${minWidth}px` }} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="label"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                interval={chartData.length > 20 ? Math.floor(chartData.length / 15) : 0}
                                tickFormatter={formatCategoryLabel}
                            />
                            <YAxis
                                tickFormatter={formatAxisValue}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                width={60}
                            />
                            <Tooltip
                                formatter={(value) => value.toLocaleString()}
                                labelFormatter={formatCategoryLabel}
                                labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="value"
                                name={yField}
                                fill="#3b82f6"
                                animationDuration={800}
                                radius={[4, 4, 0, 0]}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default memo(SimpleChart);
