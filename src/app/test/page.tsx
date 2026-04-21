'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import { questions, type Answers } from '@/lib/data/aptitude-test';
import { trackEvent } from '@/lib/track';

export default function TestPage() {
  const router = useRouter();
  useEffect(() => { trackEvent('test_start', { page: '/test' }); }, []);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [animDir, setAnimDir] = useState<'enter' | 'exit' | null>(null);

  const total = questions.length;
  const question = questions[currentQ];
  const progress = ((currentQ) / total) * 100;

  const handleSelect = useCallback((optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));

    if (currentQ < total - 1) {
      // 다음 질문으로
      setAnimDir('exit');
      setTimeout(() => {
        setCurrentQ((prev) => prev + 1);
        setAnimDir('enter');
        setTimeout(() => setAnimDir(null), 300);
      }, 200);
    } else {
      // 결과 페이지로
      const finalAnswers = { ...answers, [question.id]: optionId };
      const params = new URLSearchParams(finalAnswers);
      router.push(`/test/result?${params.toString()}`);
    }
  }, [currentQ, total, question.id, answers, router]);

  const handleBack = () => {
    if (currentQ > 0) {
      setAnimDir('exit');
      setTimeout(() => {
        setCurrentQ((prev) => prev - 1);
        setAnimDir('enter');
        setTimeout(() => setAnimDir(null), 300);
      }, 200);
    } else {
      router.back();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.white,
        maxWidth: 430,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '14px 16px',
          gap: 12,
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            cursor: 'pointer',
            display: 'flex',
          }}
        >
          <ArrowLeft size={22} color={colors.black} />
        </button>
        <span
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.semibold,
            color: colors.black,
          }}
        >
          자격증 적성 테스트
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ padding: '0 20px', marginBottom: 32 }}>
        <div
          style={{
            height: 6,
            background: colors['gray-10'],
            borderRadius: radius.full,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${colors['orange-40']}, ${colors['orange-30']})`,
              borderRadius: radius.full,
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: fontSize.xs,
            color: colors['gray-60'],
          }}
        >
          <span>{currentQ + 1} / {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Question Card */}
      <div
        style={{
          padding: '0 20px',
          opacity: animDir === 'exit' ? 0 : 1,
          transform: animDir === 'exit' ? 'translateX(-20px)' : animDir === 'enter' ? 'translateX(0)' : 'none',
          transition: 'opacity 0.2s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Question Text */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: fontWeight.bold,
              color: colors.black,
              lineHeight: 1.4,
              letterSpacing: -0.5,
              marginBottom: 8,
            }}
          >
            {question.question}
          </h2>
          {question.subtitle && (
            <p
              style={{
                fontSize: fontSize.base,
                color: colors['gray-60'],
                lineHeight: 1.5,
              }}
            >
              {question.subtitle}
            </p>
          )}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className="press"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 18px',
                  borderRadius: radius.lg,
                  border: `2px solid ${isSelected ? colors['orange-40'] : colors['gray-20']}`,
                  background: isSelected ? colors['orange-10'] : colors.white,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: fontSize.lg,
                    fontWeight: isSelected ? fontWeight.bold : fontWeight.medium,
                    color: isSelected ? colors['orange-50'] : colors.black,
                  }}
                >
                  {option.label}
                </span>
                {isSelected && (
                  <ChevronRight size={18} color={colors['orange-40']} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Hint */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 430,
          width: '100%',
          padding: '16px 20px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          textAlign: 'center',
          background: 'linear-gradient(transparent, rgba(255,255,255,0.95) 30%)',
        }}
      >
        <p style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>
          선택하면 자동으로 다음 질문으로 넘어가요
        </p>
      </div>
    </div>
  );
}
