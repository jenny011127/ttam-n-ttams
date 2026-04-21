'use client';

import {
  ChevronRight,
  Settings,
  CalendarDays,
  Heart,
  Gift,
  MessageSquare,
  Bell,
  HelpCircle,
  Award,
  BookOpen,
  Flame,
} from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';

const menuItems = [
  { icon: CalendarDays, label: '내 수강 신청 내역', badge: '' },
  { icon: Heart, label: '찜한 학원', badge: '3' },
  { icon: Award, label: '관심 자격증', badge: '' },
  { icon: Gift, label: '혜택', badge: '' },
  { icon: MessageSquare, label: '후기', sub: '포인트를 받을 수 있어요' },
  { icon: Bell, label: '알림', badge: '2' },
];

export default function MyTab() {
  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 20px' }}>
        <h1 style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.black }}>
          마이페이지
        </h1>
        <Settings size={22} color={colors['gray-60']} style={{ cursor: 'pointer' }} />
      </div>

      {/* Profile Card */}
      <div style={{ margin: '0 20px 16px', padding: 20, background: colors.white, borderRadius: radius.lg, border: `1px solid ${colors['gray-10']}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: colors['orange-10'],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            <Flame size={24} color={colors['orange-40']} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black }}>
                게스트
              </span>
              <ChevronRight size={16} color={colors['gray-40']} />
            </div>
            <span style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>
              로그인하고 더 많은 혜택을 받아보세요
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'flex', borderTop: `1px solid ${colors['gray-10']}`, paddingTop: 16 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black }}>0 P</div>
            <div style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>내 포인트</div>
          </div>
          <div style={{ width: 1, background: colors['gray-10'] }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.black }}>0 개</div>
            <div style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>내 쿠폰</div>
          </div>
        </div>
      </div>

      {/* Suggestion Banner */}
      <div
        style={{
          margin: '0 20px 20px',
          padding: '14px 16px',
          background: colors['orange-10'],
          borderRadius: radius.md,
          border: `1px solid ${colors['orange-20']}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <BookOpen size={20} color={colors['orange-40']} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: fontSize.sm, color: colors['gray-90'] }}>
            나와 비슷한 사람은 어떤 자격증을 땄을까?
          </p>
          <p style={{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors['orange-40'] }}>
            자격증 추천 받기
          </p>
        </div>
        <span style={{ fontSize: fontSize.xs, color: colors['gray-40'], border: `1px solid ${colors['gray-30']}`, borderRadius: 4, padding: '1px 6px' }}>
          베타
        </span>
      </div>

      {/* Menu List */}
      <div style={{ margin: '0 20px', background: colors.white, borderRadius: radius.lg, border: `1px solid ${colors['gray-10']}`, overflow: 'hidden' }}>
        {menuItems.map((item, idx) => (
          <button
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              padding: '16px 18px',
              background: 'none',
              border: 'none',
              borderBottom: idx < menuItems.length - 1 ? `1px solid ${colors['gray-10']}` : 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <item.icon size={20} color={colors['gray-60']} />
            <span style={{ flex: 1, fontSize: fontSize.md, color: colors.black }}>
              {item.label}
            </span>
            {item.sub && (
              <span style={{
                fontSize: fontSize.xs,
                color: colors['orange-40'],
                background: colors['orange-10'],
                padding: '2px 8px',
                borderRadius: radius.full,
                fontWeight: fontWeight.medium,
              }}>
                {item.sub}
              </span>
            )}
            {item.badge && (
              <span style={{
                fontSize: fontSize.xs,
                fontWeight: fontWeight.bold,
                color: colors.white,
                background: colors['orange-40'],
                width: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.badge}
              </span>
            )}
            <ChevronRight size={16} color={colors['gray-30']} />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ margin: '20px 20px 0', padding: '16px 0', borderTop: `1px solid ${colors['gray-10']}` }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: fontSize.md,
            color: colors['gray-60'],
          }}
        >
          <HelpCircle size={18} />
          고객센터
        </button>
      </div>
    </div>
  );
}
