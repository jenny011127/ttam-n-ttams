'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ChevronRight, Trophy, Medal, Award, MapPin,
  Check, Lock, User, Phone, Sparkles, ArrowRight,
} from 'lucide-react';
import { colors } from '@/lib/design-tokens';
import { questions, calculateResults, resultCopy, type Answers } from '@/lib/data/aptitude-test';
import { categories } from '@/lib/categories';
import { allAcademies } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/track';

// ─── 상수 ───
const regionKeywords: Record<string, string[]> = {
  seoul: ['서울'], gyeonggi: ['경기', '인천'],
  busan: ['부산', '경남', '울산'], other: [],
};

const ROLLING_CERTS = [
  '용접기능사', '전기기능사', '배관기능사', '요양보호사',
  '지게차운전', '타일기능사', '네일아트', '냉동기계',
];

const WORRIES = [
  '자격증 따고 싶은데\n뭘 따야 할지 모르겠어',
  '학원이 너무 많은데\n어디가 좋은지 모르겠어',
  '블로그 후기가\n광고인지 진짠지 모르겠어',
  '내일배움카드\n나도 되는 건지 모르겠어',
  '학원 전화하면\n등록 압박이 부담돼',
  '몇 달째 생각만 하고\n시작을 못 하고 있어',
];

const STEPS = [
  { num: '01', title: '10개 질문에 답해요', desc: '체력, 성격, 목표 등 1분이면 끝나는 간단한 질문' },
  { num: '02', title: 'TOP 3 자격증을 알려줘요', desc: '적합도 %와 예상 월급까지 한눈에 비교' },
  { num: '03', title: '집 근처 학원까지', desc: '국비지원 무료 수강 가능한 학원을 바로 확인' },
];

type Step = 'intro' | 'test' | 'gate' | 'result';

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utmSource = searchParams.get('utm_source') || '';

  const [step, setStep] = useState<Step>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [animDir, setAnimDir] = useState<'enter' | 'exit' | null>(null);

  // 롤링 텍스트
  const [certIdx, setCertIdx] = useState(0);
  const [certFade, setCertFade] = useState(true);

  useEffect(() => {
    trackEvent('lp_view', { page: '/landing', eventData: { utm_source: utmSource } });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCertFade(false);
      setTimeout(() => {
        setCertIdx(prev => (prev + 1) % ROLLING_CERTS.length);
        setCertFade(true);
      }, 300);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const total = questions.length;
  const progress = step === 'test' ? ((currentQ) / total) * 100 : 0;

  const handleStart = () => {
    trackEvent('lp_test_start', { page: '/landing' });
    setStep('test');
    window.scrollTo(0, 0);
  };

  // ─── Test ───
  const handleSelect = useCallback((optionId: string) => {
    const question = questions[currentQ];
    const newAnswers = { ...answers, [question.id]: optionId };
    setAnswers(newAnswers);

    if (currentQ < total - 1) {
      setAnimDir('exit');
      setTimeout(() => {
        setCurrentQ(prev => prev + 1);
        setAnimDir('enter');
        setTimeout(() => setAnimDir(null), 300);
      }, 200);
    } else {
      setStep('gate');
      window.scrollTo(0, 0);
    }
  }, [currentQ, total, answers]);

  const handleTestBack = () => {
    if (currentQ > 0) {
      setAnimDir('exit');
      setTimeout(() => {
        setCurrentQ(prev => prev - 1);
        setAnimDir('enter');
        setTimeout(() => setAnimDir(null), 300);
      }, 200);
    } else {
      setStep('intro');
    }
  };

  // ─── Gate ───
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const results = calculateResults(answers);
  const top3 = results.slice(0, 3);
  const userRegion = answers.region || 'other';
  const regionKeys = regionKeywords[userRegion] || [];
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleGateSubmit = async () => {
    if (!name.trim()) { setError('이름을 입력해주세요'); return; }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setError('전화번호를 정확히 입력해주세요'); return;
    }
    setError('');
    setLoading(true);

    try {
      if (supabase) {
        const params = new URLSearchParams(window.location.search);
        await supabase.from('leads').insert({
          name: name.trim(), phone: phone.trim(),
          test_answers: answers,
          recommended_category: top3[0]?.categoryId,
          utm_source: params.get('utm_source') || null,
          utm_medium: params.get('utm_medium') || null,
          utm_campaign: params.get('utm_campaign') || null,
        });
      }
    } catch (e) { console.error('Lead save error:', e); }

    trackEvent('lp_test_complete', { page: '/landing', eventData: { topCategory: top3[0]?.categoryId } });
    setStep('result');
    setLoading(false);
    window.scrollTo(0, 0);
  };

  function getFilteredAcademies(categoryId: string) {
    const catAcademies = allAcademies.filter(a => a.categoryId === categoryId);
    if (regionKeys.length === 0) return catAcademies.slice(0, 3);
    const filtered = catAcademies.filter(a => regionKeys.some(kw => a.addressShort.includes(kw)));
    return filtered.length > 0 ? filtered.slice(0, 3) : catAcademies.slice(0, 2);
  }

  // ════════════════════════════════════════
  // STEP: INTRO — face.da-sh.io 스타일
  // ════════════════════════════════════════
  if (step === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', color: '#141517', maxWidth: 430, margin: '0 auto' }}>

        {/* ─── 히어로 ─── */}
        <section style={{
          padding: '60px 24px 44px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 배경 그라데이션 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(180deg, ${colors['orange-40']}10 0%, ${colors['orange-40']}04 60%, transparent 100%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            {/* 뱃지 */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${colors['orange-40']}12`,
              borderRadius: 100, padding: '6px 16px', marginBottom: 24,
              fontSize: 13, fontWeight: 600, color: colors['orange-40'],
            }}>
              <Sparkles size={14} />
              무료 · 1분 소요 · 10개 질문
            </div>

            <h1 style={{
              fontSize: 28, fontWeight: 900, lineHeight: 1.4,
              letterSpacing: -0.5, marginBottom: 6,
            }}>
              나에게 맞는 자격증은<br />
              <span style={{
                color: colors['orange-40'],
                display: 'inline-block', minWidth: '5em',
                transition: 'opacity 0.3s, transform 0.3s',
                opacity: certFade ? 1 : 0,
                transform: certFade ? 'translateY(0)' : 'translateY(8px)',
              }}>
                {ROLLING_CERTS[certIdx]}
              </span>
              ?
            </h1>

            <p style={{
              fontSize: 15, color: '#727883', lineHeight: 1.6,
              marginBottom: 32,
            }}>
              체력, 성격, 목표에 맞춰 분석해서<br />
              딱 맞는 자격증 + 집 근처 학원까지 알려드려요.
            </p>

            <button
              onClick={handleStart}
              className="press"
              style={{
                width: '100%', padding: '16px 0',
                borderRadius: 16, border: 'none',
                background: colors['orange-40'],
                fontSize: 17, fontWeight: 700,
                color: '#fff', cursor: 'pointer',
                boxShadow: `0 8px 24px ${colors['orange-40']}30`,
              }}
            >
              무료로 테스트 시작하기
            </button>
          </div>
        </section>

        {/* ─── 고민 카드 (자동 스크롤) ─── */}
        <section style={{ padding: '40px 0 44px', background: '#fff' }}>
          <h2 style={{
            fontSize: 22, fontWeight: 900, textAlign: 'center',
            marginBottom: 24, padding: '0 24px', lineHeight: 1.4,
          }}>
            자격증, 학원..<br />이런 고민 하고 있다면
          </h2>

          <style>{`
            @keyframes worryScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex', gap: 10,
              animation: 'worryScroll 25s linear infinite',
              width: 'max-content',
            }}>
              {[...WORRIES, ...WORRIES].map((w, i) => (
                <div key={i} style={{
                  flexShrink: 0, width: 160,
                  borderRadius: 16, padding: 20,
                  background: '#F3F4F6',
                }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600,
                    whiteSpace: 'pre-line', lineHeight: 1.5,
                    color: '#727883',
                  }}>
                    {w}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 이런 분을 위해 ─── */}
        <section style={{ padding: '44px 24px', background: '#F8F9FA' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors['orange-40'], marginBottom: 10 }}>
            이런 분을 위해 만들었어요
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.4, marginBottom: 8 }}>
            어디서부터 시작할지<br />모르겠다면,
          </h2>
          <p style={{ fontSize: 15, color: '#727883', lineHeight: 1.6, marginBottom: 28 }}>
            10개 질문이면 충분해요.<br />
            나에게 맞는 자격증, 예상 월급, 추천 학원까지<br />
            한 번에 정리해드립니다.
          </p>

          {/* 3단계 프로세스 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {STEPS.map((s) => (
              <div key={s.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 18, fontWeight: 900, color: colors['orange-40'],
                  flexShrink: 0, minWidth: 28,
                }}>
                  {s.num}
                </span>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#141517', marginBottom: 4 }}>
                    {s.title}
                  </p>
                  <p style={{ fontSize: 14, color: '#727883', lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 신뢰 요소 ─── */}
        <section style={{ padding: '44px 24px', background: '#fff' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          }}>
            {[
              { label: '테스트 비용', value: '무료', sub: '회원가입도 필요 없어요' },
              { label: '소요 시간', value: '약 1분', sub: '10개 질문이면 끝' },
              { label: '추천 자격증', value: 'TOP 3', sub: '적합도 %까지 분석' },
              { label: '학원 추천', value: '지역별', sub: '국비지원 학원 포함' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '20px 16px',
                background: '#F8F9FA',
                borderRadius: 16,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 12, color: '#B2B8C0', fontWeight: 600, marginBottom: 6 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 24, fontWeight: 900, color: '#141517', marginBottom: 4 }}>
                  {item.value}
                </p>
                <p style={{ fontSize: 12, color: '#727883' }}>
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section style={{ padding: '44px 24px 120px', background: '#fff' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>
            자주 묻는 질문
          </h2>
          {[
            { q: '정말 무료인가요?', a: '네, 완전 무료입니다. 회원가입도 필요 없어요.' },
            { q: '결과는 얼마나 정확한가요?', a: '체력, 손재주, 위험환경 수용도, 목표 월급 등 10가지 요소를 분석해서 12개 자격증 중 가장 잘 맞는 걸 추천해요.' },
            { q: '내일배움카드로 무료 수강 가능한가요?', a: '추천 학원 중 국비지원 학원이 표시되어 있어요. 내일배움카드 대상자라면 자부담 없이 수강할 수 있어요.' },
            { q: '개인정보는 안전한가요?', a: '결과 확인을 위해 입력하신 정보는 맞춤 학원 안내 목적으로만 사용되며, 외부에 절대 제공하지 않습니다.' },
          ].map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </section>

        {/* ─── 하단 고정 CTA ─── */}
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          maxWidth: 430, width: '100%', padding: '12px 20px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(transparent, #fff 30%)',
        }}>
          <button
            onClick={handleStart}
            className="press"
            style={{
              width: '100%', padding: '16px 0',
              borderRadius: 16, border: 'none',
              background: colors['orange-40'],
              fontSize: 17, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              boxShadow: `0 8px 24px ${colors['orange-40']}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            나에게 맞는 자격증 찾기 <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STEP: TEST — 질문 플로우
  // ════════════════════════════════════════
  if (step === 'test') {
    const question = questions[currentQ];
    return (
      <div style={{ minHeight: '100vh', background: '#fff', maxWidth: 430, margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
          <button onClick={handleTestBack}
            style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}>
            <ArrowLeft size={22} color="#141517" />
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#141517' }}>
            자격증 적성 테스트
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ height: 6, background: '#F3F4F6', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: `linear-gradient(90deg, ${colors['orange-40']}, ${colors['orange-30']})`,
              borderRadius: 100, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 8,
            fontSize: 12, color: '#B2B8C0',
          }}>
            <span>{currentQ + 1} / {total}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Question */}
        <div style={{
          padding: '0 20px',
          opacity: animDir === 'exit' ? 0 : 1,
          transform: animDir === 'exit' ? 'translateX(-20px)' : animDir === 'enter' ? 'translateX(0)' : 'none',
          transition: 'opacity 0.2s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#141517', lineHeight: 1.4, letterSpacing: -0.5, marginBottom: 8 }}>
              {question.question}
            </h2>
            {question.subtitle && (
              <p style={{ fontSize: 15, color: '#727883', lineHeight: 1.5 }}>{question.subtitle}</p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {question.options.map(option => {
              const isSelected = answers[question.id] === option.id;
              return (
                <button key={option.id} onClick={() => handleSelect(option.id)} className="press"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 18px', borderRadius: 14,
                    border: `2px solid ${isSelected ? colors['orange-40'] : '#F3F4F6'}`,
                    background: isSelected ? `${colors['orange-40']}08` : '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                  }}>
                  <span style={{
                    flex: 1, fontSize: 16,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? colors['orange-40'] : '#141517',
                  }}>
                    {option.label}
                  </span>
                  {isSelected && <ChevronRight size={18} color={colors['orange-40']} />}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          maxWidth: 430, width: '100%', padding: '16px 20px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          textAlign: 'center', background: 'linear-gradient(transparent, rgba(255,255,255,0.95) 30%)',
        }}>
          <p style={{ fontSize: 12, color: '#B2B8C0' }}>선택하면 자동으로 다음 질문으로 넘어가요</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STEP: GATE — 이름/전화번호
  // ════════════════════════════════════════
  if (step === 'gate') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors['orange-40']}, ${colors['orange-60']})`,
          padding: '40px 24px 32px', color: '#fff', textAlign: 'center',
        }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <Trophy size={52} color="#fff" strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
            테스트 완료! 당신에게 맞는 자격증은
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, marginBottom: 8 }}>
            {top3[0]?.name}
          </h1>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.2)', borderRadius: 100,
            padding: '8px 18px', fontSize: 15, fontWeight: 700,
            backdropFilter: 'blur(4px)',
          }}>
            적합도 {top3[0]?.matchPercent}%
          </div>
        </div>

        {/* 블러 프리뷰 */}
        <div style={{ position: 'relative', padding: '20px 24px 0' }}>
          <div style={{ filter: 'blur(8px)', opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{ background: '#F3F4F6', borderRadius: 14, padding: 20, marginBottom: 12 }}>
              <div style={{ height: 20, background: '#E5E7EB', borderRadius: 4, width: '60%', marginBottom: 8 }} />
              <div style={{ height: 14, background: '#F3F4F6', borderRadius: 4, width: '80%', marginBottom: 6 }} />
              <div style={{ height: 14, background: '#F3F4F6', borderRadius: 4, width: '70%' }} />
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: 14, padding: 20 }}>
              <div style={{ height: 20, background: '#E5E7EB', borderRadius: 4, width: '50%', marginBottom: 8 }} />
              <div style={{ height: 14, background: '#F3F4F6', borderRadius: 4, width: '90%' }} />
            </div>
          </div>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <Lock size={28} color="#727883" />
            <span style={{ fontSize: 14, color: '#727883', fontWeight: 500 }}>상세 결과가 준비되었어요</span>
          </div>
        </div>

        {/* 입력 폼 */}
        <div style={{ padding: '28px 24px 40px', flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#141517', marginBottom: 6, textAlign: 'center' }}>
            결과 확인하기
          </h2>
          <p style={{ fontSize: 14, color: '#727883', marginBottom: 24, textAlign: 'center', lineHeight: 1.5 }}>
            맞춤 자격증과 추천 학원 정보를<br />확인하려면 아래 정보를 입력해주세요
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: '#F8F9FA', borderRadius: 12, border: '1px solid #F3F4F6',
            }}>
              <User size={18} color="#B2B8C0" />
              <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16, color: '#141517', outline: 'none' }} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: '#F8F9FA', borderRadius: 12, border: '1px solid #F3F4F6',
            }}>
              <Phone size={18} color="#B2B8C0" />
              <input type="tel" placeholder="전화번호" value={phone} onChange={e => setPhone(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 16, color: '#141517', outline: 'none' }} />
            </div>
          </div>

          {error && <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 12, textAlign: 'center' }}>{error}</p>}

          <button onClick={handleGateSubmit} disabled={loading} className="press" style={{
            width: '100%', padding: '16px 0', borderRadius: 14, border: 'none',
            background: loading ? '#B2B8C0' : colors['orange-40'],
            fontSize: 17, fontWeight: 700, color: '#fff',
            cursor: loading ? 'default' : 'pointer',
          }}>
            {loading ? '확인 중...' : '결과 보기'}
          </button>

          <p style={{ fontSize: 11, color: '#B2B8C0', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
            입력하신 정보는 맞춤 학원 안내 목적으로만 사용되며,<br />외부에 제공하지 않습니다.
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STEP: RESULT
  // ════════════════════════════════════════
  const rankIcons = [Trophy, Medal, Award];
  const rankColors = [colors['orange-40'], '#6B7280', '#CD7F32'];
  const rankLabels = ['최고 적합', '추천', '추천'];

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', maxWidth: 430, margin: '0 auto' }}>
      {/* Hero Result */}
      <div style={{
        background: `linear-gradient(135deg, ${colors['orange-40']}, ${colors['orange-60']})`,
        padding: '32px 24px 28px', color: '#fff', textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>당신에게 가장 잘 맞는 자격증은</p>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
          <Trophy size={48} color="#fff" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, marginBottom: 8 }}>{top3[0]?.name}</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: 16 }}>
          {resultCopy[top3[0]?.categoryId]?.catchphrase}
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.2)', borderRadius: 100,
          padding: '8px 18px', fontSize: 15, fontWeight: 700, backdropFilter: 'blur(4px)',
        }}>
          적합도 {top3[0]?.matchPercent}%
        </div>
      </div>

      {/* TOP 3 Cards */}
      <div style={{ padding: '20px 20px 0' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#141517', marginBottom: 16 }}>TOP 3 추천 자격증</h2>

        {top3.map((result, idx) => {
          const copy = resultCopy[result.categoryId];
          const cat = categories.find(c => c.id === result.categoryId);
          const RankIcon = rankIcons[idx];
          const academies = getFilteredAcademies(result.categoryId);
          const isSelected = selectedIdx === idx;

          return (
            <div key={result.categoryId} onClick={() => setSelectedIdx(idx)} className="press"
              style={{
                background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
                boxShadow: isSelected ? `0 4px 20px ${rankColors[idx]}25` : '0 1px 4px rgba(0,0,0,0.06)',
                border: isSelected ? `2px solid ${rankColors[idx]}` : '1px solid #F3F4F6',
                cursor: 'pointer', transition: 'border 0.2s, box-shadow 0.2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${rankColors[idx]}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RankIcon size={20} color={rankColors[idx]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#141517' }}>{result.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: rankColors[idx],
                      background: `${rankColors[idx]}12`, padding: '2px 8px', borderRadius: 100,
                    }}>{rankLabels[idx]}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#727883' }}>예상 월급 {result.salaryRange}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: rankColors[idx] }}>{result.matchPercent}%</div>
                  <span style={{ fontSize: 11, color: '#B2B8C0' }}>적합도</span>
                </div>
              </div>

              <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.5, marginBottom: 12 }}>{result.description}</p>

              {copy && (
                <div style={{ marginBottom: 14 }}>
                  {copy.detailPoints.map((point, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                      <Check size={14} color="#22C55E" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.4 }}>{point}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: academies.length > 0 ? 14 : 0 }}>
                {result.keywords.map(kw => (
                  <span key={kw} style={{
                    fontSize: 12, color: cat?.color || '#727883',
                    background: `${cat?.color || '#727883'}10`, padding: '4px 10px',
                    borderRadius: 100, fontWeight: 500,
                  }}>#{kw}</span>
                ))}
              </div>

              {academies.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    <MapPin size={13} color={colors['orange-40']} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#141517' }}>
                      {regionKeys.length > 0 ? `${regionKeys[0]} 지역` : '전국'} 추천 학원
                    </span>
                  </div>
                  {academies.map(academy => (
                    <div key={academy.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', background: '#F8F9FA', borderRadius: 10, marginBottom: 6,
                    }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#141517', marginBottom: 2 }}>{academy.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#727883' }}>
                          <span>{academy.addressShort}</span>
                          <span>·</span>
                          <span>합격률 {academy.passRate}%</span>
                          {academy.isGovernmentFunded && (
                            <><span>·</span><span style={{ color: colors.government, fontWeight: 600 }}>국비</span></>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTAs */}
      <div style={{
        position: 'sticky', bottom: 0,
        padding: '16px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(transparent, #fff 20%)',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push(`/?tab=search&category=${top3[selectedIdx]?.categoryId}&region=${userRegion}`)}
            className="press" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '15px 0', borderRadius: 14, border: 'none',
              background: colors['orange-40'], fontSize: 15, fontWeight: 700, color: '#fff',
              cursor: 'pointer', boxShadow: `0 6px 20px ${colors['orange-40']}30`,
            }}>
            <MapPin size={16} /> 집 근처 학원 보기
          </button>
          <button onClick={() => router.push('/?tab=search&gov=true')}
            className="press" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '15px 0', borderRadius: 14,
              border: `1.5px solid ${colors.government}`, background: '#fff',
              fontSize: 15, fontWeight: 700, color: colors.government, cursor: 'pointer',
            }}>
            무료 수강 학원 보기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ 아이템 ───
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #F3F4F6' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#141517' }}>{q}</span>
        <span style={{
          color: '#B2B8C0', fontSize: 20, flexShrink: 0, marginLeft: 16,
          transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'none',
        }}>+</span>
      </button>
      <div style={{
        overflow: 'hidden', maxHeight: open ? 200 : 0,
        opacity: open ? 1 : 0, transition: 'max-height 0.3s ease, opacity 0.2s ease',
      }}>
        <p style={{ paddingBottom: 16, fontSize: 14, color: '#727883', lineHeight: 1.6 }}>{a}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#727883' }}>로딩 중...</p>
      </div>
    }>
      <LandingContent />
    </Suspense>
  );
}
