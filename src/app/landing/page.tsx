'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ChevronRight, Trophy, Medal, Award, MapPin,
  Check, User, Phone, Sparkles, ArrowRight,
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

const REGION_OPTIONS = [
  { id: 'seoul', label: '서울' },
  { id: 'gyeonggi', label: '경기/인천' },
  { id: 'busan', label: '부산/경남' },
  { id: 'other', label: '그 외 지역' },
];

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

// 지역 질문은 collect에서 받으므로 테스트에서 제외
const testQuestions = questions.filter(q => q.id !== 'region');

// ─── 반응형 CSS ───
const RESPONSIVE_CSS = `
@keyframes worryScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ── Base (mobile) ── */
.lp-page { width: 100%; min-height: 100vh; }
.lp-intro { max-width: 100%; }
.lp-form { max-width: 430px; margin: 0 auto; }
.lp-result { max-width: 430px; margin: 0 auto; }

.lp-hero { padding: 60px 24px 44px; }
.lp-hero-inner { max-width: 600px; margin: 0 auto; }
.lp-hero-title { font-size: 28px; }
.lp-hero-desc { font-size: 15px; }
.lp-hero-cta { max-width: 100%; margin: 0 auto; }
.lp-hero-btn { font-size: 17px; padding: 16px 0; }

.lp-section { padding: 44px 24px; }
.lp-section-inner { max-width: 700px; margin: 0 auto; }
.lp-worry-heading { font-size: 22px; }
.lp-target-label { font-size: 13px; }
.lp-target-heading { font-size: 24px; }
.lp-target-desc { font-size: 15px; }
.lp-worry-card { width: 160px; padding: 20px; }

.lp-trust-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.lp-trust-value { font-size: 24px; }
.lp-steps-list { display: flex; flex-direction: column; gap: 20px; }
.lp-step-num { font-size: 18px; }
.lp-step-title { font-size: 16px; }

.lp-faq-section { padding: 44px 24px 120px; }
.lp-faq-inner { max-width: 700px; margin: 0 auto; }
.lp-faq-heading { font-size: 20px; }

.lp-fixed-bar { max-width: 430px; width: 100%; }
.lp-fixed-btn { font-size: 17px; padding: 16px 0; }

.lp-test-pad { padding: 0 20px; }
.lp-test-q { font-size: 24px; }
.lp-test-opt { padding: 16px 18px; font-size: 16px; }

.lp-collect-section { padding: 44px 24px 40px; }
.lp-collect-title { font-size: 24px; }

.lp-result-hero { padding: 32px 24px 28px; }
.lp-result-name { font-size: 28px; }
.lp-result-cards { padding: 20px 20px 0; }
.lp-result-section-title { font-size: 20px; }
.lp-result-card-name { font-size: 18px; }
.lp-result-match { font-size: 22px; }
.lp-result-bottom { padding: 16px 20px; }

/* ── Tablet (768px+) ── */
@media (min-width: 768px) {
  .lp-form { max-width: 560px; }
  .lp-result { max-width: 720px; }

  .lp-hero { padding: 100px 40px 64px; }
  .lp-hero-inner { max-width: 700px; }
  .lp-hero-title { font-size: 44px; }
  .lp-hero-desc { font-size: 18px; }
  .lp-hero-cta { max-width: 420px; }
  .lp-hero-btn { font-size: 18px; padding: 18px 0; }

  .lp-section { padding: 64px 40px; }
  .lp-worry-heading { font-size: 30px; }
  .lp-target-label { font-size: 14px; }
  .lp-target-heading { font-size: 30px; }
  .lp-target-desc { font-size: 17px; }
  .lp-worry-card { width: 220px; padding: 24px; }

  .lp-trust-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .lp-trust-value { font-size: 28px; }
  .lp-steps-list { flex-direction: row; gap: 32px; }
  .lp-steps-list > div { flex: 1; }
  .lp-step-num { font-size: 22px; }
  .lp-step-title { font-size: 18px; }

  .lp-faq-section { padding: 64px 40px 140px; }
  .lp-faq-heading { font-size: 24px; }

  .lp-fixed-bar { max-width: 560px; }
  .lp-fixed-btn { font-size: 18px; padding: 18px 0; }

  .lp-test-pad { padding: 0 40px; max-width: 600px; margin: 0 auto; }
  .lp-test-q { font-size: 28px; }
  .lp-test-opt { padding: 18px 22px; font-size: 17px; }

  .lp-collect-section { padding: 52px 40px 48px; }
  .lp-collect-title { font-size: 28px; }

  .lp-result-hero { padding: 44px 40px 36px; }
  .lp-result-name { font-size: 34px; }
  .lp-result-cards { padding: 28px 32px 0; }
  .lp-result-section-title { font-size: 24px; }
  .lp-result-card-name { font-size: 20px; }
  .lp-result-match { font-size: 26px; }
  .lp-result-bottom { padding: 20px 32px; }
}

/* ── Desktop (1024px+) ── */
@media (min-width: 1024px) {
  .lp-hero { padding: 120px 40px 80px; }
  .lp-hero-title { font-size: 52px; }
  .lp-hero-desc { font-size: 20px; }

  .lp-section { padding: 80px 40px; }
  .lp-worry-heading { font-size: 36px; }
  .lp-target-heading { font-size: 34px; }
  .lp-target-desc { font-size: 18px; }
  .lp-worry-card { width: 260px; padding: 28px; }
  .lp-trust-value { font-size: 32px; }

  .lp-faq-section { padding: 80px 40px 160px; }
  .lp-faq-heading { font-size: 26px; }

  .lp-collect-title { font-size: 30px; }
}
`;

type Step = 'intro' | 'collect' | 'test' | 'result';

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

  // 리드 수집 (collect 단계)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [collectError, setCollectError] = useState('');
  const [saving, setSaving] = useState(false);

  // 하단 고정 CTA 표시 여부
  const footerCtaRef = useRef<HTMLElement>(null);
  const [showSticky, setShowSticky] = useState(true);

  useEffect(() => {
    trackEvent('lp_view', { page: '/landing', eventData: { utm_source: utmSource } });
  }, []);

  useEffect(() => {
    if (step !== 'intro') return;
    const onScroll = () => {
      if (footerCtaRef.current) {
        const footerTop = footerCtaRef.current.getBoundingClientRect().top;
        setShowSticky(footerTop > window.innerHeight);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [step]);

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

  const total = testQuestions.length;
  const progress = step === 'test' ? ((currentQ) / total) * 100 : 0;

  const handleStart = () => {
    trackEvent('lp_test_start', { page: '/landing' });
    setStep('collect');
    window.scrollTo(0, 0);
  };

  // ─── Collect → DB 저장 후 테스트 시작 ───
  const handleCollectSubmit = async () => {
    if (!name.trim()) { setCollectError('이름을 입력해주세요'); return; }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
      setCollectError('전화번호를 정확히 입력해주세요'); return;
    }
    if (!region) { setCollectError('지역을 선택해주세요'); return; }
    setCollectError('');
    setSaving(true);

    // 지역을 answers에 미리 세팅
    setAnswers(prev => ({ ...prev, region }));

    try {
      if (supabase) {
        const params = new URLSearchParams(window.location.search);
        await supabase.from('leads').insert({
          name: name.trim(), phone: phone.trim(),
          test_answers: { region },
          recommended_category: null,
          utm_source: params.get('utm_source') || null,
          utm_medium: params.get('utm_medium') || null,
          utm_campaign: params.get('utm_campaign') || null,
        });
      }
    } catch (e) { console.error('Lead save error:', e); }

    trackEvent('lp_collect_submit', { page: '/landing', eventData: { region } });
    setSaving(false);
    setStep('test');
    setCurrentQ(0);
    window.scrollTo(0, 0);
  };

  // ─── Test ───
  const handleSelect = useCallback((optionId: string) => {
    const question = testQuestions[currentQ];
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
      // 테스트 완료 → 바로 결과
      trackEvent('lp_test_complete', { page: '/landing', eventData: { answers: newAnswers } });
      setStep('result');
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
      setStep('collect');
    }
  };

  const results = calculateResults(answers);
  const top3 = results.slice(0, 3);
  const userRegion = answers.region || 'other';
  const regionKeys = regionKeywords[userRegion] || [];
  const [selectedIdx, setSelectedIdx] = useState(0);

  function getFilteredAcademies(categoryId: string) {
    const catAcademies = allAcademies.filter(a => a.categoryId === categoryId);
    if (regionKeys.length === 0) return catAcademies.slice(0, 3);
    const filtered = catAcademies.filter(a => regionKeys.some(kw => a.addressShort.includes(kw)));
    return filtered.length > 0 ? filtered.slice(0, 3) : catAcademies.slice(0, 2);
  }

  // ════════════════════════════════════════
  // STEP: INTRO
  // ════════════════════════════════════════
  if (step === 'intro') {
    return (
      <div className="lp-page lp-intro" style={{ background: '#fff', color: '#141517' }}>
        <style>{RESPONSIVE_CSS}</style>

        {/* ─── 히어로 ─── */}
        <section className="lp-hero" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(180deg, ${colors['orange-40']}10 0%, ${colors['orange-40']}04 60%, transparent 100%)`,
            pointerEvents: 'none',
          }} />

          <div className="lp-hero-inner" style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: `${colors['orange-40']}12`,
              borderRadius: 100, padding: '6px 16px', marginBottom: 24,
              fontSize: 13, fontWeight: 600, color: colors['orange-40'],
            }}>
              <Sparkles size={14} />
              무료 · 1분 소요 · 10개 질문
            </div>

            <h1 className="lp-hero-title" style={{
              fontWeight: 900, lineHeight: 1.4, letterSpacing: -0.5, marginBottom: 6, color: '#141517',
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

            <p className="lp-hero-desc" style={{ color: '#727883', lineHeight: 1.6 }}>
              체력, 성격, 목표에 맞춰 분석해서<br />
              딱 맞는 자격증 + 집 근처 학원까지 알려드려요.
            </p>

            <div className="lp-hero-cta">
              <button
                onClick={handleStart}
                className="press lp-hero-btn"
                style={{
                  width: '100%',
                  borderRadius: 16, border: 'none',
                  background: colors['orange-40'],
                  fontWeight: 700,
                  color: '#fff', cursor: 'pointer',
                  boxShadow: `0 8px 24px ${colors['orange-40']}30`,
                }}
              >
                무료로 테스트 시작하기
              </button>
            </div>
          </div>
        </section>

        {/* ─── 고민 카드 (자동 스크롤) ─── */}
        <section style={{ padding: '40px 0 44px', background: '#fff' }}>
          <h2 className="lp-worry-heading" style={{
            fontWeight: 900, textAlign: 'center',
            marginBottom: 24, padding: '0 24px', lineHeight: 1.4,
          }}>
            자격증, 학원..<br />이런 고민 하고 있다면
          </h2>

          <div style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex', gap: 10,
              animation: 'worryScroll 25s linear infinite',
              width: 'max-content',
            }}>
              {[...WORRIES, ...WORRIES].map((w, i) => (
                <div key={i} className="lp-worry-card" style={{
                  flexShrink: 0,
                  borderRadius: 16,
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
        <section className="lp-section" style={{ background: '#F8F9FA' }}>
          <div className="lp-section-inner">
            <p className="lp-target-label" style={{ fontWeight: 700, color: colors['orange-40'], marginBottom: 10 }}>
              이런 분을 위해 만들었어요
            </p>
            <h2 className="lp-target-heading" style={{ fontWeight: 900, lineHeight: 1.4, marginBottom: 8, color: '#141517' }}>
              어디서부터 시작할지<br />모르겠다면,
            </h2>
            <p className="lp-target-desc" style={{ color: '#727883', lineHeight: 1.6, marginBottom: 28 }}>
              10개 질문이면 충분해요.<br />
              나에게 맞는 자격증, 예상 월급, 추천 학원까지<br />
              한 번에 정리해드립니다.
            </p>

            <div className="lp-steps-list">
              {STEPS.map((s) => (
                <div key={s.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span className="lp-step-num" style={{
                    fontWeight: 900, color: colors['orange-40'],
                    flexShrink: 0, minWidth: 28,
                  }}>
                    {s.num}
                  </span>
                  <div>
                    <p className="lp-step-title" style={{ fontWeight: 700, color: '#141517', marginBottom: 4 }}>
                      {s.title}
                    </p>
                    <p style={{ fontSize: 14, color: '#727883', lineHeight: 1.5 }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 신뢰 요소 ─── */}
        <section className="lp-section" style={{ background: '#fff' }}>
          <div className="lp-section-inner">
            <div className="lp-trust-grid">
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
                  <p className="lp-trust-value" style={{ fontWeight: 900, color: '#141517', marginBottom: 4 }}>
                    {item.value}
                  </p>
                  <p style={{ fontSize: 12, color: '#727883' }}>
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="lp-section" style={{ background: '#fff' }}>
          <div className="lp-faq-inner">
            <h2 className="lp-faq-heading" style={{ fontWeight: 900, marginBottom: 20, color: '#141517' }}>
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
          </div>
        </section>

        {/* ─── 하단 CTA 섹션 ─── */}
        <section ref={footerCtaRef} style={{
          position: 'relative', background: '#141517',
          padding: '80px 24px', textAlign: 'center', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto' }}>
            <h2 className="lp-worry-heading" style={{
              fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.4,
            }}>
              자격증 준비,<br />지금 시작하세요
            </h2>
            <p style={{ fontSize: 15, color: '#B2B8C0', marginBottom: 32, lineHeight: 1.6 }}>
              1분이면 나에게 딱 맞는 자격증과<br />집 근처 학원까지 한 번에 알 수 있어요.
            </p>
            <button
              onClick={handleStart}
              className="press"
              style={{
                display: 'inline-block', padding: '16px 40px',
                borderRadius: 16, border: 'none',
                background: colors['orange-40'],
                fontSize: 17, fontWeight: 700, color: '#fff',
                cursor: 'pointer',
                boxShadow: `0 8px 24px ${colors['orange-40']}30`,
              }}
            >
              무료로 테스트 시작하기
            </button>
          </div>
        </section>

        {/* ─── 푸터 ─── */}
        <footer style={{ padding: '56px 24px', background: '#141517' }}>
          <div className="lp-section-inner" style={{
            display: 'flex', flexDirection: 'column', gap: 32, fontSize: 14, color: '#727883',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>땀앤땀스</p>
                <p>자격증 학원 비교 플랫폼</p>
              </div>
              <div style={{ display: 'flex', gap: 40 }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 8 }}>서비스</p>
                  <p onClick={handleStart} style={{ cursor: 'pointer', marginBottom: 6 }}>적성 테스트</p>
                  <p onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>학원 둘러보기</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginBottom: 8 }}>고객지원</p>
                  <p style={{ marginBottom: 6 }}>이용약관</p>
                  <p>개인정보처리방침</p>
                </div>
              </div>
            </div>
            <div style={{
              paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)',
              lineHeight: 1.8,
            }}>
              <p>주식회사 대시(DA-SH) · 대표 도영민</p>
              <p>서울특별시 중구 세종대로 136, 3층 에스3097호(무교동, 파이낸스빌딩)</p>
              <p>전화번호 : 010-8896-4567 · 사업자등록번호 : 340-87-03755</p>
              <p>통신판매업신고번호 : 제2026-서울중구-204호</p>
              <p style={{ marginTop: 16, color: 'rgba(114,120,131,0.6)' }}>© 2025 DA-SH. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* ─── 하단 고정 CTA ─── */}
        <div className="lp-fixed-bar" style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 20px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(transparent, #fff 30%)',
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: showSticky ? 1 : 0,
          pointerEvents: showSticky ? 'auto' : 'none',
        }}>
          <button
            onClick={handleStart}
            className="press lp-fixed-btn"
            style={{
              width: '100%',
              borderRadius: 16, border: 'none',
              background: colors['orange-40'],
              fontWeight: 700,
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
  // STEP: COLLECT — 이름/전화번호/지역 수집
  // ════════════════════════════════════════
  if (step === 'collect') {
    return (
      <div className="lp-page lp-form" style={{ background: '#fff' }}>
        <style>{RESPONSIVE_CSS}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
          <button onClick={() => setStep('intro')}
            style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}>
            <ArrowLeft size={22} color="#141517" />
          </button>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#141517' }}>
            시작하기
          </span>
        </div>

        <div className="lp-collect-section">
          <h2 className="lp-collect-title" style={{
            fontWeight: 900, color: '#141517', lineHeight: 1.4,
            letterSpacing: -0.5, marginBottom: 8,
          }}>
            먼저 간단한 정보만<br />알려주세요
          </h2>
          <p style={{ fontSize: 15, color: '#727883', lineHeight: 1.5, marginBottom: 32 }}>
            맞춤 자격증 추천과 학원 안내를 위해 필요해요.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
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

          {/* 지역 선택 */}
          <p style={{ fontSize: 14, fontWeight: 600, color: '#141517', marginBottom: 10 }}>
            <MapPin size={14} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
            어디에서 다닐 수 있어요?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            {REGION_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setRegion(opt.id)} className="press"
                style={{
                  padding: '14px 0', borderRadius: 12,
                  border: `2px solid ${region === opt.id ? colors['orange-40'] : '#F3F4F6'}`,
                  background: region === opt.id ? `${colors['orange-40']}08` : '#fff',
                  fontSize: 15, fontWeight: region === opt.id ? 700 : 500,
                  color: region === opt.id ? colors['orange-40'] : '#141517',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}>
                {opt.label}
              </button>
            ))}
          </div>

          {collectError && <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 12, textAlign: 'center' }}>{collectError}</p>}

          <button onClick={handleCollectSubmit} disabled={saving} className="press" style={{
            width: '100%', padding: '16px 0', borderRadius: 14, border: 'none',
            background: saving ? '#B2B8C0' : colors['orange-40'],
            fontSize: 17, fontWeight: 700, color: '#fff',
            cursor: saving ? 'default' : 'pointer',
            boxShadow: `0 8px 24px ${colors['orange-40']}30`,
          }}>
            {saving ? '저장 중...' : '테스트 시작하기'}
          </button>

          <p style={{ fontSize: 11, color: '#B2B8C0', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
            입력하신 정보는 맞춤 학원 안내 목적으로만 사용되며,<br />외부에 제공하지 않습니다.
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STEP: TEST — 질문 플로우 (지역 제외 9문제)
  // ════════════════════════════════════════
  if (step === 'test') {
    const question = testQuestions[currentQ];
    return (
      <div className="lp-page lp-form" style={{ background: '#fff', position: 'relative' }}>
        <style>{RESPONSIVE_CSS}</style>
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
        <div className="lp-test-pad" style={{
          opacity: animDir === 'exit' ? 0 : 1,
          transform: animDir === 'exit' ? 'translateX(-20px)' : animDir === 'enter' ? 'translateX(0)' : 'none',
          transition: 'opacity 0.2s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{ marginBottom: 32 }}>
            <h2 className="lp-test-q" style={{ fontWeight: 900, color: '#141517', lineHeight: 1.4, letterSpacing: -0.5, marginBottom: 8 }}>
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
                <button key={option.id} onClick={() => handleSelect(option.id)} className="press lp-test-opt"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    borderRadius: 14,
                    border: `2px solid ${isSelected ? colors['orange-40'] : '#F3F4F6'}`,
                    background: isSelected ? `${colors['orange-40']}08` : '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? colors['orange-40'] : '#141517',
                  }}>
                  <span style={{ flex: 1 }}>
                    {option.label}
                  </span>
                  {isSelected && <ChevronRight size={18} color={colors['orange-40']} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lp-fixed-bar" style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          padding: '16px 20px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          textAlign: 'center', background: 'linear-gradient(transparent, rgba(255,255,255,0.95) 30%)',
        }}>
          <p style={{ fontSize: 12, color: '#B2B8C0' }}>선택하면 자동으로 다음 질문으로 넘어가요</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // STEP: RESULT — 바로 결과 공개
  // ════════════════════════════════════════
  const rankIcons = [Trophy, Medal, Award];
  const rankColors = [colors['orange-40'], '#6B7280', '#CD7F32'];
  const rankLabels = ['최고 적합', '추천', '추천'];

  return (
    <div className="lp-page lp-result" style={{ background: '#F8F9FA' }}>
      <style>{RESPONSIVE_CSS}</style>
      {/* Hero Result */}
      <div className="lp-result-hero" style={{
        background: `linear-gradient(135deg, ${colors['orange-40']}, ${colors['orange-60']})`,
        color: '#fff', textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>당신에게 가장 잘 맞는 자격증은</p>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
          <Trophy size={48} color="#fff" strokeWidth={1.5} />
        </div>
        <h1 className="lp-result-name" style={{ fontWeight: 900, letterSpacing: -0.5, marginBottom: 8, color: '#fff' }}>
          {top3[0]?.name}
        </h1>
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
      <div className="lp-result-cards">
        <h2 className="lp-result-section-title" style={{ fontWeight: 900, color: '#141517', marginBottom: 16 }}>
          TOP 3 추천 자격증
        </h2>

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
                    <span className="lp-result-card-name" style={{ fontWeight: 700, color: '#141517' }}>{result.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: rankColors[idx],
                      background: `${rankColors[idx]}12`, padding: '2px 8px', borderRadius: 100,
                    }}>{rankLabels[idx]}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#727883' }}>예상 월급 {result.salaryRange}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="lp-result-match" style={{ fontWeight: 900, color: rankColors[idx] }}>{result.matchPercent}%</div>
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
      <div className="lp-result-bottom" style={{
        position: 'sticky', bottom: 0,
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
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
