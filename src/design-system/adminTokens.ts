/**
 * SheetSentry Admin Console Design System Tokens
 * Source of Truth: Figma "03 Admin Console" (Node 2:3 / 4:432)
 *
 * Isolated surface tokens specifically for platform administration, dual-currency ledger,
 * storage quotas, RBAC permissions, and security audit logs.
 */

export const ADMIN_TOKENS = {
  surface: 'admin',
  layout: {
    sidebarWidth: '238px',
    topbarHeight: '72px',
    contentMaxWidth: '1440px',
  },
  sidebar: {
    background: '#101C32',      // Deep midnight distinct from customer #111F37
    textPrimary: '#FFFFFF',
    textSecondary: '#C8D5E5',
    textMuted: '#7D8FA8',
    portalBadge: {
      background: '#23324C',
      text: '#98B3D6',
      border: '#334768',
    },
    navItem: {
      defaultBg: 'transparent',
      defaultText: '#C8D5E5',
      hoverBg: '#182740',
      hoverText: '#FFFFFF',
      activeBg: '#1E3252',
      activeText: '#FFFFFF',
      glyphColor: '#98A9BF',
    },
    systemStatusCard: {
      background: '#182740',
      border: '#2A3F61',
      dotColor: '#16A36A',
      titleColor: '#FFFFFF',
      subtitleColor: '#98A9BF',
    },
  },
  topbar: {
    background: '#FFFFFF',
    border: '#E4E9F1',
    connectionsPill: {
      background: '#F0FDF4',
      text: '#16A36A',
      border: '#BBF7D0',
      dot: '#16A36A',
    },
    demoIndicator: {
      background: '#FFF4DE',
      text: '#D99121',
      border: '#FDE68A',
    },
    environmentPill: {
      background: '#F1F5F9',
      text: '#334155',
      border: '#CBD5E1',
    },
  },
  canvas: {
    background: '#F5F7FB',
    cardBackground: '#FFFFFF',
    cardBorder: '#E4E9F1',
    cardRadius: '14px',
  },
  kpiCards: {
    container: 'bg-white border border-[#E4E9F1] rounded-[14px] p-5 shadow-xs',
    valueText: 'text-[26px] font-bold text-[#10213B] leading-none mt-2 font-mono sm:font-sans',
    dotSize: 'w-[6px] h-[6px] rounded-full',
  },
  tables: {
    container: 'bg-white border border-[#E4E9F1] rounded-[16px] overflow-hidden shadow-xs',
    headerRow: 'bg-[#FBFCFE] border-b border-[#E4E9F1] px-5 py-3 text-[11px] font-bold text-[#667085] uppercase tracking-wider',
    dataRow: 'border-b border-[#E4E9F1] hover:bg-[#F8FAFC] transition px-5 py-3.5 text-[12px] text-[#10213B]',
    amountMono: 'font-mono text-[12px] font-semibold text-[#10213B]',
  },
  rbacRoles: {
    superAdmin: 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]',
    opsLead: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    complianceAuditor: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    billingAdmin: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
    supportSpecialist: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
  },
  dangerZone: {
    container: 'bg-[#FFF5F5] border border-[#FED7D7] rounded-[14px] p-5',
    button: 'h-[40px] px-4 rounded-[10px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[12px] font-semibold transition',
  },
} as const;
