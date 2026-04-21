'use client';

import { useRef, useEffect, useState } from 'react';
import { Home, Search, Trophy, MessageSquare, User } from 'lucide-react';
import { colors, fontSize, fontWeight } from '@/lib/design-tokens';

const tabs = [
  { id: 'home', label: '홈', Icon: Home },
  { id: 'search', label: '학원찾기', Icon: Search },
  { id: 'ranking', label: '랭킹', Icon: Trophy },
  { id: 'review', label: '후기', Icon: MessageSquare },
  { id: 'my', label: '마이', Icon: User },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: TabId) => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const [indicatorLeft, setIndicatorLeft] = useState(0);

  // Calculate indicator position
  useEffect(() => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    if (navRef.current && idx >= 0) {
      const btn = navRef.current.children[idx + 1] as HTMLElement; // +1 for indicator div
      if (btn) {
        const navRect = navRef.current.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        setIndicatorLeft(btnRect.left - navRect.left + btnRect.width / 2 - 16);
      }
    }
  }, [activeTab]);

  return (
    <nav
      ref={navRef}
      className="bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        maxWidth: 430,
        left: '50%',
        transform: 'translateX(-50%)',
        background: colors.white,
        borderTop: `1px solid ${colors['gray-20']}`,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 100,
      }}
    >
      {/* Sliding indicator bar */}
      <div className="nav-indicator" style={{ left: indicatorLeft }} />

      {tabs.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            className="tab-btn"
            onClick={() => onTabChange(id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              minWidth: 56,
            }}
          >
            <div className={`tab-icon-wrap ${active ? 'active' : ''}`}>
              <Icon
                size={22}
                color={active ? colors['orange-40'] : colors['gray-60']}
                strokeWidth={active ? 2.2 : 1.8}
              />
            </div>
            <span
              className={`tab-label ${active ? 'active' : ''}`}
              style={{
                fontSize: fontSize.xs,
                fontWeight: active ? fontWeight.semibold : fontWeight.normal,
                color: active ? colors['orange-40'] : colors['gray-60'],
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
