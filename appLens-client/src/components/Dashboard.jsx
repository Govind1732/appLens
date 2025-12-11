import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import {
  BarChart3,
  Database,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity,
  FileText
} from 'lucide-react';
import { api } from '../api/apiClient';
import { useAppSpaces } from '../hooks/useAppSpaces';

// StatCard component moved outside to avoid recreating during render
const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-colors duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'
            }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { data: appSpaces = [], isLoading: spacesLoading } = useAppSpaces();

  // Fetch datasets for each app space to derive counts
  const datasetQueries = useQueries({
    queries: appSpaces.map((space) => ({
      queryKey: ['datasets', space._id],
      queryFn: () => api.get(`/api/datasets?appSpaceId=${space._id}`),
      enabled: !!space?._id,
    })),
  });

  const datasets = useMemo(() => {
    return datasetQueries
      .map((q) => q.data || [])
      .flat();
  }, [datasetQueries]);

  const stats = useMemo(() => {
    const appSpacesCount = appSpaces.length;
    const datasetsCount = datasets.length;

    return {
      appSpaces: appSpacesCount,
      datasets: datasetsCount,
      analyses: datasetsCount, // proxy until real analyses endpoint exists
      insights: datasetsCount * 2, // proxy derived from datasets
    };
  }, [appSpaces, datasets]);

  const recentActivity = useMemo(() => {
    return datasets
      .map((ds) => ({
        id: ds._id,
        type: 'dataset',
        title: ds.name,
        action: ds.sourceType === 'postgresql' || ds.sourceType === 'mysql' || ds.sourceType === 'mongodb' ? 'connected' : 'uploaded',
        time: ds.createdAt,
        icon: ds.sourceType === 'analysis' ? BarChart3 : Database,
      }))
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  }, [datasets]);

  return (
    <div className="space-y-8">
      {/* Create AppSpace Button */}
      <div className="flex justify-end">
        <Link
          to="/app-spaces/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          Create AppSpace
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="AppSpaces"
          value={stats.appSpaces}
          icon={Users}
          change={`${stats.appSpaces ? '+ ' + Math.min(100, stats.appSpaces * 5) + '%' : '0%'}`}
          changeType="positive"
        />
        <StatCard
          title="Datasets"
          value={stats.datasets}
          icon={Database}
          change={`${stats.datasets ? '+ ' + Math.min(100, stats.datasets * 3) + '%' : '0%'}`}
          changeType="positive"
        />
        <StatCard
          title="Analyses"
          value={stats.analyses}
          icon={BarChart3}
          change={`${stats.analyses ? '+ ' + Math.min(100, stats.analyses * 4) + '%' : '0%'}`}
          changeType="positive"
        />
        <StatCard
          title="AI Insights"
          value={stats.insights}
          icon={TrendingUp}
          change={`${stats.insights ? '+ ' + Math.min(100, stats.insights * 2) + '%' : '0%'}`}
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            {recentActivity.length > 0 && (
              <Link
                to="/activity"
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <activity.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white text-sm font-medium">{activity.title}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      {activity.action} • {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400 text-sm">No recent activity yet. Upload a dataset to get started!</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Quick Actions</h2>

          <div className="space-y-4">
            <Link
              to="/datasets/upload"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 group"
            >
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-800">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-white font-medium">Upload Dataset</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Add new data for analysis</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200" />
            </Link>

            <Link
              to="/analytics/create"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 group"
            >
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-800">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-white font-medium">Create Analysis</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Generate insights from your data</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200" />
            </Link>

            <Link
              to="/app-spaces"
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 group"
            >
              <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-800">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-white font-medium">Manage AppSpaces</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Organize your workspaces</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200" />
            </Link>
          </div>
        </div>
      </div>

      {/* Charts preview section - Only show if there are datasets */}
      {/* {datasets.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Analytics Overview</h2>
            <Link 
              to="/analytics" 
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              View details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-slate-900 dark:text-white text-sm font-medium">Data Processing</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.datasets ? Math.min(100, stats.datasets * 7).toFixed(0) + '%' : '0%'}</p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Derived from active datasets</p>
            </div>
            
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-slate-900 dark:text-white text-sm font-medium">Reports Generated</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.insights}</p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Estimated insights</p>
            </div>
            
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-slate-900 dark:text-white text-sm font-medium">Growth Rate</h3>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.datasets ? '+' + Math.min(100, stats.datasets * 5) + '%' : '0%'}</p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Growth based on dataset volume</p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Dashboard;