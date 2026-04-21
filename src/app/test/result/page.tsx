'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { ArrowLeft, ChevronRight, MapPin, Trophy, Medal, Award, RotateCcw, Check, Lock, User, Phone } from 'lucide-react';
import { colors, fontSize, fontWeight, radius, shadows } from '@/lib/design-tokens';
import { calculateResults, resultCopy, type Answers } from '@/lib/data/aptitude-test';
import { categories } from '@/lib/categories';
import { allAcademies } from '@/lib/data';
import { supabase } from '@/lib/supabase';

// 지역 매핑 (answers.region → addressShort 키워드)
const regionKeywords: Record<string, string[]> = {
  seoul: ['서울'],
  gyeonggi: ['경기', '인천'],
  busan: ['부산', '경남', '울산'],
  other: [], // 전체
};

// ─── 게이트: 이름/전화번호 입력 후 결과 공개 ───
function LeadGate({
  topResult,
  onSubmit,
}: {
  topResult: { name: string; matchPercent: number };
  onSubmit: (name: string, phone: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setError('전화번호를 정확히 입력해주세요');
      return;
    }
    setError('');
    setLoading(true);
    onSubmit(name.trim(), phone.trim());
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.white,
        maxWidth: 430,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 상단 티저 */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors['orange-40']}, ${colors['orange-60']})`,
          padding: '40px 20px 32px',
          color: colors.white,
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
          <Trophy size={52} color={colors.white} strokeWidth={1.5} />
        </div>
        <p style={{ fontSize: fontSize.base, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
          테스트 완료! 당신에게 맞는 자격증은
        </p>
        <h1 style={{ fontSize: 28, fontWeight: fontWeight.extrabold, letterSpacing: -0.5, marginBottom: 8 }}>
          {topResult.name}
        </h1>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: radius.full,
            padding: '8px 18px',
            fontSize: fontSize.md,
            fontWeight: fontWeight.bold,
            backdropFilter: 'blur(4px)',
          }}
        >
          적합도 {topResult.matchPercent}%
        </div>
      </div>

      {/* 블러 프리뷰 */}
      <div style={{ position: 'relative', padding: '20px 20px 0' }}>
        <div style={{ filter: 'blur(8px)', opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ background: colors['gray-05'], borderRadius: radius.lg, padding: 20, marginBottom: 12 }}>
            <div style={{ height: 20, background: colors['gray-20'], borderRadius: 4, width: '60%', marginBottom: 8 }} />
            <div style={{ height: 14, background: colors['gray-10'], borderRadius: 4, width: '80%', marginBottom: 6 }} />
            <div style={{ height: 14, background: colors['gray-10'], borderRadius: 4, width: '70%' }} />
          </div>
          <div style={{ background: colors['gray-05'], borderRadius: radius.lg, padding: 20 }}>
            <div style={{ height: 20, background: colors['gray-20'], borderRadius: 4, width: '50%', marginBottom: 8 }} />
            <div style={{ height: 14, background: colors['gray-10'], borderRadius: 4, width: '90%', marginBottom: 6 }} />
            <div style={{ height: 14, background: colors['gray-10'], borderRadius: 4, width: '75%' }} />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Lock size={28} color={colors['gray-60']} />
          <span style={{ fontSize: fontSize.sm, color: colors['gray-60'], fontWeight: fontWeight.medium }}>
            상세 결과가 준비되었어요
          </span>
        </div>
      </div>

      {/* 입력 폼 */}
      <div style={{ padding: '28px 20px 40px', flex: 1 }}>
        <h2 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.black, marginBottom: 6, textAlign: 'center' }}>
          결과 확인하기
        </h2>
        <p style={{ fontSize: fontSize.sm, color: colors['gray-60'], marginBottom: 24, textAlign: 'center', lineHeight: 1.5 }}>
          맞춤 자격증과 추천 학원 정보를<br />확인하려면 아래 정보를 입력해주세요
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              background: colors['gray-05'],
              borderRadius: radius.md,
              border: `1px solid ${colors['gray-20']}`,
            }}
          >
            <User size={18} color={colors['gray-40']} />
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: fontSize.lg,
                color: colors.black,
                outline: 'none',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              background: colors['gray-05'],
              borderRadius: radius.md,
              border: `1px solid ${colors['gray-20']}`,
            }}
          >
            <Phone size={18} color={colors['gray-40']} />
            <input
              type="tel"
              placeholder="전화번호"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: fontSize.lg,
                color: colors.black,
                outline: 'none',
              }}
            />
          </div>
        </div>

        {error && (
          <p style={{ fontSize: fontSize.sm, color: colors.error, marginBottom: 12, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="press"
          style={{
            width: '100%',
            padding: '16px 0',
            borderRadius: radius.lg,
            border: 'none',
            background: loading ? colors['gray-30'] : colors['orange-40'],
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            color: colors.white,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? '확인 중...' : '결과 보기'}
        </button>

        <p style={{ fontSize: 11, color: colors['gray-40'], textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
          입력하신 정보는 맞춤 학원 안내 목적으로만 사용되며,<br />
          외부에 제공하지 않습니다.
        </p>
      </div>
    </div>
  );
}

// ─── 결과 컴포넌트 ───
function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const answers: Answers = {};
  searchParams.forEach((value, key) => {
    answers[key] = value;
  });

  const results = calculateResults(answers);
  const top3 = results.slice(0, 3);
  const userRegion = answers.region || 'other';
  const regionKeys = regionKeywords[userRegion] || [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [gateCleared, setGateCleared] = useState(false);

  function getFilteredAcademies(categoryId: string) {
    const catAcademies = allAcademies.filter((a) => a.categoryId === categoryId);
    if (regionKeys.length === 0) return catAcademies.slice(0, 3);
    const filtered = catAcademies.filter((a) =>
      regionKeys.some((kw) => a.addressShort.includes(kw))
    );
    return filtered.length > 0 ? filtered.slice(0, 3) : catAcademies.slice(0, 2);
  }

  const handleGateSubmit = async (name: string, phone: string) => {
    try {
      if (supabase) {
        await supabase.from('leads').insert({
          name,
          phone,
          test_answers: answers,
          recommended_category: top3[0].categoryId,
        });
      }
    } catch (e) {
      console.error('Lead save error:', e);
    }
    setGateCleared(true);
  };

  if (!gateCleared) {
    return (
      <LeadGate
        topResult={{ name: top3[0].name, matchPercent: top3[0].matchPercent }}
        onSubmit={handleGateSubmit}
      />
    );
  }

  const rankIcons = [Trophy, Medal, Award];
  const rankColors = [colors['orange-40'], '#6B7280', '#CD7F32'];
  const rankLabels = ['최고 적합', '추천', '추천'];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors['gray-05'],
        maxWidth: 430,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          gap: 12,
          background: colors.white,
        }}
      >
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
        >
          <ArrowLeft size={22} color={colors.black} />
        </button>
        <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.black, flex: 1 }}>
          테스트 결과
        </span>
      </div>

      {/* Hero Result */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors['orange-40']}, ${colors['orange-60']})`,
          padding: '32px 20px 28px',
          color: colors.white,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
          당신에게 가장 잘 맞는 자격증은
        </p>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
          <Trophy size={48} color={colors.white} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: fontWeight.extrabold, letterSpacing: -0.5, marginBottom: 8 }}>
          {top3[0].name}
        </h1>
        <p style={{ fontSize: fontSize.base, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: 16 }}>
          {resultCopy[top3[0].categoryId]?.catchphrase}
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: radius.full,
            padding: '8px 18px',
            fontSize: fontSize.md,
            fontWeight: fontWeight.bold,
            backdropFilter: 'blur(4px)',
          }}
        >
          적합도 {top3[0].matchPercent}%
        </div>
      </div>

      {/* TOP 3 Cards */}
      <div style={{ padding: '20px 20px 0' }}>
        <h2 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.black, marginBottom: 16 }}>
          TOP 3 추천 자격증
        </h2>

        {top3.map((result, idx) => {
          const copy = resultCopy[result.categoryId];
          const cat = categories.find((c) => c.id === result.categoryId);
          const RankIcon = rankIcons[idx];
          const academies = getFilteredAcademies(result.categoryId);

          const isSelected = selectedIdx === idx;
          return (
            <div
              key={result.categoryId}
              onClick={() => setSelectedIdx(idx)}
              className="press"
              style={{
                background: colors.white,
                borderRadius: radius.lg,
                padding: 20,
                marginBottom: 16,
                boxShadow: isSelected ? `0 4px 20px ${rankColors[idx]}25` : shadows.card,
                border: isSelected ? `2px solid ${rankColors[idx]}` : `1px solid ${colors['gray-20']}`,
                cursor: 'pointer',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Rank Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.md,
                    background: idx === 0 ? `${colors['orange-40']}15` : `${rankColors[idx]}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RankIcon size={20} color={rankColors[idx]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.black }}>
                      {result.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: fontWeight.bold,
                        color: rankColors[idx],
                        background: `${rankColors[idx]}15`,
                        padding: '2px 8px',
                        borderRadius: radius.full,
                      }}
                    >
                      {rankLabels[idx]}
                    </span>
                  </div>
                  <span style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>
                    예상 월급 {result.salaryRange}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: rankColors[idx] }}>
                    {result.matchPercent}%
                  </div>
                  <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>적합도</span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: fontSize.base, color: colors['gray-90'], lineHeight: 1.5, marginBottom: 12 }}>
                {result.description}
              </p>

              {/* Detail Points */}
              {copy && (
                <div style={{ marginBottom: 14 }}>
                  {copy.detailPoints.map((point, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                      <Check size={14} color={colors.success} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: fontSize.sm, color: colors['gray-90'], lineHeight: 1.4 }}>
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Keywords */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {result.keywords.map((kw) => (
                  <span
                    key={kw}
                    style={{
                      fontSize: fontSize.xs,
                      color: cat?.color || colors['gray-90'],
                      background: `${cat?.color || colors['gray-60']}12`,
                      padding: '4px 10px',
                      borderRadius: radius.full,
                      fontWeight: fontWeight.medium,
                    }}
                  >
                    #{kw}
                  </span>
                ))}
              </div>

              {/* Recommended Academies */}
              {academies.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <MapPin size={13} color={colors['orange-40']} />
                    <span style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.black }}>
                      {regionKeys.length > 0 ? `${regionKeys[0]} 지역` : '전국'} 추천 학원
                    </span>
                  </div>
                  {academies.map((academy) => (
                    <div
                      key={academy.id}
                      onClick={() => router.push(`/academy/${academy.id}`)}
                      className="press"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: colors['gray-05'],
                        borderRadius: radius.md,
                        marginBottom: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.black, marginBottom: 2 }}>
                          {academy.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fontSize.xs, color: colors['gray-60'] }}>
                          <span>{academy.addressShort}</span>
                          <span>·</span>
                          <span>⭐ {academy.avgRating}</span>
                          <span>·</span>
                          <span>합격률 {academy.passRate}%</span>
                          {academy.isGovernmentFunded && (
                            <>
                              <span>·</span>
                              <span style={{ color: colors.government, fontWeight: fontWeight.semibold }}>국비</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={16} color={colors['gray-40']} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTAs */}
      <div
        style={{
          padding: '12px 20px 40px',
          display: 'flex',
          gap: 10,
        }}
      >
        <button
          onClick={() => router.push('/test')}
          className="press"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '14px 0',
            borderRadius: radius.lg,
            border: `1px solid ${colors['gray-20']}`,
            background: colors.white,
            fontSize: fontSize.base,
            fontWeight: fontWeight.semibold,
            color: colors['gray-90'],
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={16} /> 다시 하기
        </button>
        <button
          onClick={() => router.push(`/?tab=search&category=${top3[selectedIdx].categoryId}`)}
          className="press"
          style={{
            flex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '14px 0',
            borderRadius: radius.lg,
            border: 'none',
            background: colors['orange-40'],
            fontSize: fontSize.base,
            fontWeight: fontWeight.bold,
            color: colors.white,
            cursor: 'pointer',
          }}
        >
          {top3[selectedIdx].name} 학원 보기 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function TestResultPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: colors['gray-60'] }}>결과 분석 중...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
