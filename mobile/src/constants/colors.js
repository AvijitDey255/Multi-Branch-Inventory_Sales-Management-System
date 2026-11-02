/**
 * Professional Color Palette for Enterprise Inventory & Sales Management
 * Supports both Light and Dark themes
 */

export const lightColors = {
  // Brand Colors
  primary: '#1E40AF',       // Deep Royal Blue
  primaryDark: '#1E3A8A',   // Navy Dark
  primaryLight: '#3B82F6',  // Vivid Blue
  primaryMuted: '#EFF6FF',  // Blue Tint background
  
  // Secondary & Accents
  secondary: '#0F172A',     // Slate 900
  secondaryLight: '#334155',// Slate 700
  accent: '#0D9488',        // Teal Accent
  accentLight: '#F0FDFA',   // Teal Tint
  
  // Neutral & Surfaces
  background: '#F8FAFC',    // Off-white / light slate background
  surface: '#FFFFFF',       // Card and modal white
  surfaceAlt: '#F1F5F9',    // Light gray container
  border: '#E2E8F0',        // Subtle border gray
  borderDark: '#CBD5E1',    // Stronger divider gray
  
  // Typography
  textPrimary: '#0F172A',   // Near black for high contrast headings
  textSecondary: '#475569', // Muted text for labels and captions
  textMuted: '#94A3B8',     // Subdued placeholders and hints
  textInverse: '#FFFFFF',   // White text on dark elements
  
  // Status Colors
  success: '#10B981',       // Emerald Green
  successLight: '#ECFDF5',  // Emerald Green Tint
  warning: '#F59E0B',       // Amber Warning
  warningLight: '#FFFBEB',  // Amber Tint
  danger: '#EF4444',        // Crimson Red
  dangerLight: '#FEF2F2',   // Red Tint
  info: '#0284C7',          // Sky Blue
  infoLight: '#F0F9FF',     // Sky Blue Tint

  // Role Badge Highlights
  roleAdmin: '#6366F1',     // Indigo for Admin
  roleBranch: '#0D9488',    // Teal for Branch Manager
  roleSales: '#F59E0B',     // Amber for Salesman
  roleCustomer: '#0284C7',  // Sky for Customer
  
  // Shadows & Overlays
  overlay: 'rgba(15, 23, 42, 0.65)',
  shadowColor: '#0F172A',
  statusBar: 'dark',
};

export const darkColors = {
  // Brand Colors
  primary: '#3B82F6',       // Brighter Blue for high contrast in dark mode
  primaryDark: '#1D4ED8',
  primaryLight: '#60A5FA',
  primaryMuted: '#1E293B',  // Dark slate container
  
  // Secondary & Accents
  secondary: '#F8FAFC',
  secondaryLight: '#94A3B8',
  accent: '#14B8A6',
  accentLight: '#134E4A',
  
  // Neutral & Surfaces
  background: '#0B0F19',    // Deep dark background
  surface: '#151C2C',       // Elevated dark card
  surfaceAlt: '#1E293B',    // Dark container
  border: '#27354A',        // Subtle dark border
  borderDark: '#334155',
  
  // Typography
  textPrimary: '#F8FAFC',   // Clean bright white/slate
  textSecondary: '#94A3B8', // Muted light slate
  textMuted: '#64748B',     // Subdued placeholders
  textInverse: '#0B0F19',   // Inverted text
  
  // Status Colors
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  info: '#38BDF8',
  infoLight: '#0C4A6E',

  // Role Badge Highlights
  roleAdmin: '#818CF8',
  roleBranch: '#2DD4BF',
  roleSales: '#FB923C',
  roleCustomer: '#38BDF8',
  
  // Shadows & Overlays
  overlay: 'rgba(0, 0, 0, 0.85)',
  shadowColor: '#000000',
  statusBar: 'light',
};

// Default export for backward compatibility
export const colors = lightColors;

// Helper function to get theme colors
export const getThemeColors = (theme = 'light') =>
  theme === 'dark' ? darkColors : lightColors;
