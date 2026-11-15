import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { PORTAL_SURFACES } from '../content/navigationText';

/**
 * IX Layer — Cross-Surface Navigation & Chrome Interaction Handlers
 * Keeps mobile drawer, portal switcher drawer, connections popover, and breadcrumb
 * interaction logic completely isolated from UI templates and copy.
 */
export function useSurfaceNavigationIX() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currency, setCurrency, configMode, setConfigMode } = useAppState();

  const [switcherExpanded, setSwitcherExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connectionsPopoverOpen, setConnectionsPopoverOpen] = useState(false);

  const activeSurface = PORTAL_SURFACES.find((s) => s.match(location.pathname)) ?? PORTAL_SURFACES[0];

  const handleToggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'PHP' : 'USD');
  };

  const handleToggleConfigMode = () => {
    setConfigMode(configMode === 'SSOT_138_2' ? 'LEGACY_22_555' : 'SSOT_138_2');
  };

  const getCustomerBreadcrumb = (): string => {
    const p = location.pathname;
    if (p.includes('/upload')) return 'Workspace  /  Upload file';
    if (p.includes('/results')) return 'Workspace  /  Validation results';
    if (p.includes('/profiles')) return 'Workspace  /  Validation profiles';
    if (p.includes('/rules')) return 'Workspace  /  Rule builder';
    if (p.includes('/history')) return 'Workspace  /  Run history';
    if (p.includes('/reports')) return 'Workspace  /  Reports & exports';
    if (p.includes('/billing')) return 'Account  /  Billing & plans';
    if (p.includes('/settings')) return 'Account  /  Settings';
    if (p.includes('/help')) return 'Account  /  Help center';
    return 'Workspace  /  Dashboard';
  };

  const getAdminBreadcrumb = (): string => {
    const p = location.pathname;
    if (p.includes('/users')) return 'Platform  /  Users';
    if (p.includes('/subscriptions')) return 'Platform  /  Subscriptions';
    if (p.includes('/payments')) return 'Platform  /  Payments';
    if (p.includes('/uploads')) return 'Platform  /  Upload monitoring';
    if (p.includes('/storage')) return 'Platform  /  Storage';
    if (p.includes('/security')) return 'Platform  /  Security center';
    if (p.includes('/roles')) return 'Platform  /  Audit logs & RBAC';
    if (p.includes('/settings')) return 'Platform  /  Settings';
    if (p.includes('/operations')) return 'Platform  /  Connections';
    return 'Platform  /  Overview';
  };

  return {
    pathname: location.pathname,
    navigate,
    activeSurface,
    currency,
    configMode,
    switcherExpanded,
    setSwitcherExpanded,
    mobileMenuOpen,
    setMobileMenuOpen,
    sidebarOpen,
    setSidebarOpen,
    connectionsPopoverOpen,
    setConnectionsPopoverOpen,
    handleToggleCurrency,
    handleToggleConfigMode,
    getCustomerBreadcrumb,
    getAdminBreadcrumb,
  };
}
