/**
 * SheetSentry Core Design Tokens
 * Source of Truth: Figma "00 Foundations" (Node 0:1) & "01 Public Website" (Node 1:7)
 */

export const CORE_TOKENS = {
  colors: {
    brand: {
      primary: '#2563EB',      // Primary Blue
      primaryHover: '#1D4ED8', // Darker Blue
      light: '#EAF2FF',        // Subtle Blue Fill
      border: '#BFDBFE',       // Subtle Blue Border
      accentNavy: '#10213B',   // Deep Blue Text/Heading
      accentDark: '#0D1B31',   // Dark Navbar/Footer
    },
    neutral: {
      canvas: '#F5F7FB',       // Global Canvas Light
      white: '#FFFFFF',
      cardBorder: '#E4E9F1',   // Standard Card Border
      subtleBorder: '#EDF2F7',
      textPrimary: '#10213B',  // Headings & Primary Text
      textSecondary: '#667085',// Body & Descriptive Text
      textMuted: '#94A3B8',    // Inactive & Placeholders
      textLight: '#AEBBD0',    // Light text on dark bg
    },
    semantic: {
      success: '#16A36A',
      successLight: '#E8F7EF',
      successBorder: '#B8E6CD',
      warning: '#D99121',
      warningLight: '#FFF4DE',
      warningBorder: '#FDE68A',
      danger: '#D84A4A',
      dangerLight: '#FDECEC',
      dangerBorder: '#FECACA',
      info: '#2563EB',
      infoLight: '#EAF2FF',
      infoBorder: '#BFDBFE',
    },
  },
  typography: {
    fontFamilies: {
      sans: "'DM Sans', 'Inter', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
  },
  radii: {
    xs: '6px',
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '14px',
    '2xl': '18px',
    '3xl': '22px',
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px rgba(16, 33, 59, 0.04)',
    sm: '0 2px 4px rgba(16, 33, 59, 0.06)',
    md: '0 4px 12px rgba(16, 33, 59, 0.08)',
    lg: '0 10px 24px rgba(16, 33, 59, 0.10)',
    xl: '0 20px 40px rgba(16, 33, 59, 0.12)',
  },
} as const;
