'use client';

import { Star } from 'lucide-react';
import { colors, fontSize } from '@/lib/design-tokens';

export default function StarRating({
  rating,
  count,
  size = 14,
  showCount = true,
}: {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Star size={size} fill={colors.star} color={colors.star} />
      <span style={{ fontSize: fontSize.sm, fontWeight: 600, color: colors.black }}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
