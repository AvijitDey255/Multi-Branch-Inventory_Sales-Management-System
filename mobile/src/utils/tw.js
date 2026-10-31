/**
 * Lightweight & fast Tailwind CSS style parser for React Native.
 * Enables using Tailwind class names across screens with zero bundler errors.
 */

const PALETTE = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  // Slate
  'slate-50': '#F8FAFC',
  'slate-100': '#F1F5F9',
  'slate-200': '#E2E8F0',
  'slate-300': '#CBD5E1',
  'slate-400': '#94A3B8',
  'slate-500': '#64748B',
  'slate-600': '#475569',
  'slate-700': '#334155',
  'slate-800': '#1E293B',
  'slate-900': '#0F172A',
  'slate-950': '#020617',
  // Indigo
  'indigo-50': '#EEF2FF',
  'indigo-100': '#E0E7FF',
  'indigo-500': '#6366F1',
  'indigo-600': '#4F46E5',
  'indigo-700': '#4338CA',
  // Emerald
  'emerald-50': '#ECFDF5',
  'emerald-100': '#D1FAE5',
  'emerald-500': '#10B981',
  'emerald-600': '#059669',
  // Amber
  'amber-50': '#FFFBEB',
  'amber-100': '#FEF3C7',
  'amber-500': '#F59E0B',
  'amber-600': '#D97706',
  // Rose
  'rose-50': '#FFF1F2',
  'rose-100': '#FFE4E6',
  'rose-500': '#F43F5E',
  'rose-600': '#E11D48',
  // Sky
  'sky-50': '#F0F9FF',
  'sky-100': '#E0F2FE',
  'sky-500': '#0EA5E9',
  'sky-600': '#0284C7',
  // Violet
  'violet-500': '#8B5CF6',
  'violet-600': '#7C3AED',
};

const SPACING_MAP = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '10': 40,
  '12': 48,
  '14': 56,
  '15': 60,
  '16': 64,
  '18': 72,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
};

const RADIUS_MAP = {
  none: 0,
  sm: 4,
  DEFAULT: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 28,
  full: 9999,
};

const FONT_SIZE_MAP = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

const FONT_WEIGHT_MAP = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

const styleCache = new Map();

export function tw(classNames) {
  if (!classNames) return {};
  if (styleCache.has(classNames)) return styleCache.get(classNames);

  const tokens = classNames.trim().split(/\s+/);
  const style = {};

  tokens.forEach((token) => {
    // Flexbox
    if (token === 'flex-1') style.flex = 1;
    else if (token === 'flex-row') style.flexDirection = 'row';
    else if (token === 'flex-col') style.flexDirection = 'column';
    else if (token === 'flex-wrap') style.flexWrap = 'wrap';
    else if (token === 'items-center') style.alignItems = 'center';
    else if (token === 'items-start') style.alignItems = 'flex-start';
    else if (token === 'items-end') style.alignItems = 'flex-end';
    else if (token === 'justify-center') style.justifyContent = 'center';
    else if (token === 'justify-between') style.justifyContent = 'space-between';
    else if (token === 'justify-start') style.justifyContent = 'flex-start';
    else if (token === 'justify-end') style.justifyContent = 'flex-end';
    else if (token === 'self-start') style.alignSelf = 'flex-start';
    else if (token === 'self-center') style.alignSelf = 'center';
    else if (token === 'self-end') style.alignSelf = 'flex-end';
    else if (token === 'self-stretch') style.alignSelf = 'stretch';
    else if (token === 'overflow-hidden') style.overflow = 'hidden';

    // Width & Height
    else if (token === 'w-full') style.width = '100%';
    else if (token === 'h-full') style.height = '100%';
    else if (token.startsWith('w-') && SPACING_MAP[token.replace('w-', '')] !== undefined) {
      style.width = SPACING_MAP[token.replace('w-', '')];
    } else if (token.startsWith('h-') && SPACING_MAP[token.replace('h-', '')] !== undefined) {
      style.height = SPACING_MAP[token.replace('h-', '')];
    }

    // Gap
    else if (token.startsWith('gap-') && SPACING_MAP[token.replace('gap-', '')] !== undefined) {
      style.gap = SPACING_MAP[token.replace('gap-', '')];
    }

    // Padding
    else if (token.startsWith('p-') && SPACING_MAP[token.replace('p-', '')] !== undefined) {
      style.padding = SPACING_MAP[token.replace('p-', '')];
    } else if (token.startsWith('px-') && SPACING_MAP[token.replace('px-', '')] !== undefined) {
      style.paddingHorizontal = SPACING_MAP[token.replace('px-', '')];
    } else if (token.startsWith('py-') && SPACING_MAP[token.replace('py-', '')] !== undefined) {
      style.paddingVertical = SPACING_MAP[token.replace('py-', '')];
    } else if (token.startsWith('pt-') && SPACING_MAP[token.replace('pt-', '')] !== undefined) {
      style.paddingTop = SPACING_MAP[token.replace('pt-', '')];
    } else if (token.startsWith('pb-') && SPACING_MAP[token.replace('pb-', '')] !== undefined) {
      style.paddingBottom = SPACING_MAP[token.replace('pb-', '')];
    } else if (token.startsWith('pl-') && SPACING_MAP[token.replace('pl-', '')] !== undefined) {
      style.paddingLeft = SPACING_MAP[token.replace('pl-', '')];
    } else if (token.startsWith('pr-') && SPACING_MAP[token.replace('pr-', '')] !== undefined) {
      style.paddingRight = SPACING_MAP[token.replace('pr-', '')];
    }

    // Margin
    else if (token.startsWith('m-') && SPACING_MAP[token.replace('m-', '')] !== undefined) {
      style.margin = SPACING_MAP[token.replace('m-', '')];
    } else if (token.startsWith('mx-') && SPACING_MAP[token.replace('mx-', '')] !== undefined) {
      style.marginHorizontal = SPACING_MAP[token.replace('mx-', '')];
    } else if (token.startsWith('my-') && SPACING_MAP[token.replace('my-', '')] !== undefined) {
      style.marginVertical = SPACING_MAP[token.replace('my-', '')];
    } else if (token.startsWith('mt-') && SPACING_MAP[token.replace('mt-', '')] !== undefined) {
      style.marginTop = SPACING_MAP[token.replace('mt-', '')];
    } else if (token.startsWith('mb-') && SPACING_MAP[token.replace('mb-', '')] !== undefined) {
      style.marginBottom = SPACING_MAP[token.replace('mb-', '')];
    }

    // Background color: bg-slate-900, bg-indigo-500, etc.
    else if (token.startsWith('bg-')) {
      const colorKey = token.replace('bg-', '');
      if (PALETTE[colorKey]) {
        style.backgroundColor = PALETTE[colorKey];
      }
    }

    // Text color: text-white, text-slate-500, etc.
    else if (token.startsWith('text-')) {
      const textKey = token.replace('text-', '');
      if (PALETTE[textKey]) {
        style.color = PALETTE[textKey];
      } else if (FONT_SIZE_MAP[textKey]) {
        style.fontSize = FONT_SIZE_MAP[textKey];
      } else if (textKey === 'center') style.textAlign = 'center';
      else if (textKey === 'left') style.textAlign = 'left';
      else if (textKey === 'right') style.textAlign = 'right';
    }

    // Font weight
    else if (token.startsWith('font-')) {
      const weightKey = token.replace('font-', '');
      if (FONT_WEIGHT_MAP[weightKey]) {
        style.fontWeight = FONT_WEIGHT_MAP[weightKey];
      }
    }

    // Border Radius
    else if (token === 'rounded') style.borderRadius = RADIUS_MAP.DEFAULT;
    else if (token.startsWith('rounded-')) {
      const radKey = token.replace('rounded-', '');
      if (RADIUS_MAP[radKey] !== undefined) {
        style.borderRadius = RADIUS_MAP[radKey];
      }
    }

    // Borders
    else if (token === 'border') {
      style.borderWidth = 1;
    } else if (token === 'border-2') {
      style.borderWidth = 2;
    } else if (token === 'border-b') {
      style.borderBottomWidth = 1;
    } else if (token === 'border-t') {
      style.borderTopWidth = 1;
    } else if (token.startsWith('border-')) {
      const bColor = token.replace('border-', '');
      if (PALETTE[bColor]) {
        style.borderColor = PALETTE[bColor];
      }
    }

    // Shadows
    else if (token === 'shadow-sm') {
      style.shadowColor = '#000';
      style.shadowOffset = { width: 0, height: 1 };
      style.shadowOpacity = 0.05;
      style.shadowRadius = 2;
      style.elevation = 1;
    } else if (token === 'shadow-md') {
      style.shadowColor = '#000';
      style.shadowOffset = { width: 0, height: 3 };
      style.shadowOpacity = 0.1;
      style.shadowRadius = 6;
      style.elevation = 3;
    } else if (token === 'shadow-lg') {
      style.shadowColor = '#000';
      style.shadowOffset = { width: 0, height: 6 };
      style.shadowOpacity = 0.15;
      style.shadowRadius = 12;
      style.elevation = 6;
    }
  });

  styleCache.set(classNames, style);
  return style;
}

export default tw;
