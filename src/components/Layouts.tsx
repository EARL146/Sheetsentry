import React from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layers, Menu, Search, ShieldAlert, X } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import {
  ADMIN_MANAGEMENT_NAV,
  ADMIN_MOBILE_TABS,
  CUSTOMER_ACCOUNT_NAV,
  CUSTOMER_MOBILE_TABS,
  CUSTOMER_WORKSPACE_NAV,
  PORTAL_SURFACES,
  PUBLIC_FOOTER_TEXT,
  PUBLIC_NAV_LINKS,
} from '../content/navigationText';
import { useSurfaceNavigationIX } from '../interactions/useSurfaceNavigationIX';
import { BrandLogo } from './SharedUI';
import {
  CustomerResponsiveTopbar,
  DesktopCustomerSidebar,
  PhoneBottomTabDock,
  PhoneCustomerDrawer,
} from './ResponsiveChrome';

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Unobtrusive Floating Surface Switcher Dock
 * Replaces the intrusive top bar so Public, Customer, and Admin headers render cleanly.
 */
export const GlobalPortalSwitcherBar: React.FC = () => {
  const { authUser, logout } = useAppState();
  const navigate = useNavigate();
  const {
    pathname,
    activeSurface,
    currency,
    configMode,
    switcherExpanded,
    setSwitcherExpanded,
    handleToggleCurrency,
    handleToggleConfigMode,
  } = useSurfaceNavigationIX();

  const isWorkspaceRoute = pathname.startsWith('/app') || pathname.startsWith('/admin');

  return (
    <div
      className={`fixed right-3 lg:bottom-4 lg:right-4 z-50 flex-col items-end gap-2 ${
        isWorkspaceRoute ? 'hidden lg:flex' : 'bottom-4 flex'
      }`}
    >
      {switcherExpanded && (
        <div className="w-[calc(100vw-24px)] max-w-[310px] rounded-[16px] bg-white border border-[#E4E9F1] shadow-2xl p-3.5 text-[11px] text-[#10213B] space-y-3">
          <div className="flex items-center justify-between border-b border-[#E4E9F1] pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085]">
              Switch Portal Surface
            </span>
            <button
              type="button"
              onClick={() => setSwitcherExpanded(false)}
              className="p-1 rounded-[6px] text-[#667085] hover:bg-[#F5F7FB]"
              aria-label="Close surface switcher"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {authUser && (
            <div className="rounded-[10px] bg-[#F5F7FB] px-3 py-2 flex items-center justify-between gap-2 border border-[#E4E9F1]">
              <div className="min-w-0">
                <div className="font-bold text-[#10213B] truncate">{authUser.fullName}</div>
                <div className="text-[10px] text-[#667085] truncate">
                  {authUser.appRole === 'ADMIN' ? 'Administrator' : 'Customer Account'}
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setSwitcherExpanded(false);
                  await logout();
                  navigate('/login');
                }}
                className="px-2 py-1 rounded-[6px] bg-white border border-[#E4E9F1] text-[10px] font-semibold text-[#D84A4A] hover:bg-[#FEECEC]"
              >
                Sign out
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1">
            {PORTAL_SURFACES.map((surface) => {
              const active = surface.match(pathname);
              let badgeLabel = surface.badge;
              if (surface.id === 'customer' && !authUser) {
                badgeLabel = 'AUTH';
              } else if (surface.id === 'admin') {
                badgeLabel = authUser?.appRole === 'USER' ? 'LOCKED' : 'DESIGN';
              }

              return (
                <Link
                  key={surface.id}
                  to={surface.to}
                  onClick={() => setSwitcherExpanded(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-[10px] font-semibold transition ${
                    active
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[#F5F7FB] text-[#10213B] hover:bg-[#EAF2FF] hover:text-[#2563EB]'
                  }`}
                >
                  <span>{surface.label}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[5px] ${
                      active ? 'bg-white/20 text-white' : 'bg-white text-[#667085]'
                    }`}
                  >
                    {badgeLabel}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E4E9F1] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleToggleConfigMode}
              className="flex-1 px-2.5 py-1.5 rounded-[8px] bg-[#F5F7FB] hover:bg-[#EAF2FF] text-[#10213B] font-semibold text-[10px] border border-[#E4E9F1] transition"
            >
              {configMode === 'SSOT_138_2' ? 'Standard Tiers' : 'Legacy Tiers'}
            </button>
            <button
              type="button"
              onClick={handleToggleCurrency}
              className="px-3 py-1.5 rounded-[8px] bg-[#E8F7EF] hover:bg-[#D1F0DF] text-[#16A36A] font-mono font-bold text-[10px] border border-[#B8E6CD] transition"
            >
              {currency === 'USD' ? 'USD ($)' : 'PHP (₱)'}
            </button>
          </div>
        </div>
      )}

      {/* Desktop Full Surface Dock */}
      <button
        type="button"
        onClick={() => setSwitcherExpanded(!switcherExpanded)}
        className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#10213B] hover:bg-[#1B2D4B] text-white text-[11px] font-semibold shadow-lg border border-[#273E63] transition"
        title="Switch between Public Website, Customer App, Admin Console, Design System & Flows"
      >
        <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
        <span>{activeSurface.label}</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#2563EB] text-white font-mono">
          {currency}
        </span>
      </button>

      {/* Phone Compact Non-Blocking Pill */}
      <button
        type="button"
        onClick={() => setSwitcherExpanded(!switcherExpanded)}
        className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full bg-[#10213B]/95 backdrop-blur text-white text-[10px] font-bold shadow-lg border border-[#273E63] transition"
        title="Switch Portal Surface"
        aria-label="Switch Portal Surface"
      >
        <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
        <span className="font-mono text-[#9CC0FF]">{currency}</span>
      </button>
    </div>
  );
};

/**
 * 01 Public Website Layout
 */
export const PublicLayout: React.FC = () => {
  const { authUser, logout } = useAppState();
  const navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen } = useSurfaceNavigationIX();

  const handlePublicLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="ss-surface-public min-h-screen flex flex-col">
      <GlobalPortalSwitcherBar />

      <header className="ss-public-header">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px] h-[82px] flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <BrandLogo subtitle="SPREADSHEET DATA GUARD" size={38} />
          </Link>

          <nav className="hidden md:flex items-center gap-9 text-[13px] font-medium text-[#667085]">
            {PUBLIC_NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'text-[#2563EB] font-semibold' : 'ss-public-nav-link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {authUser ? (
              <>
                <span className="px-2.5 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[11px] font-semibold">
                  {authUser.fullName}
                </span>
                <Link
                  to={authUser.appRole === 'ADMIN' ? '/admin/overview' : '/app/dashboard'}
                  className="h-[44px] px-5 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold inline-flex items-center justify-center shadow-sm transition"
                >
                  Open Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => void handlePublicLogout()}
                  className="text-[12px] font-semibold text-[#667085] hover:text-[#D84A4A] transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] font-semibold text-[#10213B] hover:text-[#2563EB] transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="h-[44px] px-6 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold inline-flex items-center justify-center shadow-sm transition"
                >
                  Start for free
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[10px] text-[#667085] hover:bg-[#F5F7FB]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E4E9F1] bg-white px-6 py-4 space-y-2">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-[10px] text-sm font-medium text-[#10213B] hover:bg-[#F5F7FB]"
            >
              Home
            </NavLink>
            {PUBLIC_NAV_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-[10px] text-sm font-medium text-[#667085] hover:bg-[#F5F7FB] hover:text-[#10213B]"
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-[#E4E9F1] flex flex-col gap-2">
              {authUser ? (
                <>
                  <Link
                    to={authUser.appRole === 'ADMIN' ? '/admin/overview' : '/app/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-[10px] bg-[#2563EB] text-sm font-semibold text-white"
                  >
                    Open Dashboard ({authUser.fullName})
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handlePublicLogout()}
                    className="w-full text-center py-2.5 rounded-[10px] border border-[#E4E9F1] text-sm font-semibold text-[#D84A4A]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-[10px] border border-[#E4E9F1] text-sm font-semibold text-[#10213B]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-[10px] bg-[#2563EB] text-sm font-semibold text-white"
                  >
                    Start for free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="ss-public-footer text-[#9BB0CD]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-[100px] py-9 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/">
            <BrandLogo dark subtitle="SPREADSHEET QUALITY" size={34} />
          </Link>

          <p className="text-[12px] text-[#C3CEE0] text-center max-w-md">
            {PUBLIC_FOOTER_TEXT.tagline}
          </p>

          <div className="flex items-center gap-6 text-[11px] text-[#9BB0CD]">
            {PUBLIC_FOOTER_TEXT.productLinks.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-white transition">
                {link.label}
              </Link>
            ))}
            <span className="text-[#91A1B8]">© {PUBLIC_FOOTER_TEXT.copyright}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/**
 * 02 Customer App Layout (Isolated Customer Surface Shell)
 */
export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const {
    navigate,
    currency,
    handleToggleCurrency,
    sidebarOpen,
    setSidebarOpen,
    getCustomerBreadcrumb,
  } = useSurfaceNavigationIX();
  const { authUser, authLoading, activePlanId, jobs, profiles, logout } = useAppState();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
        <div className="rounded-[16px] bg-white border border-[#E4E9F1] px-6 py-5 shadow-sm text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-[13px] font-semibold text-[#10213B]">
            Loading customer workspace session...
          </div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
      />
    );
  }

  const displayName = authUser.fullName || 'Customer User';
  const workspaceTitle = authUser.workspaceName || `${displayName.split(' ')[0]}'s workspace`;
  const userInitials = getInitials(displayName);
  const workspaceInitial = workspaceTitle.charAt(0).toUpperCase();

  const latestJobId = jobs[0]?.id || 'latest';

  const workspaceItems = CUSTOMER_WORKSPACE_NAV;
  const workspaceLinks = [
    workspaceItems[0],
    workspaceItems[1],
    { to: '/app/upload/preflight', label: 'Pre-flight check', glyph: '⛨' },
    { to: '/app/upload/preview', label: 'Preview & mapping', glyph: '⊞' },
    workspaceItems[2],
    workspaceItems[3],
    workspaceItems[4],
    { to: `/app/results/${latestJobId}`, label: 'Validation results', glyph: '✓' },
    workspaceItems[5],
  ];

  const accountItems = CUSTOMER_ACCOUNT_NAV;

  const planDisplayName =
    activePlanId === 'pro' ? 'PRO PLAN' : activePlanId === 'free' ? 'FREE PLAN' : 'STARTER PLAN';
  const planMonthlyLimit = activePlanId === 'pro' ? 300 : activePlanId === 'free' ? 3 : 50;
  const checksSummary = `${jobs.length} / ${planMonthlyLimit} checks`;
  const usagePct = Math.min(100, Math.round((jobs.length / planMonthlyLimit) * 100));

  const handleCustomerSignOut = async () => {
    setSidebarOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="ss-surface-customer min-h-screen flex flex-col">
      <GlobalPortalSwitcherBar />

      <div className="flex-1 flex">
        {/* Separated Desktop Sidebar (>= 1024px) */}
        <DesktopCustomerSidebar
          workspaceTitle={workspaceTitle}
          workspaceInitial={workspaceInitial}
          roleLabel={authUser.role || 'OWNER'}
          workspaceLinks={workspaceLinks}
          accountLinks={accountItems}
          planDisplayName={planDisplayName}
          checksSummary={checksSummary}
          usagePct={usagePct}
          onViewBilling={() => navigate('/app/billing')}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Separated Phone Topbar & Desktop Command Bar */}
          <CustomerResponsiveTopbar
            breadcrumb={getCustomerBreadcrumb()}
            displayName={displayName}
            userInitials={userInitials}
            activePlanId={activePlanId}
            jobs={jobs}
            profiles={profiles}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNavigate={(to) => navigate(to)}
            onSignOut={() => void handleCustomerSignOut()}
          />

          {/* Phone-Only Slide-Down Drawer + Mobile Search (< 1024px) */}
          <PhoneCustomerDrawer
            open={sidebarOpen}
            workspaceTitle={workspaceTitle}
            planDisplayName={planDisplayName}
            checksSummary={checksSummary}
            displayName={displayName}
            currency={currency}
            onToggleCurrency={handleToggleCurrency}
            jobs={jobs}
            profiles={profiles}
            workspaceLinks={workspaceLinks}
            accountLinks={accountItems}
            onClose={() => setSidebarOpen(false)}
            onNavigate={(to) => navigate(to)}
            onSignOut={() => void handleCustomerSignOut()}
          />

          <main className="flex-1 px-4 pt-4 sm:px-8 sm:pt-8 ss-main-phone-pad max-w-[1220px] w-full mx-auto">
            <Outlet />
          </main>

          {/* Phone-Only Bottom Tab Dock (< 1024px) */}
          <PhoneBottomTabDock tabs={CUSTOMER_MOBILE_TABS} />
        </div>
      </div>
    </div>
  );
};

/**
 * 03 Admin Console Layout (Isolated Admin Surface Shell)
 */
export const AdminLayout: React.FC = () => {
  const { authUser, authLoading, logout, dbConnected } = useAppState();
  const {
    navigate,
    mobileMenuOpen: mobileOpen,
    setMobileMenuOpen: setMobileOpen,
    connectionsPopoverOpen,
    setConnectionsPopoverOpen,
    getAdminBreadcrumb,
  } = useSurfaceNavigationIX();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
        <div className="rounded-[16px] bg-white border border-[#E4E9F1] px-6 py-5 shadow-sm text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-[13px] font-semibold text-[#10213B]">
            Checking portal role permissions...
          </div>
        </div>
      </div>
    );
  }

  // Strict Customer-vs-Admin Role Boundary: Customer accounts (USER) cannot enter Admin Console
  if (authUser && authUser.appRole === 'USER') {
    return (
      <div className="ss-surface-admin min-h-screen flex flex-col">
        <GlobalPortalSwitcherBar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-[520px] w-full rounded-[22px] bg-white border border-[#E4E9F1] shadow-xl p-8 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FEECEC] text-[#D84A4A] flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#D84A4A]">
                ROLE BOUNDARY ENFORCED · 403 CUSTOMER ACCOUNT
              </div>
              <h1 className="text-[22px] font-bold text-[#10213B]">
                Admin Console Restricted to Administrators
              </h1>
              <p className="text-[13px] text-[#667085] leading-relaxed">
                You are currently signed in as{' '}
                <strong className="text-[#10213B]">{authUser.fullName}</strong> ({authUser.email})
                with <span className="font-mono font-bold text-[#2563EB]">USER</span> dashboard
                permissions. Customer accounts cannot access Admin Console controls.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/app/dashboard"
                className="flex-1 h-[42px] rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold inline-flex items-center justify-center transition"
              >
                ← Return to Customer Dashboard
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/admin/overview');
                }}
                className="flex-1 h-[42px] rounded-[10px] border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B] text-[13px] font-semibold inline-flex items-center justify-center transition"
              >
                Sign out to Design Preview
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isAdminSession = authUser?.appRole === 'ADMIN';
  const adminName = isAdminSession ? authUser.fullName : 'Platform owner';
  const adminRoleLabel = isAdminSession
    ? authUser.adminRole || 'Administrator'
    : 'Design Preview Only';
  const adminInitials = isAdminSession ? getInitials(adminName) : 'A';

  return (
    <div className="ss-surface-admin min-h-screen flex flex-col">
      <GlobalPortalSwitcherBar />

      <div className="flex-1 flex">
        <aside className="ss-admin-sidebar hidden lg:flex lg:flex-col shrink-0 select-none">
          <div className="px-6 pt-6 pb-4">
            <Link to="/admin/overview">
              <BrandLogo dark subtitle="ADMIN CONSOLE" size={34} />
            </Link>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            <div className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.06em] text-[#8FA0B9]">
              PLATFORM MANAGEMENT
            </div>
            {ADMIN_MANAGEMENT_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 h-[40px] rounded-[9px] text-[12px] transition ${
                    isActive
                      ? 'bg-[#233E65] text-white font-semibold'
                      : 'text-[#D6DFEA] font-medium hover:bg-[#1B2D4B] hover:text-white'
                  }`
                }
              >
                <span className="w-5 text-center text-[15px] text-[#AEBBD0]">{item.glyph}</span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4">
            <div className="bg-[#1B2D4B] rounded-[12px] p-3.5 border border-[#273E63]">
              <div className="flex items-center gap-2.5">
                <div className="w-[32px] h-[32px] rounded-full bg-[#D8E8FF] text-[#2563EB] font-bold text-[12px] flex items-center justify-center shrink-0">
                  {adminInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-white truncate">
                    {adminName}
                  </div>
                  <div className="text-[9.5px] text-[#AEBBD0] truncate">{adminRoleLabel}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/security')}
                className="mt-3 text-[9.5px] font-medium text-[#8FBAFF] hover:text-white transition flex items-center gap-1"
              >
                <span>Account and security</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="ss-admin-topbar px-4 sm:px-8 flex items-center justify-between relative shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-[10px] text-[#667085] hover:bg-[#F5F7FB]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-[12px] font-medium text-[#667085] whitespace-pre-wrap">
                {getAdminBreadcrumb()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Admin Search (Node 4:465) */}
              <div className="hidden md:flex items-center gap-2 bg-[#F5F7FB] h-[38px] px-3.5 rounded-[9px] w-[190px]">
                <Search className="w-3.5 h-3.5 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Search platform..."
                  className="bg-transparent text-[11px] text-[#10213B] placeholder-[#667085] focus:outline-none w-full"
                />
              </div>

              {/* Role / Design-Only Mode Pill */}
              <span
                className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isAdminSession
                    ? 'bg-[#E8F7EF] text-[#16A36A]'
                    : 'bg-[#FFF4DE] text-[#D99121]'
                }`}
              >
                {isAdminSession ? `ADMIN · ${adminRoleLabel}` : 'Admin Console · Design-Only Preview'}
              </span>

              {/* Admin Connections Control Trigger (Node 20:7 & 25:2) */}
              <button
                type="button"
                onClick={() => setConnectionsPopoverOpen(!connectionsPopoverOpen)}
                className="bg-[#E8F2FF] hover:bg-[#DCEBFF] h-[38px] px-3.5 rounded-[9px] flex items-center gap-2.5 transition"
              >
                <span className="w-[8px] h-[8px] rounded-full bg-[#2563EB]" />
                <span className="text-[11px] font-semibold text-[#12213B]">Connections</span>
                <span className="text-[8.5px] font-bold text-[#2E6BCF] uppercase tracking-wider">
                  {isAdminSession ? 'LIVE' : 'DESIGN'}
                </span>
                <span className="text-[#47638A] text-[11px] font-bold">⌄</span>
              </button>

              {/* Notification Button (Node 4:467) */}
              <button
                type="button"
                onClick={() => navigate('/admin/security')}
                className="w-[38px] h-[38px] rounded-[10px] bg-[#F5F7FB] hover:bg-[#EAF2FF] flex items-center justify-center text-[#2563EB] text-[10px] font-bold transition"
                title="Platform security alerts"
              >
                ●
              </button>

              {/* Admin Top Avatar (Node 4:469) */}
              <div className="flex items-center gap-2.5 pl-1">
                <div className="w-[38px] h-[38px] rounded-full bg-[#E6E9FF] text-[#7658D6] font-bold text-[12px] flex items-center justify-center shrink-0">
                  {adminInitials}
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-[12px] font-semibold text-[#10213B]">{adminName}</div>
                  <div className="text-[9.5px] text-[#667085]">{adminRoleLabel}</div>
                </div>
                {isAdminSession && (
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate('/login');
                    }}
                    className="ml-1 px-2 py-1 rounded-[7px] border border-[#E4E9F1] text-[10px] font-semibold text-[#667085] hover:text-[#D84A4A]"
                  >
                    Sign out
                  </button>
                )}
              </div>
            </div>

            {connectionsPopoverOpen && (
              <div className="ss-admin-popover p-4 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[12px] font-bold text-[#10213B]">System connections</div>
                    <div className="text-[10px] text-[#667085] mt-0.5">
                      {isAdminSession
                        ? 'Authenticated admin inspection mode'
                        : 'Static Design-Only Console Preview — read-only UI showcase'}
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF4DE] text-[#D99121] font-bold text-[9px] uppercase">
                    {isAdminSession ? 'ADMIN' : 'DESIGN'}
                  </span>
                </div>

                <div className="my-3 h-px bg-[#E4E9F1]" />

                <div className="space-y-2.5">
                  {[
                    {
                      name: 'MySQL 8 (sheetsentry)',
                      status: dbConnected ? 'Connected (phpMyAdmin)' : 'Offline',
                      pill: dbConnected
                        ? 'bg-[#E8F7EF] text-[#16A36A]'
                        : 'bg-[#F2F4F7] text-[#667085]',
                    },
                    {
                      name: 'Azure Blob Storage',
                      status: 'Not configured',
                      pill: 'bg-[#F2F4F7] text-[#667085]',
                    },
                    {
                      name: 'Managed Redis',
                      status: 'Optional',
                      pill: 'bg-[#F0ECFF] text-[#7658D6]',
                    },
                    {
                      name: 'Azure Service Bus',
                      status: 'Not configured',
                      pill: 'bg-[#F2F4F7] text-[#667085]',
                    },
                    {
                      name: 'Email provider',
                      status: 'Not configured',
                      pill: 'bg-[#F2F4F7] text-[#667085]',
                    },
                    {
                      name: 'Payment provider',
                      status: 'Sandbox only',
                      pill: 'bg-[#FFF4DE] text-[#D99121]',
                    },
                  ].map((svc) => (
                    <div key={svc.name} className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#10213B]">{svc.name}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold ${svc.pill}`}
                      >
                        {svc.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-3 h-px bg-[#E4E9F1]" />

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#667085]">Last health check: Not run</span>
                  <Link
                    to="/admin/operations"
                    onClick={() => setConnectionsPopoverOpen(false)}
                    className="font-bold text-[#2563EB] hover:underline"
                  >
                    Open Connections Center →
                  </Link>
                </div>
              </div>
            )}
          </header>

          {mobileOpen && (
            <div className="lg:hidden bg-[#101C32] text-white px-4 py-4 border-b border-[#1B2D4B] shadow-lg">
              <div className="grid grid-cols-2 gap-1.5">
                {ADMIN_MANAGEMENT_NAV.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 py-2.5 px-3 rounded-[9px] text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#2563EB] text-white font-semibold'
                          : 'bg-[#172844] text-[#D6DFEA] hover:bg-[#233E65] hover:text-white'
                      }`
                    }
                  >
                    <span>{item.glyph}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          <main className="flex-1 px-4 pt-4 sm:px-8 sm:pt-8 ss-main-phone-pad max-w-[1220px] w-full mx-auto">
            {!isAdminSession && (
              <div className="mb-6 rounded-[14px] bg-[#10213B] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-[#233E65] shadow-sm">
                <div className="text-[12px] text-[#D6DFEA]">
                  <span className="font-bold text-[#FBBF24] mr-2">DESIGN PREVIEW ONLY:</span>
                  Admin Console is displayed as a read-only system architecture &amp; operations
                  showcase. Customer accounts cannot access this surface.
                </div>
                <Link
                  to="/login?next=/admin/overview"
                  className="px-3 py-1.5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold shrink-0 transition"
                >
                  Admin Sign in
                </Link>
              </div>
            )}
            <Outlet />
          </main>

          <nav className="ss-customer-mobile-nav lg:hidden px-4 flex items-center justify-around">
            {ADMIN_MOBILE_TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
                    isActive ? 'text-[#2563EB]' : 'text-[#667085] hover:text-[#10213B]'
                  }`
                }
              >
                <span className="text-[16px] leading-none">{tab.glyph}</span>
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};
