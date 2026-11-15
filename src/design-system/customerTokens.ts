/**
 * SheetSentry Customer App Design System Tokens
 * Source of Truth: Figma "02 Customer App" (Node 2:2 / 4:51)
 *
 * Isolated surface tokens specifically for customer workspace, spreadsheet validation,
 * rule builder, pre-flight checks, and billing interfaces.
 */

import { CORE_TOKENS } from './tokens';

export const CUSTOMER_TOKENS = {
  surface: 'customer',
  layout: {
    sidebarWidth: '238px',
    topbarHeight: '76px',
    contentMaxWidth: '1440px',
  },
  sidebar: {
    background: '#111F37',
    textPrimary: '#FFFFFF',
    textSecondary: '#D6DFEA',
    textMuted: '#8FA0B9',
    workspaceCard: {
      background: '#1B2D4B',
      border: '#273E63',
      avatarBg: '#DCEBFF',
      avatarText: '#2563EB',
    },
    navItem: {
      defaultBg: 'transparent',
      defaultText: '#D6DFEA',
      hoverBg: '#1B2D4B',
      hoverText: '#FFFFFF',
      activeBg: '#233E65',
      activeText: '#FFFFFF',
      glyphColor: '#AEBBD0',
    },
    planCard: {
      background: '#1B2D4B',
      border: '#273E63',
      tagText: '#9CC0FF',
      progressTrack: '#304766',
      progressFill: '#2563EB',
      ctaText: '#8FBAFF',
      ctaHoverText: '#FFFFFF',
    },
  },
  topbar: {
    background: '#FFFFFF',
    border: '#E4E9F1',
    breadcrumbText: '#667085',
    breadcrumbActive: '#10213B',
    searchBg: '#F5F7FB',
    searchBorder: '#E4E9F1',
    notificationBadge: '#2563EB',
    avatarBg: '#EAF2FF',
    avatarText: '#2563EB',
  },
  canvas: {
    background: '#F5F7FB',
    cardBackground: '#FFFFFF',
    cardBorder: '#E4E9F1',
    cardRadius: '16px',
  },
  cards: {
    standard: 'bg-white border border-[#E4E9F1] rounded-[16px] p-6 shadow-sm',
    compact: 'bg-white border border-[#E4E9F1] rounded-[14px] p-4 shadow-xs',
    elevated: 'bg-white border border-[#E4E9F1] rounded-[18px] p-6 shadow-md',
    interactive: 'bg-white border border-[#E4E9F1] hover:border-[#2563EB] rounded-[16px] p-6 shadow-sm hover:shadow-md transition cursor-pointer',
    highlighted: 'bg-[#F6F9FF] border border-[#2563EB] rounded-[16px] p-6 shadow-sm',
  },
  badges: {
    statusHealthy: 'px-2.5 py-0.5 rounded-full bg-[#E8F7EF] text-[#16A36A] border border-[#B8E6CD] text-[10px] font-bold',
    statusReview: 'px-2.5 py-0.5 rounded-full bg-[#FFF4DE] text-[#D99121] border border-[#FDE68A] text-[10px] font-bold',
    statusBlocked: 'px-2.5 py-0.5 rounded-full bg-[#FDECEC] text-[#D84A4A] border border-[#FECACA] text-[10px] font-bold',
    typeBadge: 'px-2 py-0.5 rounded-[5px] bg-[#F1F5F9] text-[#475569] text-[10px] font-mono font-medium',
    planPill: 'px-2.5 py-1 rounded-[6px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider',
  },
  buttons: {
    primary: 'h-[44px] px-5 rounded-[11px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[13px] inline-flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99]',
    secondary: 'h-[44px] px-5 rounded-[11px] bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B] font-semibold text-[13px] inline-flex items-center justify-center gap-2 transition active:scale-[0.99]',
    danger: 'h-[44px] px-5 rounded-[11px] bg-[#FDECEC] border border-[#FECACA] hover:bg-[#FCDADA] text-[#D84A4A] font-semibold text-[13px] inline-flex items-center justify-center gap-2 transition',
    ghost: 'h-[38px] px-3 rounded-[9px] hover:bg-[#F1F5F9] text-[#667085] hover:text-[#10213B] font-medium text-[12px] inline-flex items-center gap-1.5 transition',
  },
  spreadsheet: {
    gridBorder: '#E2E8F0',
    headerBg: '#F8FAFC',
    headerText: '#475569',
    rowAlternateBg: '#FAFCFF',
    cellHighlightError: 'bg-[#FEF2F2] text-[#991B1B] font-semibold ring-1 ring-inset ring-[#F87171]',
    cellHighlightWarning: 'bg-[#FFFBEB] text-[#92400E] font-medium ring-1 ring-inset ring-[#FBBF24]',
  },
} as const;
