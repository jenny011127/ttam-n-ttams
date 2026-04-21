'use client';

import { useState } from 'react';
import { Star, ThumbsUp, BadgeCheck } from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import { categories } from '@/lib/categories';
import { allReviews, getAcademyById } from '@/lib/data';
import StarRating from '@/components/shared/StarRating';
import type { Review } from '@/types';

export default function ReviewTab() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'helpful' | 'recent'>('helpful');

  let filtered = [...allReviews];

  if (selectedCategory) {
    const categoryAcademyPrefix = {
      'care-worker': 'cw-',
      'korean-cooking': 'kc-',
      'forklift': 'fl-',
      'baking': 'bk-',
      'beauty-nail': 'bn-',
      'pilates-yoga': 'py-',
      'welding': 'wl-',
      'electrician': 'el-',
    }[selectedCategory];
    if (categoryAcademyPrefix) {
      filtered = filtered.filter((r) => r.academyId.startsWith(categoryAcademyPrefix));
    }
  }

  filtered.sort((a, b) =>
    sortBy === 'helpful'
      ? b.helpfulCount - a.helpfulCount
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 16px' }}>
        <h1 style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.black }}>
          후기
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSortBy('helpful')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: fontSize.sm,
              color: sortBy === 'helpful' ? colors['orange-40'] : colors['gray-60'],
              fontWeight: sortBy === 'helpful' ? fontWeight.semibold : fontWeight.normal,
            }}
          >
            추천순
          </button>
          <span style={{ color: colors['gray-30'] }}>|</span>
          <button
            onClick={() => setSortBy('recent')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: fontSize.sm,
              color: sortBy === 'recent' ? colors['orange-40'] : colors['gray-60'],
              fontWeight: sortBy === 'recent' ? fontWeight.semibold : fontWeight.normal,
            }}
          >
            최신순
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="hscroll" style={{ display: 'flex', gap: 8, padding: '0 20px 16px' }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: radius.full,
            border: `1px solid ${!selectedCategory ? colors.black : colors['gray-20']}`,
            background: !selectedCategory ? colors.black : colors.white,
            color: !selectedCategory ? colors.white : colors['gray-90'],
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
            cursor: 'pointer',
          }}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? '' : cat.id)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: radius.full,
              border: `1px solid ${selectedCategory === cat.id ? colors.black : colors['gray-20']}`,
              background: selectedCategory === cat.id ? colors.black : colors.white,
              color: selectedCategory === cat.id ? colors.white : colors['gray-90'],
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Review Cards */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map((review) => {
          const academy = getAcademyById(review.academyId);
          return (
            <ReviewCard key={review.id} review={review} academyName={academy?.name} />
          );
        })}
      </div>
    </div>
  );
}

function ReviewCard({ review, academyName }: { review: Review; academyName?: string }) {
  return (
    <div
      style={{
        background: colors.white,
        borderRadius: radius.lg,
        border: `1px solid ${colors['gray-10']}`,
        padding: 18,
      }}
    >
      {/* Author + Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: colors['gray-10'],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
            }}
          >
            👤
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.black }}>
                {review.authorName}
              </span>
              {review.isVerified && (
                <BadgeCheck size={14} color={colors.government} fill={colors.government} strokeWidth={0} />
              )}
            </div>
            <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
              {review.authorAgeGroup} · {review.certificationName}
            </span>
          </div>
        </div>
        <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
          {review.createdAt}
        </span>
      </div>

      {/* Academy Name */}
      {academyName && (
        <div style={{ fontSize: fontSize.xs, color: colors['gray-60'], marginBottom: 8 }}>
          📍 {academyName}
        </div>
      )}

      {/* Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <StarRating rating={review.rating} showCount={false} />
        {review.passed && (
          <span style={{
            fontSize: 11,
            fontWeight: fontWeight.bold,
            color: colors.success,
            background: '#ECFDF5',
            padding: '2px 8px',
            borderRadius: 4,
          }}>
            합격
          </span>
        )}
      </div>

      {/* Content */}
      <h4 style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.black, marginBottom: 6 }}>
        {review.title}
      </h4>
      <p style={{ fontSize: fontSize.base, color: colors['gray-90'], lineHeight: 1.6, marginBottom: 12 }}>
        {review.content}
      </p>

      {/* Sub Ratings */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { label: '커리큘럼', value: review.ratingCurriculum },
          { label: '강사', value: review.ratingInstructor },
          { label: '시설', value: review.ratingFacility },
          { label: '가성비', value: review.ratingValue },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>{label}</span>
            <Star size={10} fill={colors.star} color={colors.star} />
            <span style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.black }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Helpful */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: colors['gray-05'],
            border: `1px solid ${colors['gray-20']}`,
            borderRadius: radius.full,
            padding: '5px 12px',
            cursor: 'pointer',
            fontSize: fontSize.xs,
            color: colors['gray-90'],
          }}
        >
          <ThumbsUp size={12} />
          도움돼요 {review.helpfulCount}
        </button>
      </div>
    </div>
  );
}
