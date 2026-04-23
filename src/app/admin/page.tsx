'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { categories } from '@/lib/categories';
import { colors, fontSize, fontWeight, radius, shadows } from '@/lib/design-tokens';
import {
  Users, TrendingUp, BarChart3,
  ChevronDown, RefreshCw, MapPin,
  ArrowRight,
} from 'lucide-react';

// ─── Types ───
interface Lead {
  id: string;
  name: string;
  phone: string;
  test_answers: Record<string, string> | null;
  recommended_category: string | null;
  status: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  notes: string | null;
  created_at: string;
}

interface FunnelData {
  visit: number;
  testStart: number;
  testComplete: number;
  leadSubmit: number;
}

// ─── Helpers ───
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '신규', color: '#3B82F6', bg: '#EFF6FF' },
  contacted: { label: '연락완료', color: '#F59E0B', bg: '#FFFBEB' },
  converted: { label: '전환', color: '#10B981', bg: '#ECFDF5' },
  rejected: { label: '이탈', color: '#EF4444', bg: '#FEF2F2' },
};

function getCategoryName(id: string | null) {
  if (!id) return '-';
  return categories.find((c) => c.id === id)?.name || id;
}

function getRegionFromAnswers(answers: Record<string, string> | null) {
  if (!answers?.region) return '미지정';
  const map: Record<string, string> = {
    seoul: '서울', gyeonggi: '경기/인천', busan: '부산/경남', other: '기타',
  };
  return map[answers.region] || '기타';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hour}:${min}`;
}

function formatPhone(phone: string) {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return phone;
}

// ─── Stat Card ───
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 140, background: colors.white, borderRadius: radius.lg,
      padding: '18px 16px', boxShadow: shadows.card,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: radius.sm, background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: fontWeight.extrabold, color: colors.black }}>{value}</div>
      {sub && <div style={{ fontSize: fontSize.xs, color: colors['gray-60'], marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Funnel Bar ───
function FunnelBar({ funnel }: { funnel: FunnelData }) {
  const steps = [
    { label: '방문', value: funnel.visit, color: colors['gray-60'] },
    { label: '테스트 시작', value: funnel.testStart, color: '#3B82F6' },
    { label: '테스트 완료', value: funnel.testComplete, color: '#F59E0B' },
    { label: '정보 입력', value: funnel.leadSubmit, color: colors['orange-40'] },
  ];
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div style={{
      background: colors.white, borderRadius: radius.lg, padding: 20, boxShadow: shadows.card,
    }}>
      <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black, marginBottom: 20 }}>
        전환 퍼널
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {steps.map((step, i) => {
          const rate = i === 0 ? null : steps[i - 1].value > 0
            ? Math.round((step.value / steps[i - 1].value) * 100) : 0;
          return (
            <div key={step.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: fontSize.sm, color: colors['gray-90'], fontWeight: fontWeight.medium }}>
                  {step.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.black }}>
                    {step.value.toLocaleString()}
                  </span>
                  {rate !== null && (
                    <span style={{
                      fontSize: fontSize.xs, color: step.color, fontWeight: fontWeight.semibold,
                      background: `${step.color}15`, padding: '2px 6px', borderRadius: radius.full,
                    }}>
                      {rate}%
                    </span>
                  )}
                </div>
              </div>
              <div style={{ height: 8, background: colors['gray-10'], borderRadius: 4 }}>
                <div style={{
                  height: '100%', width: `${(step.value / max) * 100}%`,
                  background: step.color, borderRadius: 4, transition: 'width 0.5s ease',
                }} />
              </div>
              {i < steps.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                  <ArrowRight size={12} color={colors['gray-40']} style={{ transform: 'rotate(90deg)' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Admin Page ───
export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [funnel, setFunnel] = useState<FunnelData>({ visit: 0, testStart: 0, testComplete: 0, leadSubmit: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const fetchData = async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);

    // Leads
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsData) setLeads(leadsData as Lead[]);

    // Events (for funnel) - graceful fail if table doesn't exist yet
    try {
      const { data: eventsData } = await supabase
        .from('events')
        .select('event_type');

      if (eventsData) {
        const counts: Record<string, number> = {};
        eventsData.forEach((e: { event_type: string }) => {
          counts[e.event_type] = (counts[e.event_type] || 0) + 1;
        });
        setFunnel({
          visit: counts['page_view'] || 0,
          testStart: counts['test_start'] || 0,
          testComplete: counts['test_complete'] || 0,
          leadSubmit: leadsData?.length || 0,
        });
      }
    } catch {
      // events table not yet created
      setFunnel((prev) => ({ ...prev, leadSubmit: leadsData?.length || 0 }));
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    if (!supabase) return;
    await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
  };

  const saveNote = async (id: string) => {
    if (!supabase) return;
    await supabase.from('leads').update({ notes: noteText }).eq('id', id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, notes: noteText } : l));
    setEditingNote(null);
    setNoteText('');
  };

  // ─── Computed Stats ───
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekLeads = leads.filter((l) => new Date(l.created_at) >= weekAgo);

  const categoryStats = categories.map((cat) => ({
    ...cat,
    count: leads.filter((l) => l.recommended_category === cat.id).length,
  })).sort((a, b) => b.count - a.count);

  const regionStats: Record<string, number> = {};
  leads.forEach((l) => {
    const region = getRegionFromAnswers(l.test_answers);
    regionStats[region] = (regionStats[region] || 0) + 1;
  });

  const utmStats: Record<string, number> = {};
  leads.forEach((l) => {
    const source = l.utm_source || '직접 유입';
    utmStats[source] = (utmStats[source] || 0) + 1;
  });

  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && l.recommended_category !== categoryFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: colors['gray-05'],
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={24} color={colors['gray-40']} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12, color: colors['gray-60'] }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors['gray-05'] }}>
      {/* Header */}
      <div style={{
        background: colors.navy, padding: '20px 24px', color: colors.white,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, marginBottom: 4 }}>
            땀앤땀스 Admin
          </h1>
          <p style={{ fontSize: fontSize.sm, color: 'rgba(255,255,255,0.6)' }}>
            리드 관리 · 퍼널 분석
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: radius.sm,
            padding: '8px 14px', color: colors.white, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: fontSize.sm,
          }}
        >
          <RefreshCw size={14} /> 새로고침
        </button>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* ─── Summary Cards ─── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatCard icon={Users} label="총 리드" value={leads.length} sub={`이번 주 +${thisWeekLeads.length}`} color="#3B82F6" />
          <StatCard icon={TrendingUp} label="전환율" value={
            funnel.visit > 0 ? `${Math.round((leads.length / funnel.visit) * 100)}%` : '-'
          } sub="방문 → 리드" color="#10B981" />
          <StatCard icon={BarChart3} label="인기 자격증" value={
            categoryStats[0]?.count > 0 ? categoryStats[0].name : '-'
          } sub={categoryStats[0]?.count > 0 ? `${categoryStats[0].count}건` : ''} color={colors['orange-40']} />
        </div>

        {/* ─── Funnel + Category/Region ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <FunnelBar funnel={funnel} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 카테고리별 */}
            <div style={{
              background: colors.white, borderRadius: radius.lg, padding: 20, boxShadow: shadows.card, flex: 1,
            }}>
              <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black, marginBottom: 14 }}>
                카테고리별 리드
              </h3>
              {categoryStats.filter((c) => c.count > 0).length === 0 ? (
                <p style={{ fontSize: fontSize.sm, color: colors['gray-40'] }}>아직 데이터 없음</p>
              ) : (
                categoryStats.filter((c) => c.count > 0).map((cat) => (
                  <div key={cat.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: `1px solid ${colors['gray-10']}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: cat.color,
                      }} />
                      <span style={{ fontSize: fontSize.base, color: colors['gray-90'] }}>{cat.name}</span>
                    </div>
                    <span style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.black }}>
                      {cat.count}건
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* 지역별 */}
            <div style={{
              background: colors.white, borderRadius: radius.lg, padding: 20, boxShadow: shadows.card, flex: 1,
            }}>
              <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black, marginBottom: 14 }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />
                지역별 수요
              </h3>
              {Object.keys(regionStats).length === 0 ? (
                <p style={{ fontSize: fontSize.sm, color: colors['gray-40'] }}>아직 데이터 없음</p>
              ) : (
                Object.entries(regionStats).sort((a, b) => b[1] - a[1]).map(([region, count]) => (
                  <div key={region} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: `1px solid ${colors['gray-10']}`,
                  }}>
                    <span style={{ fontSize: fontSize.base, color: colors['gray-90'] }}>{region}</span>
                    <span style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.black }}>
                      {count}명
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── UTM 유입 채널 ─── */}
        <div style={{
          background: colors.white, borderRadius: radius.lg, padding: 20, boxShadow: shadows.card, marginBottom: 20,
        }}>
          <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black, marginBottom: 14 }}>
            유입 채널
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.keys(utmStats).length === 0 ? (
              <p style={{ fontSize: fontSize.sm, color: colors['gray-40'] }}>아직 데이터 없음</p>
            ) : (
              Object.entries(utmStats).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                <div key={source} style={{
                  padding: '10px 16px', background: colors['gray-05'], borderRadius: radius.md,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: fontSize.base, color: colors['gray-90'] }}>{source}</span>
                  <span style={{
                    fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors['orange-40'],
                    background: `${colors['orange-40']}15`, padding: '2px 8px', borderRadius: radius.full,
                  }}>
                    {count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Lead List ─── */}
        <div style={{
          background: colors.white, borderRadius: radius.lg, boxShadow: shadows.card, overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: `1px solid ${colors['gray-10']}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
          }}>
            <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black }}>
              리드 목록 ({filteredLeads.length}건)
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Status Filter */}
              <div style={{ position: 'relative' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    appearance: 'none', padding: '6px 28px 6px 10px', fontSize: fontSize.sm,
                    border: `1px solid ${colors['gray-20']}`, borderRadius: radius.sm,
                    background: colors.white, color: colors['gray-90'], cursor: 'pointer',
                  }}
                >
                  <option value="all">전체 상태</option>
                  {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={12} color={colors['gray-40']}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
              </div>
              {/* Category Filter */}
              <div style={{ position: 'relative' }}>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    appearance: 'none', padding: '6px 28px 6px 10px', fontSize: fontSize.sm,
                    border: `1px solid ${colors['gray-20']}`, borderRadius: radius.sm,
                    background: colors.white, color: colors['gray-90'], cursor: 'pointer',
                  }}
                >
                  <option value="all">전체 자격증</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown size={12} color={colors['gray-40']}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Lead rows */}
          {filteredLeads.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: colors['gray-40'] }}>
              <Users size={32} style={{ marginBottom: 8 }} />
              <p>아직 리드가 없습니다</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const status = STATUS_MAP[lead.status] || STATUS_MAP['new'];
              return (
                <div key={lead.id} style={{
                  padding: '14px 20px', borderBottom: `1px solid ${colors['gray-10']}`,
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.black }}>
                        {lead.name}
                      </span>
                      <span style={{
                        fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
                        color: status.color, background: status.bg,
                        padding: '2px 8px', borderRadius: radius.full,
                      }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, fontSize: fontSize.sm, color: colors['gray-60'],
                      flexWrap: 'wrap',
                    }}>
                      <span>{formatPhone(lead.phone)}</span>
                      <span>·</span>
                      <span>{getCategoryName(lead.recommended_category)}</span>
                      <span>·</span>
                      <span>{getRegionFromAnswers(lead.test_answers)}</span>
                      <span>·</span>
                      <span>{formatDate(lead.created_at)}</span>
                      {lead.utm_source && (
                        <>
                          <span>·</span>
                          <span style={{ color: '#3B82F6' }}>{lead.utm_source}</span>
                        </>
                      )}
                    </div>

                    {/* Notes */}
                    {editingNote === lead.id ? (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <input
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="메모 입력..."
                          style={{
                            flex: 1, padding: '6px 10px', fontSize: fontSize.sm,
                            border: `1px solid ${colors['gray-20']}`, borderRadius: radius.sm,
                            outline: 'none',
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && saveNote(lead.id)}
                        />
                        <button onClick={() => saveNote(lead.id)} style={{
                          padding: '6px 12px', fontSize: fontSize.sm, background: colors['orange-40'],
                          color: colors.white, border: 'none', borderRadius: radius.sm, cursor: 'pointer',
                        }}>저장</button>
                        <button onClick={() => setEditingNote(null)} style={{
                          padding: '6px 12px', fontSize: fontSize.sm, background: colors['gray-10'],
                          color: colors['gray-60'], border: 'none', borderRadius: radius.sm, cursor: 'pointer',
                        }}>취소</button>
                      </div>
                    ) : (
                      <div
                        onClick={() => { setEditingNote(lead.id); setNoteText(lead.notes || ''); }}
                        style={{
                          marginTop: 6, fontSize: fontSize.xs, color: lead.notes ? colors['gray-90'] : colors['gray-40'],
                          cursor: 'pointer',
                        }}
                      >
                        {lead.notes ? `📝 ${lead.notes}` : '+ 메모 추가'}
                      </div>
                    )}
                  </div>

                  {/* Status change */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <select
                      value={lead.status || 'new'}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      style={{
                        appearance: 'none', padding: '6px 24px 6px 8px', fontSize: fontSize.xs,
                        border: `1px solid ${colors['gray-20']}`, borderRadius: radius.sm,
                        background: status.bg, color: status.color, cursor: 'pointer',
                        fontWeight: fontWeight.semibold,
                      }}
                    >
                      {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} color={status.color}
                      style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
