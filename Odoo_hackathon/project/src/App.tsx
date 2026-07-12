import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { TripsPage } from './pages/TripsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { FuelPage } from './pages/FuelPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { Loading } from './components/ui/Feedback';
import { useEffect, useState } from 'react';
import { fetchDashboardKPIs, type DashboardKPIs } from './lib/api';

function AppRoutes() {
  const { session, loading } = useAuth();
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    fetchDashboardKPIs()
      .then((kpis: DashboardKPIs) => setExpiringCount(kpis.expiringDrivers.length))
      .catch(() => {});
  }, [session]);

  if (loading) return <Loading message="Loading TransitOps..." />;

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout expiringCount={expiringCount} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><DashboardPage /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute module="vehicles"><VehiclesPage /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute module="drivers"><DriversPage /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute module="trips"><TripsPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute module="maintenance"><MaintenancePage /></ProtectedRoute>} />
        <Route path="/fuel" element={<ProtectedRoute module="fuel"><FuelPage /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute module="expenses"><ExpensesPage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute module="documents"><DocumentsPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute module="reports"><ReportsPage /></ProtectedRoute>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
