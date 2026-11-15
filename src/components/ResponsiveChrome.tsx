/**
 * Separated Phone vs. Desktop Navigation Chrome Components
 *
 * Isolates phone headers, mobile search drawers, and bottom tab docks
 * from desktop sidebars and wide command bars so neither layout compromises the other.
 */

import React, { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FileSpreadsheet, History, Layers, LogOut, Menu, Search, X } from 'lucide-react';
import type { ValidationJobRecord } from '../context/AppStateContext';
import type { ValidationProfile } from '../services/validationEngine';
import { BrandLogo } from './SharedUI';

export interface ChromeNavItem {
  readonly to: string;
  readonly label: string;
  readonly glyph: string;
}

export interface SearchSuggestion {
  key: string;
  title: string;
  meta: string;
  to: string;
}

export function buildWorkspaceSearchMatches(
  query: string,
  jobs: ValidationJobRecord[],
  profiles: ValidationProfile[]
): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const matchedJobs = jobs
    .filter(
      (j) =>
        j.fileName.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q) ||
        j.profileName.toLowerCase().includes(q)
    )
    .slice(0, 4)
    .map((j) => ({
      key: `job-${j.id}`,
      title: j.fileName,
      meta: `${j.id} · Grade ${j.summary.validationGrade}`,
      to: `/app/reports?job=${encodeURIComponent(j.id)}`,
    }));

  const matchedProfiles = profiles
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.targetDomain.toLowerCase().includes(q)
    )
    .slice(0, 3)
    .map((p) => ({
      key: `prof-${p.id}`,
      title: p.name,
      meta: `Profile · ${p.rules.length} rules`,
      to: '/app/profiles',
    }));

  return [...matchedJobs, ...matchedProfiles];
}

// ---------------------------------------------------------------------------
// 1. DESKTOP CUSTOMER SIDEBAR & TOPBAR (lg:flex, >= 1024px)
// ---------------------------------------------------------------------------

interface DesktopSidebarProps {
  workspaceTitle: string;
  workspaceInitial: string;
  roleLabel: string;
  workspaceLinks: readonly ChromeNavItem[];
  accountLinks: readonly ChromeNavItem[];
  planDisplayName: string;
  checksSummary: string;
  usagePct: number;
  onViewBilling: () => void;
}

export const DesktopCustomerSidebar: React.FC<DesktopSidebarProps> = ({
  workspaceTitle,
  workspaceInitial,
  roleLabel,
  workspaceLinks,
  accountLinks,
  planDisplayName,
  checksSummary,
  usagePct,
  onViewBilling,
}) => (
  <aside className="ss-customer-sidebar hidden lg:flex lg:flex-col shrink-0 select-none">
    <div className="px-5 pt-6 pb-4">
      <Link to="/app/dashboard">
        <BrandLogo dark subtitle="CUSTOMER WORKSPACE" size={34} />
      </Link>

      <div className="mt-5 bg-[#1B2D4B] min-h-[44px] rounded-[11px] px-3 py-2 flex items-center justify-between gap-2 border border-[#273E63]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[26px] h-[26px] rounded-full bg-[#DCEBFF] text-[#2563EB] font-bold text-[11px] flex items-center justify-center shrink-0">
            {workspaceInitial}
          </div>
          <span className="text-[11.5px] font-semibold text-white truncate">
            {workspaceTitle}
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#233E65] text-[#9CC0FF] shrink-0">
          {roleLabel}
        </span>
      </div>
    </div>

    <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
      <div>
        <div className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.06em] text-[#8FA0B9]">
          WORKSPACE
        </div>
        <div className="space-y-1">
          {workspaceLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app/upload' || item.to === '/app/profiles'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 h-[38px] rounded-[10px] text-[12px] transition ${
                  isActive
                    ? 'bg-[#233E65] text-white font-semibold'
                    : 'text-[#D6DFEA] font-medium hover:bg-[#1B2D4B] hover:text-white'
                }`
              }
            >
              <span className="w-5 text-center text-[14px] text-[#AEBBD0]">{item.glyph}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div>
        <div className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.06em] text-[#8FA0B9]">
          ACCOUNT
        </div>
        <div className="space-y-1">
          {accountLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 h-[38px] rounded-[10px] text-[12px] transition ${
                  isActive
                    ? 'bg-[#233E65] text-white font-semibold'
                    : 'text-[#D6DFEA] font-medium hover:bg-[#1B2D4B] hover:text-white'
                }`
              }
            >
              <span className="w-5 text-center text-[14px] text-[#AEBBD0]">{item.glyph}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>

    <div className="p-4">
      <div className="bg-[#1B2D4B] rounded-[14px] p-4 border border-[#273E63]">
        <div className="text-[9px] font-bold uppercase tracking-wider text-[#9CC0FF]">
          {planDisplayName}
        </div>
        <div className="text-[14px] font-bold text-white mt-1">{checksSummary}</div>
        <div className="mt-2.5 w-full h-[8px] rounded-[4px] bg-[#304766] overflow-hidden">
          <div
            className="h-full bg-[#2563EB] rounded-[4px] transition-all"
            style={{ width: `${usagePct}%` }}
          />
        </div>
        <div className="text-[10px] text-[#AFC0D8] mt-2">Monthly workspace entitlement</div>
        <button
          type="button"
          onClick={onViewBilling}
          className="mt-2.5 text-[10px] font-semibold text-[#8FBAFF] hover:text-white transition flex items-center gap-1"
        >
          <span>View plan options</span>
          <span>→</span>
        </button>
      </div>
    </div>
  </aside>
);

interface CustomerTopbarProps {
  breadcrumb: string;
  displayName: string;
  userInitials: string;
  activePlanId: string;
  jobs: ValidationJobRecord[];
  profiles: ValidationProfile[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNavigate: (to: string) => void;
  onSignOut: () => void;
}

export const CustomerResponsiveTopbar: React.FC<CustomerTopbarProps> = ({
  breadcrumb,
  displayName,
  userInitials,
  activePlanId,
  jobs,
  profiles,
  sidebarOpen,
  onToggleSidebar,
  onNavigate,
  onSignOut,
}) => {
  const [topSearch, setTopSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const quickSearchMatches = useMemo(
    () => buildWorkspaceSearchMatches(topSearch, jobs, profiles),
    [topSearch, jobs, profiles]
  );

  // Extract clean concise page title for mobile phone header
  const shortPageTitle = breadcrumb.split('/').pop()?.trim() || 'Workspace';

  return (
    <header className="ss-customer-topbar px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0">
      {/* PHONE / TABLET LEFT (< lg) */}
      <div className="flex lg:hidden items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-10 h-10 -ml-1.5 rounded-[10px] text-[#10213B] hover:bg-[#F5F7FB] flex items-center justify-center shrink-0"
          aria-label={sidebarOpen ? 'Close workspace menu' : 'Open workspace menu'}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] leading-none">
            SheetSentry
          </div>
          <div className="text-[14px] font-bold text-[#10213B] truncate leading-tight mt-0.5">
            {shortPageTitle}
          </div>
        </div>
      </div>

      {/* DESKTOP LEFT (>= lg) */}
      <div className="hidden lg:flex items-center gap-3 min-w-0">
        <span className="text-[13px] font-medium text-[#667085] truncate">{breadcrumb}</span>
      </div>

      {/* RIGHT CONTROLS (Cleanly adapted per viewport) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Desktop Search Bar */}
        <div className="relative hidden lg:block">
          <div className="flex items-center gap-2 bg-[#F5F7FB] h-[40px] px-3.5 rounded-[10px] w-[250px] border border-transparent focus-within:border-[#2563EB] transition">
            <Search className="w-3.5 h-3.5 text-[#667085] shrink-0" />
            <input
              type="text"
              value={topSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
              onChange={(e) => setTopSearch(e.target.value)}
              placeholder="Search files, profiles..."
              className="bg-transparent text-[11.5px] text-[#10213B] placeholder-[#667085] focus:outline-none w-full"
            />
            {topSearch && (
              <button
                type="button"
                onClick={() => setTopSearch('')}
                className="text-[10px] text-[#667085] hover:text-[#10213B]"
              >
                ✕
              </button>
            )}
          </div>

          {searchFocused && topSearch.trim().length > 0 && (
            <div className="absolute right-0 mt-1.5 w-[310px] rounded-[12px] bg-white border border-[#E4E9F1] shadow-lg py-1.5 z-50">
              {quickSearchMatches.length === 0 ? (
                <div className="px-3.5 py-2.5 text-[11px] text-[#667085]">
                  No matching files or profiles found.
                </div>
              ) : (
                quickSearchMatches.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setTopSearch('');
                      setSearchFocused(false);
                      onNavigate(item.to);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F5F7FB] flex items-center gap-2.5 transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-[#10213B] truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#667085] truncate">{item.meta}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/app/history')}
          className="hidden sm:flex w-[38px] h-[38px] rounded-[10px] bg-[#F5F7FB] hover:bg-[#EAF2FF] items-center justify-center text-[#2563EB] transition"
          title="Recent validation activity"
          aria-label="Recent validation activity"
        >
          <History className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pl-1">
          <div className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] rounded-full bg-[#DDEBFF] text-[#2563EB] font-bold text-[11.5px] flex items-center justify-center shrink-0">
            {userInitials}
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-[12px] font-semibold text-[#10213B]">{displayName}</div>
            <div className="text-[10px] text-[#667085] capitalize">{activePlanId} plan</div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="ml-0.5 px-2.5 py-2 sm:py-1.5 rounded-[8px] border border-[#E4E9F1] hover:border-[#D84A4A] hover:text-[#D84A4A] text-[11px] font-semibold text-[#667085] inline-flex items-center gap-1 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// ---------------------------------------------------------------------------
// 2. PHONE DRAWER WITH DEDICATED MOBILE SEARCH & BOTTOM TAB DOCK (< 1024px)
// ---------------------------------------------------------------------------

interface PhoneDrawerProps {
  open: boolean;
  workspaceTitle: string;
  planDisplayName: string;
  checksSummary: string;
  displayName: string;
  currency?: string;
  onToggleCurrency?: () => void;
  jobs: ValidationJobRecord[];
  profiles: ValidationProfile[];
  workspaceLinks: readonly ChromeNavItem[];
  accountLinks: readonly ChromeNavItem[];
  onClose: () => void;
  onNavigate: (to: string) => void;
  onSignOut: () => void;
}

export const PhoneCustomerDrawer: React.FC<PhoneDrawerProps> = ({
  open,
  workspaceTitle,
  planDisplayName,
  checksSummary,
  displayName,
  currency,
  onToggleCurrency,
  jobs,
  profiles,
  workspaceLinks,
  accountLinks,
  onClose,
  onNavigate,
  onSignOut,
}) => {
  const [mobileSearch, setMobileSearch] = useState('');
  const mobileMatches = useMemo(
    () => buildWorkspaceSearchMatches(mobileSearch, jobs, profiles),
    [mobileSearch, jobs, profiles]
  );

  if (!open) return null;

  return (
    <div className="lg:hidden bg-[#111F37] text-white px-4 py-4 space-y-4 border-b border-[#1B2D4B] shadow-lg">
      {/* Mobile-First Search inside Drawer */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 bg-[#1B2D4B] border border-[#273E63] h-[42px] px-3 rounded-[10px]">
          <Search className="w-4 h-4 text-[#9CC0FF] shrink-0" />
          <input
            type="text"
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            placeholder="Search files, reports, profiles..."
            className="bg-transparent text-xs text-white placeholder-[#8FA0B9] focus:outline-none w-full"
          />
          {mobileSearch && (
            <button
              type="button"
              onClick={() => setMobileSearch('')}
              className="text-xs text-[#9CC0FF]"
            >
              ✕
            </button>
          )}
        </div>

        {mobileSearch.trim().length > 0 && (
          <div className="rounded-[10px] bg-[#1B2D4B] border border-[#273E63] divide-y divide-[#273E63] overflow-hidden">
            {mobileMatches.length === 0 ? (
              <div className="px-3 py-2.5 text-[11px] text-[#AEBBD0]">
                No matches found.
              </div>
            ) : (
              mobileMatches.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMobileSearch('');
                    onClose();
                    onNavigate(m.to);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#233E65] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{m.title}</div>
                    <div className="text-[10px] text-[#9CC0FF] truncate">{m.meta}</div>
                  </div>
                  <span className="text-xs text-[#9CC0FF]">→</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Workspace Summary Chip */}
      <div className="rounded-[10px] bg-[#1B2D4B] border border-[#273E63] px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate">{workspaceTitle}</div>
          <div className="text-[10px] text-[#9CC0FF]">
            {planDisplayName} · {checksSummary}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigate('/app/billing');
          }}
          className="px-2.5 py-1 rounded-[7px] bg-[#2563EB] text-white text-[10.5px] font-semibold shrink-0"
        >
          Plan
        </button>
      </div>

      {/* Two-Column Compact Phone Nav Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {[...workspaceLinks, ...accountLinks].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2.5 px-3 rounded-[9px] text-xs font-medium transition ${
                isActive
                  ? 'bg-[#2563EB] text-white font-semibold'
                  : 'bg-[#172844] text-[#D6DFEA] hover:bg-[#233E65] hover:text-white'
              }`
            }
          >
            <span className="text-sm">{item.glyph}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Phone/Tablet Quick Surface & Currency Switcher (keeps cards unobstructed) */}
      <div className="pt-2 border-t border-[#1E3252] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigate('/');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#172844] text-[#D6DFEA] hover:text-white font-semibold"
        >
          <Layers className="w-3.5 h-3.5 text-[#60A5FA]" />
          <span>Public Website</span>
        </button>
        {currency && onToggleCurrency && (
          <button
            type="button"
            onClick={onToggleCurrency}
            className="px-3 py-1.5 rounded-[8px] bg-[#172844] border border-[#273E63] text-[#9CC0FF] font-mono font-bold"
          >
            Currency: {currency}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-[9px] bg-[#1B2D4B] border border-[#273E63] text-xs font-semibold text-[#FCA5A5] hover:bg-[#233E65]"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign out ({displayName})</span>
      </button>
    </div>
  );
};

export const PhoneBottomTabDock: React.FC<{ tabs: readonly ChromeNavItem[] }> = ({ tabs }) => (
  <nav className="ss-customer-mobile-nav lg:hidden px-2 flex items-center justify-around">
    {tabs.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center justify-center py-1.5 rounded-[10px] gap-0.5 text-[10.5px] font-semibold transition ${
            isActive ? 'text-[#2563EB] bg-[#F4F8FF]' : 'text-[#667085] hover:text-[#10213B]'
          }`
        }
      >
        <span className="text-[15px] leading-none">{tab.glyph}</span>
        <span>{tab.label}</span>
      </NavLink>
    ))}
  </nav>
);
