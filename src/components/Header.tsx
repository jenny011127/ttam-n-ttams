'use client';

import { Bell } from 'lucide-react';
import { colors, fontSize, fontWeight } from '@/lib/design-tokens';

export default function Header() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: colors.white,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold, color: colors['orange-40'], fontFamily: "'JalnanGothic', sans-serif" }}>
          땀앤땀스
        </span>
      </div>
      <button
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 999,
        }}
      >
        <Bell size={22} color={colors['gray-60']} />
      </button>
    </header>
  );
}
