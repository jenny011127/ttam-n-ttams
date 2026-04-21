'use client';

import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Heart, Truck, Sparkles, Dumbbell, Flame, Zap, Wrench, LayoutGrid, Paintbrush, Snowflake, Droplets, PaintBucket, Shield, TrendingUp, Award, FileText, ThumbsUp, ClipboardList } from 'lucide-react';
import { colors, fontSize, fontWeight, radius, spacing, shadows } from '@/lib/design-tokens';
import { categories } from '@/lib/categories';
import { getTopAcademies, allReviews, getGovernmentFundedAcademies } from '@/lib/data';
import { getAvailableExamCategories } from '@/lib/data/mock-exams';
import AcademyCard from '@/components/shared/AcademyCard';
import StarRating from '@/components/shared/StarRating';

const iconMap: Record<string, React.ElementType> = {
  Heart, Truck, Sparkles, Dumbbell, Flame, Zap, Wrench, LayoutGrid, Paintbrush, Snowflake, Droplets, PaintBucket,
};

export default function HomeTab({
  onCategorySelect,
  onAcademySelect,
  onSearchOpen,
  onTabChange,
}: {
  onCategorySelect: (id: string) => void;
  onAcademySelect: (id: string) => void;
  onSearchOpen: () => void;
  onTabChange?: (tab: string) => void;
}) {
  const router = useRouter();
  const topAcademies = getTopAcademies(8);
  const govAcademies = getGovernmentFundedAcademies().slice(0, 6);
  const recentReviews = [...allReviews].sort((a, b) => b.helpfulCount - a.helpfulCount).slice(0, 4);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Search Bar (클릭 시 오버레이 오픈) */}
      <div style={{ padding: '0 20px 16px' }}>
        <div
          onClick={onSearchOpen}
          className="press"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: colors['gray-05'],
            borderRadius: radius.xl,
            padding: '12px 16px',
            border: `1px solid ${colors['gray-20']}`,
            cursor: 'pointer',
          }}
        >
          <Search size={18} color={colors['gray-40']} />
          <span style={{ fontSize: fontSize.md, color: colors['gray-40'] }}>
            관심 자격증을 검색해보세요
          </span>
        </div>
      </div>

      {/* 자격증 적성 테스트 배너 (메인 CTA) */}
      <div style={{ padding: '0 20px 20px' }}>
        <div
          className="press"
          onClick={() => router.push('/test')}
          style={{
            background: 'linear-gradient(135deg, #F9502E 0%, #E81B0E 100%)',
            borderRadius: radius.lg,
            padding: '22px 20px 20px',
            color: colors.white,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          {/* 배경 장식 */}
          <div style={{ position: 'absolute', right: 16, top: 16, opacity: 0.12 }}>
            <Award size={80} strokeWidth={1} />
          </div>
          <div style={{ position: 'absolute', right: 70, bottom: 12, opacity: 0.08 }}>
            <Sparkles size={40} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.2)', borderRadius: radius.full,
              padding: '4px 10px', fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
              marginBottom: 12, backdropFilter: 'blur(4px)',
            }}>
              <TrendingUp size={12} /> 12,847명 참여
            </div>

            <h2 style={{ fontSize: fontSize['3xl'], fontWeight: fontWeight.extrabold, lineHeight: 1.3, marginBottom: 6, letterSpacing: -0.5 }}>
              어떤 자격증이<br />나한테 맞을까?
            </h2>
            <p style={{ fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 16, lineHeight: 1.5 }}>
              1분이면 충분해요.<br />딱 맞는 자격증을 추천해드릴게요.
            </p>

            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: colors.white, color: colors['orange-50'],
                fontSize: fontSize.base, fontWeight: fontWeight.bold,
                padding: '11px 22px', borderRadius: radius.full,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              테스트 시작 <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>


      {/* Quick Icons - Category Grid (강남언니 스타일) */}
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
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
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `linear-gradient(145deg, ${cat.color}18, ${cat.color}28)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${cat.color}20, inset 0 1px 1px rgba(255,255,255,0.6)`,
                    border: `1px solid ${cat.color}15`,
                    position: 'relative',
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
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none',
                  }} />
                  <Icon size={26} color={cat.color} strokeWidth={2} style={{ filter: `drop-shadow(0 2px 3px ${cat.color}30)` }} />
                </div>
                <span style={{ fontSize: fontSize.xs, color: colors.black, fontWeight: fontWeight.medium, textAlign: 'center', lineHeight: 1.3 }}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mock Exam Section */}
      <div style={{ background: colors['gray-05'], padding: '24px 0 28px' }}>
        <div style={{ padding: '0 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={20} color={colors['orange-40']} />
          <h2 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.black }}>
            무료 모의고사
          </h2>
          <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
            자격증 필기시험 미리 풀어보기
          </span>
        </div>
        <div className="hscroll" style={{ display: 'flex', gap: 10, paddingLeft: 20, paddingRight: 20 }}>
          {getAvailableExamCategories().map((catId) => {
            const cat = categories.find((c) => c.id === catId);
            if (!cat) return null;
            const Icon = iconMap[cat.icon] || ClipboardList;
            return (
              <a
                key={catId}
                href={`/exam/${catId}`}
                className="press"
                style={{
                  flexShrink: 0,
                  width: 130,
                  padding: '16px 14px',
                  borderRadius: radius.lg,
                  background: colors.white,
                  border: `1px solid ${colors['gray-20']}`,
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: shadows.sm,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: radius.md,
                  background: `${cat.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={cat.color} />
                </div>
                <div>
                  <p style={{ fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.black, marginBottom: 2 }}>
                    {cat.name}
                  </p>
                  <p style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
                    10문제 · 15분
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Recommended Academies - Horizontal Scroll */}
      <div style={{ marginBottom: 28 }}>
        <div
          onClick={() => onTabChange?.('ranking')}
          className="press"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginBottom: 14, cursor: 'pointer' }}
        >
          <h2 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.black }}>
            인기 학원 <span style={{ color: colors['orange-40'] }}>TOP</span>
          </h2>
          <ChevronRight size={20} color={colors['gray-60']} />
        </div>
        <div className="hscroll" style={{ display: 'flex', gap: 14, paddingLeft: 20, paddingRight: 20 }}>
          {topAcademies.map((academy) => (
            <AcademyCard
              key={academy.id}
              academy={academy}
              variant="vertical"
              onClick={() => onAcademySelect(academy.id)}
            />
          ))}
        </div>
      </div>

      {/* Government Funded Section */}
      <div style={{ padding: '0 20px', marginBottom: 28 }}>
        <div
          onClick={() => onTabChange?.('search')}
          className="press"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, cursor: 'pointer' }}
        >
          <h2 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.black }}>
            <span style={{ color: colors.government }}>국비지원</span> 학원
          </h2>
          <ChevronRight size={20} color={colors['gray-60']} />
        </div>

        {/* Government Info Banner */}
        <div
          style={{
            background: '#EFF6FF',
            borderRadius: radius.md,
            padding: '14px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Shield size={20} color={colors.government} />
          <div>
            <p style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.government }}>
              내일배움카드 발급받고 최대 500만원 지원
            </p>
            <p style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
              고용노동부 인증 훈련기관만 엄선
            </p>
          </div>
        </div>

        <div className="hscroll" style={{ display: 'flex', gap: 14 }}>
          {govAcademies.map((academy) => (
            <AcademyCard
              key={academy.id}
              academy={academy}
              variant="vertical"
              onClick={() => onAcademySelect(academy.id)}
            />
          ))}
        </div>
      </div>

      {/* Popular Reviews */}
      <div style={{ padding: '0 20px', marginBottom: 28 }}>
        <div
          onClick={() => onTabChange?.('review')}
          className="press"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, cursor: 'pointer' }}
        >
          <h2 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.black }}>
            인기 후기
          </h2>
          <ChevronRight size={20} color={colors['gray-60']} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recentReviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: colors['gray-05'],
                borderRadius: radius.md,
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StarRating rating={review.rating} size={12} showCount={false} />
                  {review.passed && (
                    <span style={{ fontSize: 10, fontWeight: fontWeight.bold, color: colors.success, background: '#ECFDF5', padding: '2px 6px', borderRadius: 4 }}>
                      합격
                    </span>
                  )}
                </div>
                <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
                  {review.authorName} · {review.authorAgeGroup}
                </span>
              </div>
              <h4 style={{ fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.black, marginBottom: 4 }}>
                {review.title}
              </h4>
              <p style={{ fontSize: fontSize.sm, color: colors['gray-90'], lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                {review.content}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
                  <ThumbsUp size={11} /> {review.helpfulCount}명에게 도움됨
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
