import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { AdminLayout, CustomerLayout, PublicLayout } from './components/Layouts';
import {
  AuthPage,
  FaqPage,
  FeaturesPage,
  HowItWorksPage,
  LandingPage,
  PricingPage,
} from './pages/public/PublicPages';
import {
  CustomerDashboardPage,
  RuleBuilderSandboxPage,
  SpreadsheetPreviewMappingPage,
  UploadFilePage,
  UploadPreflightPage,
  ValidationProfilesPage,
} from './pages/customer/CustomerUploadAndRules';
import {
  CustomerBillingPage,
  CustomerSettingsPage,
  HelpCenterPage,
  ReportsExportsPage,
  RunHistoryAndJobDetailPage,
  ValidationResultsPage,
} from './pages/customer/CustomerResultsAndAccount';
import {
  AdminOperationsConnectionsPage,
  AdminOverviewPage,
  AdminPaymentsLedgerPage,
  AdminRolesPermissionsPage,
  AdminSecurityAuditPage,
  AdminStoragePage,
  AdminSubscriptionsPage,
  AdminSystemSettingsPage,
  AdminUploadsPipelinePage,
  AdminUsersPage,
} from './pages/admin/AdminPages';
import {
  FlowsAndArchitecturePage,
  FoundationsPage,
} from './pages/FoundationsAndFlowsPages';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'Unexpected UI error',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F7FB] text-[#10213B] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E4E9F1] rounded-[18px] p-8 shadow-sm space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#FDECEC] text-[#D84A4A] text-xs font-bold">
              UI Recovery Guard Active
            </div>
            <h1 className="text-xl font-bold text-[#10213B]">
              View recovered from an unexpected state
            </h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              {this.state.errorMessage || 'A temporary state mismatch occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.href = '/';
              }}
              className="w-full h-[42px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition"
            >
              Return to SheetSentry Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <AppStateProvider>
        <BrowserRouter>
          <Routes>
            {/* 00 Foundations, 01 Public Website & 04 Flows/Architecture */}
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="foundations" element={<FoundationsPage />} />
              <Route path="flows" element={<FlowsAndArchitecturePage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="login" element={<AuthPage mode="login" />} />
              <Route path="register" element={<AuthPage mode="register" />} />
              <Route path="reset-password" element={<AuthPage mode="reset" />} />
            </Route>

            {/* 02 Customer Application */}
            <Route path="app" element={<CustomerLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboardPage />} />
              <Route path="upload" element={<UploadFilePage />} />
              <Route path="upload/preflight" element={<UploadPreflightPage />} />
              <Route path="upload/preview" element={<SpreadsheetPreviewMappingPage />} />
              <Route path="profiles" element={<ValidationProfilesPage />} />
              <Route path="profiles/builder" element={<RuleBuilderSandboxPage />} />
              <Route path="results/:jobId" element={<ValidationResultsPage />} />
              <Route path="reports" element={<ReportsExportsPage />} />
              <Route path="history" element={<RunHistoryAndJobDetailPage />} />
              <Route path="jobs/:jobId" element={<RunHistoryAndJobDetailPage />} />
              <Route path="billing" element={<CustomerBillingPage />} />
              <Route path="settings" element={<CustomerSettingsPage />} />
              <Route path="help" element={<HelpCenterPage />} />
            </Route>

            {/* 03 Admin Console */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="uploads" element={<AdminUploadsPipelinePage />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
              <Route path="payments" element={<AdminPaymentsLedgerPage />} />
              <Route path="storage" element={<AdminStoragePage />} />
              <Route path="security" element={<AdminSecurityAuditPage />} />
              <Route path="audit-logs" element={<AdminSecurityAuditPage />} />
              <Route path="roles" element={<AdminRolesPermissionsPage />} />
              <Route path="settings" element={<AdminSystemSettingsPage />} />
              <Route path="operations" element={<AdminOperationsConnectionsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppStateProvider>
    </AppErrorBoundary>
  );
};

export default App;
