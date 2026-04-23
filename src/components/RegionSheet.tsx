'use client';

import { useState, useMemo } from 'react';
import { X, Search, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import { REGION_GROUPS, ALL_REGION, getLabelForRegionId } from '@/lib/regions';

interface Props {
  open: boolean;
  selectedRegionId: string;
  onClose: () => void;
  onSelect: (regionId: string) => void;
}

export default function RegionSheet({ open, selectedRegionId, onClose, onSelect }: Props) {
  const [expanded, setExpanded] = useState<string[]>(['seoul', 'gyeonggi']);
  const [query, setQuery] = useState('');

  const flatOptions = useMemo(() => {
    const items: { id: string; label: string; full: string }[] = [];
    items.push({ id: ALL_REGION.id, label: ALL_REGION.label, full: '전국' });
    REGION_GROUPS.forEach(g => {
      if (g.expandable) {
        items.push({ id: `${g.id}-all`, label: `${g.label} 전체`, full: `${g.label} 전체` });
        g.districts.forEach(d => {
          items.push({ id: d.id, label: d.label, full: `${g.label} ${d.label}` });
        });
      } else {
        items.push({ id: g.id, label: g.label, full: g.label });
      }
    });
    return items;
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return flatOptions.filter(o => o.full.toLowerCase().includes(q) || o.label.toLowerCase().includes(q));
  }, [query, flatOptions]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelect = (regionId: string) => {
    onSelect(regionId);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.45)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
      `}</style>

      {/* Bottom Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        zIndex: 9999,
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px 12px',
          borderBottom: `1px solid ${colors['gray-10']}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: colors.black }}>
              어디 지역에서 볼까요?
            </h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <X size={22} color={colors['gray-60']} />
            </button>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: colors['gray-05'],
            borderRadius: radius.lg,
            padding: '10px 14px',
            border: `1px solid ${colors['gray-10']}`,
          }}>
            <Search size={16} color={colors['gray-40']} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="동네·지역 이름 검색 (예: 강남, 화성)"
              style={{
                flex: 1, border: 'none', background: 'none', outline: 'none',
                fontSize: fontSize.sm, color: colors.black,
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={14} color={colors['gray-40']} />
              </button>
            )}
          </div>
        </div>

        {/* Selected Display */}
        <div style={{
          padding: '12px 20px',
          background: `${colors['orange-40']}10`,
          borderBottom: `1px solid ${colors['gray-10']}`,
          fontSize: fontSize.sm,
          color: colors['orange-50'],
          fontWeight: fontWeight.semibold,
        }}>
          현재 선택: {getLabelForRegionId(selectedRegionId)}
        </div>

        {/* Region List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {query.trim() ? (
            /* Search Results */
            <div style={{ padding: '0 8px' }}>
              {searchResults.length === 0 ? (
                <p style={{ padding: '24px', textAlign: 'center', color: colors['gray-60'], fontSize: fontSize.sm }}>
                  검색 결과가 없어요
                </p>
              ) : (
                searchResults.map(opt => (
                  <RegionRow
                    key={opt.id}
                    label={opt.full}
                    selected={selectedRegionId === opt.id}
                    onClick={() => handleSelect(opt.id)}
                  />
                ))
              )}
            </div>
          ) : (
            /* Grouped List */
            <div style={{ padding: '0 8px' }}>
              {/* 전국 */}
              <RegionRow
                emoji="🌏"
                label="전국 전체"
                selected={selectedRegionId === 'all'}
                onClick={() => handleSelect('all')}
              />

              {REGION_GROUPS.map(group => {
                const isExpanded = expanded.includes(group.id);
                if (!group.expandable) {
                  return (
                    <RegionRow
                      key={group.id}
                      emoji={group.emoji}
                      label={group.label}
                      selected={selectedRegionId === group.id}
                      onClick={() => handleSelect(group.id)}
                    />
                  );
                }
                return (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleExpand(group.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '14px 12px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: fontSize.md, fontWeight: fontWeight.semibold,
                        color: colors.black,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="tossface" style={{ fontSize: 18, lineHeight: 1 }}>{group.emoji}</span>
                        {group.label}
                      </span>
                      {isExpanded ? <ChevronUp size={18} color={colors['gray-60']} /> : <ChevronDown size={18} color={colors['gray-60']} />}
                    </button>
                    {isExpanded && (
                      <div style={{ paddingLeft: 12 }}>
                        <RegionRow
                          label={`전체 ${group.label}`}
                          selected={selectedRegionId === `${group.id}-all`}
                          onClick={() => handleSelect(`${group.id}-all`)}
                          size="sm"
                        />
                        {group.districts.map(d => (
                          <RegionRow
                            key={d.id}
                            label={d.label}
                            selected={selectedRegionId === d.id}
                            onClick={() => handleSelect(d.id)}
                            size="sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RegionRow({ label, emoji, selected, onClick, size = 'md' }: {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%',
        padding: size === 'sm' ? '11px 12px' : '14px 12px',
        background: selected ? `${colors['orange-40']}10` : 'none',
        border: 'none', cursor: 'pointer',
        fontSize: size === 'sm' ? fontSize.sm : fontSize.md,
        fontWeight: selected ? fontWeight.bold : fontWeight.medium,
        color: selected ? colors['orange-40'] : colors.black,
        borderRadius: radius.md,
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {emoji && (
          <span className="tossface" style={{ fontSize: size === 'sm' ? 15 : 18, lineHeight: 1 }}>{emoji}</span>
        )}
        {label}
      </span>
      {selected && <Check size={18} color={colors['orange-40']} />}
    </button>
  );
}
