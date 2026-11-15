import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lock,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import {
  ConfigSourceMode,
  CurrencyCode,
  ProcessingEligibility,
  ValidationGrade,
} from '../config/productConfig';

import { ADMIN_BANNER_TEXT, ADMIN_SECTIONS_TEXT } from '../content/adminText';

/**
 * SheetSentry Shield + Spreadsheet Grid Mark
 * Pure vector geometry derived from 01 Public Website identity — no overlaid colliding glyphs.
 */
export const SheetSentryShieldMark: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <div
    style={{ width: size, height: size }}
    className="relative rounded-[10px] bg-[#2563EB] flex items-center justify-center shrink-0 overflow-hidden shadow-sm shadow-blue-600/20"
  >
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[76%] h-[76%]"
      aria-hidden="true"
    >
      <path
        d="M16 3.5L6 7.5V15.3C6 21.7 10.3 27.2 16 28.8C21.7 27.2 26 21.7 26 15.3V7.5L16 3.5Z"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.8"
        fill="rgba(255,255,255,0.12)"
      />
      <rect
        x="10.5"
        y="10.2"
        width="11"
        height="10.6"
        rx="1.8"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.2"
      />
      <line x1="10.5" y1="14" x2="21.5" y2="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" />
      <line x1="14.5" y1="10.2" x2="14.5" y2="20.8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.1" />
      <path
        d="M12.5 16.5L15 19L19.8 13.8"
        stroke="#FFFFFF"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const BrandLogo: React.FC<{
  dark?: boolean;
  subtitle?: string;
  badge?: string;
  size?: number;
}> = ({ dark = false, subtitle, badge, size = 36 }) => (
  <div className="flex items-center gap-3 select-none">
    <SheetSentryShieldMark size={size} />
    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-2">
        <span
          className={`font-bold text-[17px] leading-tight tracking-tight ${
            dark ? 'text-white' : 'text-[#10213B]'
          }`}
        >
          SheetSentry
        </span>
        {badge && (
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              dark
                ? 'bg-[#233E65] text-[#9CC0FF] border border-[#304766]'
                : 'bg-[#EAF2FF] text-[#2563EB]'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <span
          className={`font-bold text-[8.5px] uppercase tracking-[0.06em] leading-tight mt-0.5 ${
            dark ? 'text-[#AEBBD0]' : 'text-[#667085]'
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

export const GradeBadge: React.FC<{ grade: ValidationGrade }> = ({ grade }) => {
  const styles: Record<ValidationGrade, string> = {
    A: 'bg-[#E8F7EF] text-[#16A36A] border-[#B8E6CD]',
    B: 'bg-[#EAF2FF] text-[#2563EB] border-[#BFDBFE]',
    C: 'bg-[#FFF4DE] text-[#D99121] border-[#FDE68A]',
    FAIL: 'bg-[#FDECEC] text-[#D84A4A] border-[#FECACA]',
    'N/A': 'bg-[#F2F4F7] text-[#667085] border-[#E4E9F1]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles[grade]}`}
    >
      Grade {grade}
    </span>
  );
};

export const EligibilityBadge: React.FC<{ eligibility: ProcessingEligibility }> = ({
  eligibility,
}) => {
  if (eligibility === 'ELIGIBLE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#E8F7EF] text-[#16A36A] border border-[#B8E6CD]">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A]" />
        Healthy · Eligible
      </span>
    );
  }
  if (eligibility === 'REVIEW_REQUIRED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF4DE] text-[#D99121] border border-[#FDE68A]">
        <AlertTriangle className="w-3.5 h-3.5 text-[#D99121]" />
        Issues found · Review required
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FDECEC] text-[#D84A4A] border border-[#FECACA]">
      <XCircle className="w-3.5 h-3.5 text-[#D84A4A]" />
      Blocked · Critical errors
    </span>
  );
};

export const ProvisionalConfigSwitcher: React.FC<{
  configMode: ConfigSourceMode;
  onChangeMode: (m: ConfigSourceMode) => void;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  compact?: boolean;
}> = ({ configMode, onChangeMode, currency, onChangeCurrency, compact = false }) => {
  return (
    <div className="rounded-[14px] border border-[#E4E9F1] bg-[#F8FAFC] p-3.5 text-xs text-[#10213B]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#10213B]">
                Plan Limits &amp; Currency Selector
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold">
                {configMode === 'SSOT_138_2' ? 'Standard Tiers' : 'Legacy Tiers'}
              </span>
            </div>
            {!compact && (
              <p className="text-[#667085] mt-1 text-[11px]">
                Toggle between Standard Plan entitlements (Free 5 MB · Pro Unlimited checks) and
                Alternate Legacy limits, or preview pricing in USD (\$) or PHP (₱).
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-[10px] bg-white p-0.5 border border-[#E4E9F1]">
            <button
              type="button"
              onClick={() => onChangeMode('SSOT_138_2')}
              className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition ${
                configMode === 'SSOT_138_2'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#667085] hover:text-[#10213B]'
              }`}
            >
              Standard Tiers
            </button>
            <button
              type="button"
              onClick={() => onChangeMode('LEGACY_22_555')}
              className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition ${
                configMode === 'LEGACY_22_555'
                  ? 'bg-[#10213B] text-white'
                  : 'text-[#667085] hover:text-[#10213B]'
              }`}
            >
              Legacy Limits
            </button>
          </div>

          <div className="inline-flex rounded-[10px] bg-white p-0.5 border border-[#E4E9F1]">
            <button
              type="button"
              onClick={() => onChangeCurrency('USD')}
              className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition ${
                currency === 'USD'
                  ? 'bg-[#16A36A] text-white'
                  : 'text-[#667085] hover:text-[#10213B]'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => onChangeCurrency('PHP')}
              className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition ${
                currency === 'PHP'
                  ? 'bg-[#16A36A] text-white'
                  : 'text-[#667085] hover:text-[#10213B]'
              }`}
            >
              PHP (₱)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDemoBanner: React.FC = () => (
  <div className="rounded-[12px] border border-[#E4E9F1] bg-white px-4 py-2.5 text-xs text-[#667085] flex flex-wrap items-center justify-between gap-2 shadow-sm">
    <div className="flex items-center gap-2.5">
      <span className="px-2.5 py-0.5 rounded-full bg-[#FFF4DE] text-[#D99121] font-bold text-[10px] uppercase tracking-wider">
        {ADMIN_BANNER_TEXT.badge}
      </span>
      <span>
        <strong className="text-[#10213B] font-semibold">{ADMIN_BANNER_TEXT.title}</strong>{' '}
        {ADMIN_BANNER_TEXT.body}
      </span>
    </div>
    <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB] font-bold">
      {ADMIN_BANNER_TEXT.engineTag}
    </span>
  </div>
);

export const TicketGateModal: React.FC<{
  entityKey: string;
  onClose: () => void;
  onGrant: (ticketId: string, justification: string) => void;
}> = ({ entityKey, onClose, onGrant }) => {
  const [ticketId, setTicketId] = React.useState('SUP-4902');
  const [justification, setJustification] = React.useState(
    'Customer requested investigation of critical blocking row on Q4 Payroll upload.'
  );
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^SUP-\d{4,6}$/i.test(ticketId.trim())) {
      setError('Support Ticket ID must follow format SUP-XXXX (e.g. SUP-4902).');
      return;
    }
    if (justification.trim().length < 12) {
      setError('Please enter a specific audit justification (at least 12 characters).');
      return;
    }
    onGrant(ticketId.trim().toUpperCase(), justification.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10213B]/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[16px] bg-white border border-[#E4E9F1] p-6 text-[#10213B] shadow-2xl">
        <div className="flex items-center gap-2.5 text-[#D99121] mb-3">
          <div className="w-8 h-8 rounded-[10px] bg-[#FFF4DE] flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#D99121]" />
          </div>
          <h3 className="text-[15px] font-bold text-[#10213B]">
            {ADMIN_SECTIONS_TEXT.ticketModalTitle}
          </h3>
        </div>
        <p className="text-xs text-[#667085] leading-relaxed mb-4">
          Per SheetSentry Security Control #8, raw customer cell values and upload payloads are
          masked by default. Unmasking{' '}
          <strong className="text-[#10213B]">{entityKey}</strong> requires a verified Support Ticket
          ID and writes an immutable entry to the audit log.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#10213B] mb-1">
              Active Support Ticket ID (Format: SUP-XXXX)
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => {
                setTicketId(e.target.value);
                setError('');
              }}
              placeholder="SUP-4902"
              className="w-full rounded-[10px] bg-[#F5F7FB] border border-[#E4E9F1] px-3 py-2 text-sm font-mono text-[#10213B] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#10213B] mb-1">
              Audit Justification (Logged to Immutable Trail)
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                setError('');
              }}
              className="w-full rounded-[10px] bg-[#F5F7FB] border border-[#E4E9F1] px-3 py-2 text-xs text-[#10213B] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {error && (
            <div className="rounded-[10px] bg-[#FDECEC] border border-[#FECACA] p-2.5 text-xs text-[#D84A4A] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[10px] text-xs font-semibold text-[#667085] hover:bg-[#F5F7FB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[10px] text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm"
            >
              Log Ticket & Unmask Data (15m TTL)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Surface-Separated UI Containers & Badges (Higgsfield-Standard Design System Separation)
 */
export const CustomerSurfaceCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'standard' | 'highlighted' | 'elevated';
}> = ({ children, className = '', variant = 'standard' }) => {
  const styles = {
    standard: 'bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm',
    highlighted: 'bg-[#F6F9FF] border border-[#2563EB] rounded-[16px] p-6 shadow-sm',
    elevated: 'bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-md',
  };
  return <div className={`${styles[variant]} ${className}`}>{children}</div>;
};

export const AdminSurfaceCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-xs ${className}`}>
    {children}
  </div>
);

export const FlowSurfaceCard: React.FC<{
  children: React.ReactNode;
  title: string;
  badge?: string;
  accent?: string;
  className?: string;
}> = ({ children, title, badge, accent = '#2563EB', className = '' }) => (
  <div
    style={{ borderTopColor: accent, borderTopWidth: '4px' }}
    className={`bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-sm ${className}`}
  >
    <div className="flex items-center justify-between gap-2 mb-3">
      <h3 className="text-sm font-bold text-[#10213B]">{title}</h3>
      {badge && (
        <span className="px-2 py-0.5 rounded-[5px] bg-[#F1F5F9] text-[#475569] text-[10px] font-mono font-bold">
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

