'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, Share2, Heart, BadgeCheck, MapPin, Phone, Clock,
  Users, Star, GraduationCap, Briefcase, Shield,
  Calendar, BookOpen
} from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import { getAcademyById, getCoursesByAcademy, getReviewsByAcademy } from '@/lib/data';
import { categories } from '@/lib/categories';
import StarRating from '@/components/shared/StarRating';
import type { Course, Review } from '@/types';

type DetailTab = 'info' | 'courses' | 'reviews' | 'location';

export default function AcademyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [liked, setLiked] = useState(false);

  const academy = getAcademyById(id);
  const courses = academy ? getCoursesByAcademy(academy.id) : [];
  const reviews = academy ? getReviewsByAcademy(academy.id) : [];
  const category = categories.find((c) => c.id === academy?.categoryId);

  if (!academy) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', color: colors['gray-60'] }}>
          <p style={{ fontSize: fontSize.lg, marginBottom: 12 }}>학원을 찾을 수 없습니다</p>
          <button
            onClick={() => router.push('/')}
            style={{
              background: colors['orange-40'],
              color: colors.white,
              border: 'none',
              padding: '10px 24px',
              borderRadius: radius.full,
              fontSize: fontSize.md,
              fontWeight: fontWeight.semibold,
              cursor: 'pointer',
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const detailTabs: { id: DetailTab; label: string }[] = [
    { id: 'info', label: '정보' },
    { id: 'courses', label: `과정 ${courses.length}` },
    { id: 'reviews', label: `후기 ${academy.reviewCount}` },
    { id: 'location', label: '위치' },
  ];

  const avgSubRating = reviews.length > 0
    ? {
        curriculum: (reviews.reduce((s, r) => s + r.ratingCurriculum, 0) / reviews.length).toFixed(1),
        instructor: (reviews.reduce((s, r) => s + r.ratingInstructor, 0) / reviews.length).toFixed(1),
        facility: (reviews.reduce((s, r) => s + r.ratingFacility, 0) / reviews.length).toFixed(1),
        value: (reviews.reduce((s, r) => s + r.ratingValue, 0) / reviews.length).toFixed(1),
      }
    : null;

  return (
    <div className="app-shell" style={{ paddingBottom: 80 }}>
      {/* Top Nav */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 50,
        }}
      >
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={24} color={colors.black} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <Share2 size={20} color={colors['gray-60']} />
        </button>
      </div>

      {/* Hero Image */}
      <div
        style={{
          height: 200,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {academy.thumbnail ? (
          <img
            src={academy.thumbnail}
            alt={academy.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${category?.color || colors['gray-10']}18, ${category?.color || colors['gray-10']}30)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={64} color={category?.color || colors['gray-40']} style={{ opacity: 0.3 }} />
          </div>
        )}
        {/* Badges */}
        <div style={{ position: 'absolute', bottom: 12, left: 16, display: 'flex', gap: 6 }}>
          {academy.isGovernmentFunded && (
            <span style={{ background: colors.government, color: colors.white, fontSize: 11, fontWeight: fontWeight.bold, padding: '4px 10px', borderRadius: radius.full }}>
              국비지원
            </span>
          )}
          {academy.isVerified && (
            <span style={{ background: colors.navy, color: colors.white, fontSize: 11, fontWeight: fontWeight.bold, padding: '4px 10px', borderRadius: radius.full }}>
              인증학원
            </span>
          )}
        </div>
      </div>

      {/* Academy Info */}
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          {academy.isVerified && <BadgeCheck size={16} color={colors.government} fill={colors.government} strokeWidth={0} />}
          <span style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>{academy.addressShort} · {category?.name}</span>
        </div>
        <h1 style={{ fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, color: colors.black, marginBottom: 8, lineHeight: 1.3 }}>
          {academy.name}
        </h1>
        <p style={{ fontSize: fontSize.md, color: colors['gray-90'], lineHeight: 1.5, marginBottom: 16 }}>
          {academy.shortDescription}
        </p>

        {/* Quick Stats */}
        <div style={{ display: 'flex', gap: 0, background: colors['gray-05'], borderRadius: radius.lg, overflow: 'hidden' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
            <span style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.black, display: 'block', marginBottom: 4 }}>{academy.avgRating}</span>
            <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>평점</span>
          </div>
          <div style={{ width: 1, background: colors['gray-20'], margin: '12px 0' }} />
          <div style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
            <span style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.success, display: 'block', marginBottom: 4 }}>{academy.passRate}%</span>
            <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>합격률</span>
          </div>
          <div style={{ width: 1, background: colors['gray-20'], margin: '12px 0' }} />
          <div style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
            <span style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.black, display: 'block', marginBottom: 4 }}>{(academy.totalStudents / 1000).toFixed(1)}K</span>
            <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>누적 수강</span>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <div style={{ display: 'flex', borderBottom: `2px solid ${colors['gray-10']}`, position: 'sticky', top: 48, background: colors.white, zIndex: 40 }}>
        {detailTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${colors['orange-40']}` : '2px solid transparent',
              color: activeTab === tab.id ? colors['orange-40'] : colors['gray-60'],
              fontSize: fontSize.base,
              fontWeight: activeTab === tab.id ? fontWeight.semibold : fontWeight.normal,
              cursor: 'pointer',
              marginBottom: -2,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 20 }}>
        {activeTab === 'info' && (
          <InfoSection academy={academy} />
        )}
        {activeTab === 'courses' && (
          <CoursesSection courses={courses} />
        )}
        {activeTab === 'reviews' && (
          <ReviewsSection reviews={reviews} avgRating={academy.avgRating} avgSubRating={avgSubRating} />
        )}
        {activeTab === 'location' && (
          <LocationSection academy={academy} />
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div
        className="bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: colors.white,
          borderTop: `1px solid ${colors['gray-20']}`,
          padding: '12px 20px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          display: 'flex',
          gap: 12,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setLiked(!liked)}
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.md,
            border: `1px solid ${colors['gray-20']}`,
            background: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Heart size={22} color={liked ? colors['orange-40'] : colors['gray-40']} fill={liked ? colors['orange-40'] : 'none'} />
        </button>
        <button
          style={{
            flex: 1,
            height: 48,
            borderRadius: radius.md,
            border: 'none',
            background: colors['orange-40'],
            color: colors.white,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            cursor: 'pointer',
          }}
          className="float-pulse"
        >
          수강 신청하기
        </button>
      </div>
    </div>
  );
}

// ─── Info Section ───
function InfoSection({ academy }: { academy: ReturnType<typeof getAcademyById> }) {
  if (!academy) return null;
  return (
    <div>
      <p style={{ fontSize: fontSize.md, color: colors['gray-90'], lineHeight: 1.7, marginBottom: 24 }}>
        {academy.description}
      </p>

      {academy.isGovernmentFunded && (
        <div style={{ background: '#EFF6FF', borderRadius: radius.md, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={18} color={colors.government} />
            <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.government }}>국비지원 학원</span>
          </div>
          <p style={{ fontSize: fontSize.sm, color: colors['gray-90'], lineHeight: 1.5 }}>
            내일배움카드로 수강료의 최대 85%를 지원받을 수 있습니다.
            본인부담금: <strong>{academy.governmentFundAmount.toLocaleString()}원~</strong>
          </p>
        </div>
      )}

      {academy.hasEmploymentSupport && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, background: '#ECFDF5', borderRadius: radius.md, marginBottom: 20 }}>
          <Briefcase size={18} color={colors.success} />
          <span style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.success }}>취업 지원 프로그램 운영</span>
        </div>
      )}

      <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: 12 }}>편의시설</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {academy.facilities.map((f) => (
          <span key={f} style={{ fontSize: fontSize.sm, color: colors['gray-90'], background: colors['gray-05'], padding: '6px 12px', borderRadius: radius.full }}>
            {f}
          </span>
        ))}
      </div>

      <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: 12 }}>연락처</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Phone size={16} color={colors['gray-60']} />
          <span style={{ fontSize: fontSize.md, color: colors.black }}>{academy.phone}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={16} color={colors['gray-60']} />
          <span style={{ fontSize: fontSize.md, color: colors.black }}>{academy.address}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Courses Section ───
function CoursesSection({ courses }: { courses: Course[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {courses.map((course) => (
        <div key={course.id} style={{ border: `1px solid ${colors['gray-10']}`, borderRadius: radius.lg, padding: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <BookOpen size={16} color={colors['orange-40']} />
            <h3 style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.black }}>{course.name}</h3>
          </div>
          <p style={{ fontSize: fontSize.sm, color: colors['gray-60'], marginBottom: 12 }}>{course.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} color={colors['gray-40']} />
              <span style={{ fontSize: fontSize.xs, color: colors['gray-90'] }}>{course.durationWeeks}주 / {course.totalHours}시간</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} color={colors['gray-40']} />
              <span style={{ fontSize: fontSize.xs, color: colors['gray-90'] }}>개강 {course.startDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={13} color={colors['gray-40']} />
              <span style={{ fontSize: fontSize.xs, color: colors['gray-90'] }}>{course.enrolled}/{course.capacity}명</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} color={colors['gray-40']} />
              <span style={{ fontSize: fontSize.xs, color: colors['gray-90'] }}>{course.scheduleText}</span>
            </div>
          </div>

          {/* Price */}
          <div style={{ background: colors['gray-05'], borderRadius: radius.md, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>수강료</span>
              <span style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black }}>{course.price.toLocaleString()}원</span>
            </div>
            {course.isGovernmentFunded && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${colors['gray-20']}` }}>
                <span style={{ fontSize: fontSize.sm, color: colors.government, fontWeight: fontWeight.semibold }}>국비지원 본인부담금</span>
                <span style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.government }}>{course.governmentFundedPrice.toLocaleString()}원</span>
              </div>
            )}
          </div>

          {/* Enrollment Bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>모집현황</span>
              <span style={{ fontSize: fontSize.xs, color: course.enrolled / course.capacity > 0.8 ? colors['orange-40'] : colors['gray-60'] }}>
                {course.enrolled}/{course.capacity}명 {course.enrolled / course.capacity > 0.8 && '(마감임박!)'}
              </span>
            </div>
            <div style={{ height: 6, background: colors['gray-10'], borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(course.enrolled / course.capacity) * 100}%`, background: course.enrolled / course.capacity > 0.8 ? colors['orange-40'] : colors.government, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      ))}
      {courses.length === 0 && (
        <p style={{ textAlign: 'center', color: colors['gray-60'], padding: 40 }}>등록된 과정이 없습니다</p>
      )}
    </div>
  );
}

// ─── Reviews Section ───
function ReviewsSection({ reviews, avgRating, avgSubRating }: { reviews: Review[]; avgRating: number; avgSubRating: { curriculum: string; instructor: string; facility: string; value: string } | null }) {
  return (
    <div>
      {/* Rating Summary */}
      {avgSubRating && (
        <div style={{ background: colors['gray-05'], borderRadius: radius.lg, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: fontWeight.bold, color: colors.black }}>{avgRating.toFixed(1)}</div>
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill={i <= Math.round(avgRating) ? colors.star : colors['gray-20']} color={i <= Math.round(avgRating) ? colors.star : colors['gray-20']} />
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {[
                { label: '커리큘럼', value: avgSubRating.curriculum },
                { label: '강사', value: avgSubRating.instructor },
                { label: '시설', value: avgSubRating.facility },
                { label: '가성비', value: avgSubRating.value },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: fontSize.xs, color: colors['gray-60'], width: 48 }}>{label}</span>
                  <div style={{ flex: 1, height: 4, background: colors['gray-20'], borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(parseFloat(value) / 5) * 100}%`, background: colors.star, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.black, width: 24, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviews.map((review) => (
          <div key={review.id} style={{ paddingBottom: 16, borderBottom: `1px solid ${colors['gray-10']}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: fontSize.base, fontWeight: fontWeight.semibold }}>{review.authorName}</span>
                <span style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>{review.authorAgeGroup}</span>
                {review.passed && (
                  <span style={{ fontSize: 10, fontWeight: fontWeight.bold, color: colors.success, background: '#ECFDF5', padding: '1px 6px', borderRadius: 4 }}>합격</span>
                )}
              </div>
              <span style={{ fontSize: fontSize.xs, color: colors['gray-40'] }}>{review.createdAt}</span>
            </div>
            <StarRating rating={review.rating} showCount={false} size={12} />
            <h4 style={{ fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.black, margin: '8px 0 4px' }}>{review.title}</h4>
            <p style={{ fontSize: fontSize.sm, color: colors['gray-90'], lineHeight: 1.6 }}>{review.content}</p>
          </div>
        ))}
        {reviews.length === 0 && (
          <p style={{ textAlign: 'center', color: colors['gray-60'], padding: 40 }}>아직 후기가 없습니다</p>
        )}
      </div>
    </div>
  );
}

// ─── Location Section ───
function LocationSection({ academy }: { academy: ReturnType<typeof getAcademyById> }) {
  if (!academy) return null;
  return (
    <div>
      <div style={{ height: 200, background: colors['gray-05'], borderRadius: radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ textAlign: 'center', color: colors['gray-40'] }}>
          <MapPin size={32} />
          <p style={{ fontSize: fontSize.sm, marginTop: 8 }}>지도 영역</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
        <MapPin size={18} color={colors['gray-60']} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.black, marginBottom: 4 }}>{academy.address}</p>
          <p style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>{academy.addressShort}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <Phone size={18} color={colors['gray-60']} />
        <a href={`tel:${academy.phone}`} style={{ fontSize: fontSize.md, color: colors.government, fontWeight: fontWeight.medium }}>
          {academy.phone}
        </a>
      </div>
    </div>
  );
}
