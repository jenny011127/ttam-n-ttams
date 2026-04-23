/**
 * 땀앤땀스 Design Tokens
 * globals.css의 Tailwind 테마와 동기화된 디자인 상수
 * 인라인 스타일에서 하드코딩 대신 이 상수를 사용
 */

// ─── Colors ───
// ⚠️ 키 이름은 orange-XX 유지 (레거시 호환). 실제 값은 Material Blue 스케일.
export const colors = {
  // Material Blue scale (키 이름은 orange- 유지)
  'orange-60': '#0D47A1',  // Blue 900 (darkest)
  'orange-50': '#1565C0',  // Blue 800
  'orange-40': '#2196F3',  // Blue 500 (Key Color, PRIMARY)
  'orange-30': '#42A5F5',  // Blue 400
  'orange-20': '#90CAF9',  // Blue 200
  'orange-10': '#E3F2FD',  // Blue 50 (lightest)

  // Gray scale
  'gray-90': '#5A5E66',
  'gray-60': '#AEB3BC',
  'gray-40': '#C5C8CE',
  'gray-30': '#D9DEE5',
  'gray-20': '#E5E7EB',
  'gray-10': '#F2F4F7',
  'gray-05': '#F8F9FA',

  // Core
  navy: '#1B202C',
  black: '#1D1D1D',
  white: '#FFFFFF',

  // Semantic
  government: '#3B82F6',
  success: '#10B981',
  star: '#FBBF24',
  error: '#EF4444',
} as const;

// ─── Typography ───
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 26,
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

// ─── Spacing ───
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

// ─── Border Radius ───
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Shadows ───
export const shadows = {
  card: '0 2px 8px rgba(27,32,44,0.04), 0 8px 24px rgba(27,32,44,0.03)',
  sm: '0 1px 4px rgba(27,32,44,0.06)',
  md: '0 4px 16px rgba(27,32,44,0.08)',
  lg: '0 8px 32px rgba(27,32,44,0.1)',
} as const;

// ─── Gradients ───
export const gradients = {
  orange: 'linear-gradient(135deg, #2196F3, #42A5F5)', // Material Blue, 키 유지
  navy: 'linear-gradient(135deg, #1B202C, #2D3748)',
  government: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
  header: 'rgba(255,255,255,0.95)',
} as const;
