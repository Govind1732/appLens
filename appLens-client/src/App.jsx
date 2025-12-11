// AppLens - Main App Component with Routes
import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AppSpaceListPage from './pages/appSpaces/AppSpaceListPage';
import DatasetListPage from './pages/datasets/DatasetListPage';
import DatasetDetailPage from './pages/datasets/DatasetDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AnalyticsOverviewPage from './pages/analytics/AnalyticsOverviewPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import Dashboard from './components/Dashboard';
import DashboardLayout from './layouts/DashboardLayout';

// Layout wrapper for all authenticated dashboard routes
const DashboardShell = () => (
  <ProtectedRoute>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </ProtectedRoute>
);

function App() {
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Hydrate auth state from localStorage on app startup
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes - wrapped once in DashboardShell */}
      <Route element={<DashboardShell />}>
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/app-spaces" element={<AppSpaceListPage />} />
        <Route path="/app-spaces/:appSpaceId/datasets" element={<DatasetListPage />} />
        <Route path="/datasets/:datasetId" element={<DatasetDetailPage />} />
        <Route path="/app-spaces/:appSpaceId/analytics" element={<AnalyticsOverviewPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="*" element={isAuthenticated ? <Navigate to="/app-spaces" replace /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
