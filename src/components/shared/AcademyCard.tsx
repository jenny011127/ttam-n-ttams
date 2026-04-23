'use client';

import { BadgeCheck, Briefcase, Heart, Truck, Sparkles, Flame, Zap, Wrench, LayoutGrid, Paintbrush, Snowflake, Droplets, PaintBucket } from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import StarRating from './StarRating';
import type { Academy } from '@/types';

const categoryTheme: Record<string, { color: string; Icon: typeof Heart }> = {
  'welding': { color: '#EF4444', Icon: Flame },
  'plumbing': { color: '#8B5CF6', Icon: Wrench },
  'electrician': { color: '#3B82F6', Icon: Zap },
  'tiling': { color: '#F59E0B', Icon: LayoutGrid },
  'wallpaper': { color: '#78716C', Icon: Paintbrush },
  'hvac': { color: '#06B6D4', Icon: Snowflake },
  'forklift': { color: '#6B7280', Icon: Truck },
  'waterproof': { color: '#0EA5E9', Icon: Droplets },
  'painting': { color: '#D946EF', Icon: PaintBucket },
  'care-worker': { color: '#FF6B6B', Icon: Heart },
  'beauty-nail': { color: '#EC4899', Icon: Sparkles },
};

function Thumbnail({ src, categoryId, size }: { src: string; categoryId: string; size: { w: number; h: number } }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{
          width: size.w,
          height: size.h,
          borderRadius: radius.md,
          objectFit: 'cover',
        }}
      />
    );
  }
  const theme = categoryTheme[categoryId] || { color: colors['gray-40'], Icon: Heart };
  const CatIcon = theme.Icon;
  return (
    <div
      style={{
        width: size.w,
        height: size.h,
        borderRadius: radius.md,
        background: `linear-gradient(135deg, ${theme.color}18, ${theme.color}30)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CatIcon size={size.w > 120 ? 36 : 28} color={theme.color} strokeWidth={1.5} />
    </div>
  );
}

export default function AcademyCard({
  academy,
  onClick,
  variant = 'vertical',
}: {
  academy: Academy;
  onClick?: () => void;
  variant?: 'vertical' | 'horizontal';
}) {
  if (variant === 'horizontal') {
    return (
      <div
        onClick={onClick}
        className="press"
        style={{
          display: 'flex',
          gap: 14,
          padding: '16px 0',
          borderBottom: `1px solid ${colors['gray-10']}`,
        }}
      >
        {/* Thumbnail */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <Thumbnail src={academy.thumbnail} categoryId={academy.categoryId} size={{ w: 100, h: 100 }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            {academy.isVerified && (
              <BadgeCheck size={14} color={colors.government} fill={colors.government} strokeWidth={0} style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontSize: fontSize.xs, color: colors['gray-60'], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {academy.addressShort}
            </span>
          </div>

          <h3 style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.black, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {academy.name}
          </h3>

          <p style={{ fontSize: fontSize.xs, color: colors['gray-60'], marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {academy.shortDescription}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StarRating rating={academy.avgRating} count={academy.reviewCount} />
            {academy.isGovernmentFunded && (
              <span
                style={{
                  fontSize: fontSize.xs,
                  color: colors.government,
                  background: '#EFF6FF',
                  padding: '2px 6px',
                  borderRadius: radius.sm,
                  fontWeight: fontWeight.medium,
                }}
              >
                국비지원
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semibold }}>
              합격률 {academy.passRate}%
            </span>
            {academy.hasEmploymentSupport && (
              <span style={{ fontSize: fontSize.xs, color: colors['gray-60'], display: 'flex', alignItems: 'center', gap: 2 }}>
                <Briefcase size={10} />
                취업지원
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vertical card (for horizontal scroll)
  return (
    <div
      onClick={onClick}
      className="press"
      style={{
        width: 200,
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          height: 130,
          borderRadius: radius.md,
          marginBottom: 10,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Thumbnail src={academy.thumbnail} categoryId={academy.categoryId} size={{ w: 200, h: 130 }} />
        {academy.isGovernmentFunded && (
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: colors.government,
              color: colors.white,
              fontSize: 10,
              fontWeight: fontWeight.bold,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            국비
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
        {academy.isVerified && (
          <BadgeCheck size={13} color={colors.government} fill={colors.government} strokeWidth={0} />
        )}
        <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
          {academy.addressShort} · {academy.name.slice(0, 6)}
        </span>
      </div>

      <h3 style={{
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.black,
        marginBottom: 4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {academy.shortDescription}
      </h3>

      <StarRating rating={academy.avgRating} count={academy.reviewCount} size={13} />

      <div style={{ marginTop: 4 }}>
        <span style={{ fontSize: fontSize.sm, color: colors.success, fontWeight: fontWeight.semibold }}>
          합격률 {academy.passRate}%
        </span>
      </div>
    </div>
  );
}
