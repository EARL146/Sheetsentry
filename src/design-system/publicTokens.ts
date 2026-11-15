/**
 * SheetSentry Public Website Design System Tokens
 * Source of Truth: Figma "01 Public Website" (Node 1:7 / 3:65)
 *
 * Isolated surface tokens for public marketing pages, landing page hero,
 * feature showcases, interactive spreadsheet previews, and pricing tiers.
 */

export const PUBLIC_TOKENS = {
  surface: 'public',
  layout: {
    headerHeight: '82px',
    maxWidth: '1440px',
    horizontalPadding: 'px-6 lg:px-[100px]',
  },
  header: {
    background: '#FFFFFF',
    border: '#E4E9F1',
    linkDefault: '#667085',
    linkHover: '#10213B',
    linkActive: '#2563EB',
    ctaPrimary: 'h-[44px] px-6 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold inline-flex items-center justify-center shadow-sm transition',
    ctaGhost: 'text-[13px] font-semibold text-[#10213B] hover:text-[#2563EB] transition',
  },
  hero: {
    background: '#FFFFFF',
    border: '#E4E9F1',
    eyebrow: 'inline-flex items-center px-4 h-[30px] rounded-[15px] bg-[#EAF2FF] text-[#2563EB] text-[10px] font-bold uppercase tracking-wider',
    heading: 'text-[38px] sm:text-[48px] lg:text-[52px] font-bold text-[#10213B] leading-[1.08] tracking-tight',
    subheading: 'text-[15px] text-[#667085] leading-[1.6] max-w-[540px]',
    primaryButton: 'h-[54px] px-8 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[13px] inline-flex items-center justify-center shadow-sm transition',
    secondaryButton: 'h-[54px] px-7 rounded-[12px] bg-white border border-[#E4E9F1] hover:border-[#2563EB] text-[#10213B] font-semibold text-[13px] inline-flex items-center justify-center transition',
  },
  previewCard: {
    container: 'bg-white border border-[#E4E9F1] rounded-[22px] overflow-hidden shadow-xl shadow-slate-200/60',
    topbar: 'bg-[#FBFCFE] border-b border-[#E4E9F1] h-[54px] px-5 flex items-center justify-between',
    metricScoreBg: 'bg-[#F6F9FF] border border-[#E4E9F1] rounded-[16px] p-4',
    metricIssuesBg: 'bg-white border border-[#E4E9F1] rounded-[16px] p-4',
    columnRowEven: 'bg-[#FAFBFD]',
    columnRowOdd: 'bg-transparent',
  },
  pricingCards: {
    freeCard: 'rounded-[18px] p-8 border border-[#E4E9F1] bg-white flex flex-col justify-between',
    starterCard: 'rounded-[18px] p-8 border border-[#E4E9F1] bg-white flex flex-col justify-between',
    proCard: 'rounded-[18px] p-8 border border-[#2563EB] bg-[#F3F7FF] shadow-sm flex flex-col justify-between relative',
    popularBadge: 'absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#2563EB] text-white text-[10px] font-bold tracking-wider uppercase',
  },
  footer: {
    background: '#0D1B31',
    border: '#1B2D4B',
    textPrimary: '#FFFFFF',
    textMuted: '#9BB0CD',
    linkHover: '#FFFFFF',
  },
} as const;
