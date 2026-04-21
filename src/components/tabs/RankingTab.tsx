'use client';

import { useState } from 'react';
import { Heart, Truck, Sparkles, Dumbbell, Flame, Zap, Wrench, LayoutGrid, Paintbrush, Snowflake, Droplets, PaintBucket, Trophy, ChevronRight, TrendingUp, BarChart3, Star } from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import { categories } from '@/lib/categories';
import { getAcademiesByCategory } from '@/lib/data';
import StarRating from '@/components/shared/StarRating';

const iconMap: Record<string, React.ElementType> = {
  Heart, Truck, Sparkles, Dumbbell, Flame, Zap, Wrench, LayoutGrid, Paintbrush, Snowflake, Droplets, PaintBucket,
};

type RankSort = 'passRate' | 'rating' | 'review';

const rankSortOptions: { key: RankSort; label: string; icon: React.ElementType }[] = [
  { key: 'passRate', label: '합격률', icon: TrendingUp },
  { key: 'rating', label: '만족도', icon: Star },
  { key: 'review', label: '후기수', icon: BarChart3 },
];

export default function RankingTab({
  onAcademySelect,
}: {
  onAcademySelect: (id: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState('welding');
  const [rankSort, setRankSort] = useState<RankSort>('passRate');

  const academies = getAcademiesByCategory(selectedCategory);
  const sorted = [...academies].sort((a, b) => {
    switch (rankSort) {
      case 'passRate': return b.passRate - a.passRate;
      case 'rating': return b.avgRating - a.avgRating;
      case 'review': return b.reviewCount - a.reviewCount;
    }
  });

  const selectedCat = categories.find((c) => c.id === selectedCategory);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Title */}
      <div style={{ padding: '4px 20px 16px' }}>
        <h1 style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.black }}>
          랭킹
        </h1>
      </div>

      {/* Category Icons (강남언니 스타일) */}
      <div className="hscroll" style={{ display: 'flex', gap: 16, padding: '0 20px 20px' }}>
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Heart;
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
                minWidth: 56,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: active
                    ? `linear-gradient(145deg, ${cat.color}, ${cat.color}CC)`
                    : `linear-gradient(145deg, ${cat.color}18, ${cat.color}28)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: active
                    ? `0 4px 14px ${cat.color}40`
                    : `0 4px 12px ${cat.color}20, inset 0 1px 1px rgba(255,255,255,0.6)`,
                  border: `1px solid ${active ? cat.color : `${cat.color}15`}`,
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                {/* Glossy highlight */}
                <div style={{
                  position: 'absolute',
                  top: 3,
                  left: 6,
                  right: 6,
                  height: '40%',
                  borderRadius: '12px 12px 50% 50%',
                  background: active
                    ? 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none',
                }} />
                <Icon
                  size={26}
                  color={active ? colors.white : cat.color}
                  strokeWidth={2}
                  style={{ filter: `drop-shadow(0 2px 3px ${active ? 'rgba(0,0,0,0.2)' : `${cat.color}30`})` }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: active ? cat.color : colors['gray-60'],
                  fontWeight: active ? fontWeight.semibold : fontWeight.medium,
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
        {rankSortOptions.map((opt) => {
          const active = rankSort === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setRankSort(opt.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: radius.full,
                border: `1px solid ${active ? colors['orange-40'] : colors['gray-20']}`,
                background: active ? `${colors['orange-40']}10` : colors.white,
                color: active ? colors['orange-40'] : colors['gray-90'],
                fontSize: fontSize.sm,
                fontWeight: active ? fontWeight.semibold : fontWeight.normal,
                cursor: 'pointer',
              }}
            >
              <opt.icon size={13} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Section Title */}
      <div style={{ padding: '0 20px 12px' }}>
        <h2 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
          <span style={{ color: selectedCat?.color || colors['orange-40'] }}>{selectedCat?.name}</span>{' '}
          {rankSort === 'passRate' ? '합격률' : rankSort === 'rating' ? '만족도' : '후기수'} 랭킹
        </h2>
      </div>

      {/* Ranking List */}
      <div style={{ padding: '0 20px' }}>
        {sorted.map((academy, idx) => (
          <div
            key={academy.id}
            onClick={() => onAcademySelect(academy.id)}
            className="press"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 0',
              borderBottom: `1px solid ${colors['gray-10']}`,
              cursor: 'pointer',
            }}
          >
            {/* Rank Number */}
            <div
              style={{
                width: 28,
                fontSize: fontSize.xl,
                fontWeight: fontWeight.bold,
                color: idx < 3 ? colors['orange-40'] : colors['gray-40'],
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {idx + 1}.
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.black, marginBottom: 4 }}>
                {academy.name}
                <ChevronRight size={14} color={colors['gray-40']} style={{ verticalAlign: 'middle', marginLeft: 2 }} />
              </h3>
              <p style={{ fontSize: fontSize.sm, color: colors['gray-60'], marginBottom: 6 }}>
                {academy.shortDescription}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StarRating rating={academy.avgRating} count={academy.reviewCount} size={12} />
                <span style={{ fontSize: fontSize.xs, color: colors.success, fontWeight: fontWeight.semibold }}>
                  합격률 {academy.passRate}%
                </span>
              </div>
            </div>

            {/* Highlight Stat */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: idx < 3 ? colors['orange-40'] : colors.black }}>
                {rankSort === 'passRate'
                  ? `${academy.passRate}%`
                  : rankSort === 'rating'
                  ? academy.avgRating.toFixed(1)
                  : academy.reviewCount}
              </div>
              <div style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
                {rankSort === 'passRate' ? '합격률' : rankSort === 'rating' ? '평점' : '후기'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
