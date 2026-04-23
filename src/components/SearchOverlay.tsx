'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, Search, X, ChevronDown,
  Heart, ChefHat, Truck, Cake, Sparkles, Dumbbell, Flame, Zap,
} from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import { categories } from '@/lib/categories';
import { allAcademies, allCourses } from '@/lib/data';

const iconMap: Record<string, React.ElementType> = {
  Heart, ChefHat, Truck, Cake, Sparkles, Dumbbell, Flame, Zap,
};

// 검색 가능한 키워드 목록 (자동완성용)
const searchableTerms: string[] = [
  ...categories.map((c) => c.name),
  ...allAcademies.map((a) => a.name),
  ...allAcademies.map((a) => a.shortDescription),
  ...allCourses.map((c) => c.name),
  '국비지원', '내일배움카드', '취업지원', '야간반', '주말반', '속성반',
  '서울', '경기', '부산', '대구', '인천', '대전', '울산',
  '요양보호사', '지게차', '용접', '전기', '배관', '타일', '도배', '냉동',
];

// 중복 제거 + 정렬
const uniqueTerms = [...new Set(searchableTerms)].sort();

const RECENT_SEARCHES_KEY = 'ttam-recent-searches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  const recent = getRecentSearches().filter((t) => t !== term);
  recent.unshift(term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, 10)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

export default function SearchOverlay({
  onClose,
  onSearch,
  onCategorySelect,
}: {
  onClose: () => void;
  onSearch: (query: string) => void;
  onCategorySelect: (categoryId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    // 오버레이 열릴 때 인풋 자동 포커스
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const suggestions = query.length > 0
    ? uniqueTerms.filter((t) => t.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  const handleSubmit = (term: string) => {
    if (!term.trim()) return;
    saveRecentSearch(term.trim());
    onSearch(term.trim());
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRemoveRecent = (term: string) => {
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // 검색어 하이라이트 렌더
  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: colors['orange-40'], fontWeight: fontWeight.semibold }}>
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const showSuggestions = query.length > 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: colors.white,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top: Back + Input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${colors['gray-10']}` }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
          <ChevronLeft size={24} color={colors.black} />
        </button>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: colors['gray-05'],
            borderRadius: radius.xl,
            padding: '10px 14px',
          }}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(query); }}
            placeholder="자격증, 학원명을 입력해보세요"
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: fontSize.md,
              color: colors.black,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X size={18} color={colors['gray-40']} />
            </button>
          )}
        </div>
      </div>

      {/* Region Filter */}
      <div style={{ padding: '10px 20px 0' }}>
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 12px',
            borderRadius: radius.full,
            border: `1px solid ${colors['gray-20']}`,
            background: colors.white,
            fontSize: fontSize.sm,
            color: colors['gray-90'],
            cursor: 'pointer',
          }}
        >
          지역 <ChevronDown size={14} color={colors['gray-40']} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {showSuggestions ? (
          /* ─── Autocomplete Suggestions ─── */
          <div>
            {suggestions.map((term, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(term)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '14px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: `1px solid ${colors['gray-10']}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Search size={18} color={colors['gray-40']} />
                <span style={{ fontSize: fontSize.md, color: colors.black }}>
                  {highlightMatch(term, query)}
                </span>
              </button>
            ))}
            {suggestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: colors['gray-60'] }}>
                <Search size={24} color={colors['gray-30']} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: fontSize.md }}>&apos;{query}&apos; 검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        ) : (
          /* ─── Default: Recent + Categories ─── */
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black }}>최근검색어</h3>
                  <button
                    onClick={handleClearRecent}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: fontSize.sm, color: colors['gray-60'] }}
                  >
                    전체 삭제
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 12px',
                        borderRadius: radius.full,
                        border: `1px solid ${colors['gray-20']}`,
                        background: colors.white,
                      }}
                    >
                      <button
                        onClick={() => handleSubmit(term)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: fontSize.sm, color: colors.black }}
                      >
                        {term}
                      </button>
                      <button
                        onClick={() => handleRemoveRecent(term)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                      >
                        <X size={13} color={colors['gray-40']} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div>
              <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black, marginBottom: 16 }}>카테고리로 찾기</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {categories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Heart;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onCategorySelect(cat.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          border: `1px solid ${colors['gray-20']}`,
                          background: colors.white,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={24} color={colors['gray-60']} strokeWidth={1.5} />
                      </div>
                      <span style={{ fontSize: fontSize.xs, color: colors.black, fontWeight: fontWeight.medium, textAlign: 'center', lineHeight: 1.3 }}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular Searches */}
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black, marginBottom: 12 }}>인기 검색어</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['요양보호사', '지게차', '전기기능사', '용접기능사', '국비지원', '배관기능사', '타일기능사', '도배기능사'].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSubmit(term)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: radius.full,
                      border: `1px solid ${colors['gray-20']}`,
                      background: colors['gray-05'],
                      fontSize: fontSize.sm,
                      color: colors.black,
                      cursor: 'pointer',
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
