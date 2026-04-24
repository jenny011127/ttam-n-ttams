'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { colors, fontSize, fontWeight } from '@/lib/design-tokens';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'exit'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 1800);
    const t3 = setTimeout(onFinish, 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className={`splash ${phase === 'exit' ? 'splash-exit' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors['orange-60'],
      }}
    >
      {/* Logo mark */}
      <div
        className="splash-logo"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Flame size={36} color={colors.white} strokeWidth={2.2} />
        </div>
      </div>

      {/* Brand name */}
      <h1
        className="splash-title"
        style={{
          fontSize: 32,
          fontWeight: fontWeight.bold,
          color: colors.white,
          letterSpacing: -0.5,
          marginBottom: 8,
          fontFamily: "'JalnanGothic', sans-serif",
        }}
      >
        땀앤땀스
      </h1>

      {/* Tagline */}
      <p
        className={`splash-tagline ${phase === 'tagline' || phase === 'exit' ? 'splash-tagline-show' : ''}`}
        style={{
          fontSize: fontSize.base,
          color: 'rgba(255,255,255,0.6)',
          fontWeight: fontWeight.medium,
          textAlign: 'center',
        }}
      >
        흘린 땀은,<br />어디서든 통한다
      </p>
    </div>
  );
}
