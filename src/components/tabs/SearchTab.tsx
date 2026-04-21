'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import { categories } from '@/lib/categories';
import { allAcademies, getAcademiesByCategory } from '@/lib/data';
import AcademyCard from '@/components/shared/AcademyCard';
import type { Academy } from '@/types';

type SortKey = 'recommend' | 'passRate' | 'rating' | 'review';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'recommend', label: '추천순' },
  { key: 'passRate', label: '합격률순' },
  { key: 'rating', label: '평점순' },
  { key: 'review', label: '후기순' },
];

function sortAcademies(academies: Academy[], sort: SortKey): Academy[] {
  const arr = [...academies];
  switch (sort) {
    case 'passRate': return arr.sort((a, b) => b.passRate - a.passRate);
    case 'rating': return arr.sort((a, b) => b.avgRating - a.avgRating);
    case 'review': return arr.sort((a, b) => b.reviewCount - a.reviewCount);
    default: return arr;
  }
}

export default function SearchTab({
  onAcademySelect,
  initialCategory,
  initialQuery,
}: {
  onAcademySelect: (id: string) => void;
  initialCategory?: string;
  initialQuery?: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [sort, setSort] = useState<SortKey>('recommend');
  const [govOnly, setGovOnly] = useState(false);
  const [searchText, setSearchText] = useState(initialQuery || '');

  let filtered = selectedCategory
    ? getAcademiesByCategory(selectedCategory)
    : allAcademies;

  if (govOnly) {
    filtered = filtered.filter((a) => a.isGovernmentFunded);
  }

  if (searchText) {
    const q = searchText.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.includes(q) ||
        a.shortDescription.includes(q) ||
        a.addressShort.includes(q)
    );
  }

  const sorted = sortAcademies(filtered, sort);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Search Bar */}
      <div style={{ padding: '0 20px 12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: colors['gray-05'],
            borderRadius: radius.xl,
            padding: '10px 16px',
            border: `1px solid ${colors['gray-20']}`,
          }}
        >
          <Search size={18} color={colors['gray-40']} />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="학원명, 지역으로 검색"
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: fontSize.md,
              color: colors.black,
            }}
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="hscroll" style={{ display: 'flex', gap: 8, padding: '0 20px 12px' }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: radius.full,
            border: `1px solid ${!selectedCategory ? colors['orange-40'] : colors['gray-20']}`,
            background: !selectedCategory ? colors['orange-40'] : colors.white,
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
              border: `1px solid ${selectedCategory === cat.id ? colors['orange-40'] : colors['gray-20']}`,
              background: selectedCategory === cat.id ? colors['orange-40'] : colors.white,
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

      {/* Filters Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: fontSize.xs,
                  color: sort === opt.key ? colors['orange-40'] : colors['gray-60'],
                  fontWeight: sort === opt.key ? fontWeight.semibold : fontWeight.normal,
                  padding: '4px 2px',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Government Toggle */}
        <button
          onClick={() => setGovOnly(!govOnly)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: govOnly ? '#EFF6FF' : 'none',
            border: `1px solid ${govOnly ? colors.government : colors['gray-30']}`,
            borderRadius: radius.full,
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: fontSize.xs,
            color: govOnly ? colors.government : colors['gray-60'],
            fontWeight: govOnly ? fontWeight.semibold : fontWeight.normal,
          }}
        >
          국비지원
        </button>
      </div>

      {/* Results Count */}
      <div style={{ padding: '0 20px 8px' }}>
        <span style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>
          총 <span style={{ color: colors.black, fontWeight: fontWeight.semibold }}>{sorted.length}</span>개 학원
        </span>
      </div>

      {/* Academy List */}
      <div style={{ padding: '0 20px' }}>
        {sorted.map((academy) => (
          <AcademyCard
            key={academy.id}
            academy={academy}
            variant="horizontal"
            onClick={() => onAcademySelect(academy.id)}
          />
        ))}
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: colors['gray-60'] }}>
            <p style={{ fontSize: fontSize.md }}>검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
