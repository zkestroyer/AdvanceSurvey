import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import MasterData from './pages/MasterData';
import UserManagement from './pages/UserManagement';
import SurveyManagement from './pages/SurveyManagement';
import SurveyBuilder from './pages/SurveyBuilder';
import AnalyticsReports from './pages/AnalyticsReports';
import ComparisonReports from './pages/ComparisonReports';
import RoleManagement from './pages/RoleManagement';
import Territories from './pages/Territories';
import RegionsAndCities from './pages/RegionsAndCities';
import CompetitorBrands from './pages/CompetitorBrands';
import PricingManagement from './pages/PricingManagement';
import TradePrograms from './pages/TradePrograms';
import AuditLogs from './pages/AuditLogs';
import SystemSettings from './pages/SystemSettings';
import NotificationHub from './pages/NotificationHub';
import SupportTickets from './pages/SupportTickets';

// Mobile Components
import MobileLayout from './mobile/components/MobileLayout';
import MobileLogin from './mobile/pages/MobileLogin';
import TSODashboard from './mobile/pages/TSODashboard';
import ShopDirectory from './mobile/pages/ShopDirectory';
import ShopCheckIn from './mobile/pages/ShopCheckIn';
import SurveyExecution from './mobile/pages/SurveyExecution';
import OfflineSync from './mobile/pages/OfflineSync';
import MobileProfile from './mobile/pages/MobileProfile';
import ExecDashboard from './mobile/pages/ExecDashboard';
import TeamTracker from './mobile/pages/TeamTracker';
import MarketInsights from './mobile/pages/MarketInsights';

import { Toaster } from 'react-hot-toast';

class GlobalErrorBoundary extends React.Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#450a0a', color: '#fca5a5', height: '100vh', width: '100vw' }}>
          <h2>Global Application Crash</h2>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ fontSize: '10px', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <GlobalErrorBoundary>
      <HashRouter>
        <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(6, 182, 212, 0.3)' } 
        }} 
      />
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard Routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/management-dashboard" element={<ManagementDashboard />} />
          <Route path="/shops" element={<MasterData />} />
          <Route path="/tso-management" element={<UserManagement />} />
          <Route path="/surveys" element={<SurveyManagement />} />
          <Route path="/surveys/builder" element={<SurveyBuilder />} />
          <Route path="/reports" element={<AnalyticsReports />} />
          <Route path="/comparison-reports" element={<ComparisonReports />} />
          <Route path="/roles" element={<RoleManagement />} />
          <Route path="/territories" element={<Territories />} />
          <Route path="/regions-cities" element={<RegionsAndCities />} />
          <Route path="/competitors" element={<CompetitorBrands />} />
          <Route path="/pricing" element={<PricingManagement />} />
          <Route path="/trade-programs" element={<TradePrograms />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/notifications" element={<NotificationHub />} />
          <Route path="/support" element={<SupportTickets />} />
        </Route>

        {/* Mobile App Routes */}
        <Route path="/mobile/login" element={<MobileLogin />} />
        <Route element={<MobileLayout />}>
          <Route path="/mobile/dashboard" element={<TSODashboard />} />
          <Route path="/mobile/shops" element={<ShopDirectory />} />
          <Route path="/mobile/check-in" element={<ShopCheckIn />} />
          <Route path="/mobile/survey" element={<SurveyExecution />} />
          <Route path="/mobile/sync" element={<OfflineSync />} />
          <Route path="/mobile/profile" element={<MobileProfile />} />

          {/* Exec App Routes */}
          <Route path="/mobile/exec/dashboard" element={<ExecDashboard />} />
          <Route path="/mobile/exec/team" element={<TeamTracker />} />
          <Route path="/mobile/exec/market" element={<MarketInsights />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
    </GlobalErrorBoundary>
  );
}

export default App;
