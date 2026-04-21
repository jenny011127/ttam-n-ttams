'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Clock, CheckCircle, XCircle, ChevronRight, RotateCcw, Home, Trophy, ClipboardList } from 'lucide-react';
import { colors, fontSize, fontWeight, radius } from '@/lib/design-tokens';
import { getExamByCategory } from '@/lib/data/mock-exams';

type ExamState = 'ready' | 'taking' | 'result';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const exam = getExamByCategory(categoryId);

  const [state, setState] = useState<ExamState>('ready');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (state === 'taking' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (state === 'taking' && timeLeft === 0 && exam) {
      setState('result');
    }
  }, [state, timeLeft, exam]);

  const startExam = useCallback(() => {
    if (!exam) return;
    setAnswers(new Array(exam.questions.length).fill(null));
    setCurrentQ(0);
    setTimeLeft(exam.timeMinutes * 60);
    setShowExplanation(false);
    setState('taking');
  }, [exam]);

  if (!exam) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: fontSize.lg, color: colors['gray-60'], marginBottom: 16 }}>
            해당 카테고리의 모의고사가 아직 준비되지 않았습니다
          </p>
          <button
            onClick={() => router.push('/')}
            style={{ background: colors['orange-40'], color: colors.white, border: 'none', padding: '10px 24px', borderRadius: radius.full, fontSize: fontSize.md, fontWeight: fontWeight.semibold, cursor: 'pointer' }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const score = answers.filter((a, i) => a === exam.questions[i].answer).length;
  const scorePercent = Math.round((score / exam.questions.length) * 100);
  const passed = scorePercent >= exam.passingScore;

  // ─── Ready Screen ───
  if (state === 'ready') {
    return (
      <div className="app-shell" style={{ minHeight: '100vh' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeft size={24} color={colors.black} />
          </button>
        </div>

        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: colors['orange-10'], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ClipboardList size={36} color={colors['orange-40']} />
          </div>
          <h1 style={{ fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, color: colors.black, marginBottom: 8 }}>
            {exam.categoryName}
          </h1>
          <p style={{ fontSize: fontSize.lg, color: colors['gray-60'], marginBottom: 32 }}>
            필기시험 모의고사
          </p>

          <div style={{ background: colors['gray-05'], borderRadius: radius.lg, padding: 24, marginBottom: 32, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: fontSize.md, color: colors['gray-60'] }}>문항 수</span>
              <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.black }}>{exam.totalQuestions}문제</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: fontSize.md, color: colors['gray-60'] }}>제한 시간</span>
              <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.black }}>{exam.timeMinutes}분</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: fontSize.md, color: colors['gray-60'] }}>합격 기준</span>
              <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.success }}>{exam.passingScore}점 이상</span>
            </div>
          </div>

          <button
            onClick={startExam}
            style={{
              width: '100%',
              height: 52,
              background: colors['orange-40'],
              color: colors.white,
              border: 'none',
              borderRadius: radius.md,
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              cursor: 'pointer',
            }}
          >
            시험 시작하기
          </button>
        </div>
      </div>
    );
  }

  // ─── Result Screen ───
  if (state === 'result') {
    return (
      <div className="app-shell" style={{ minHeight: '100vh' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeft size={24} color={colors.black} />
          </button>
        </div>

        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: passed ? '#ECFDF5' : colors['orange-10'],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 48,
          }}>
            {passed ? '🎉' : '😢'}
          </div>

          <h1 style={{ fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, color: passed ? colors.success : colors['orange-40'], marginBottom: 4 }}>
            {passed ? '합격!' : '불합격'}
          </h1>
          <p style={{ fontSize: fontSize.md, color: colors['gray-60'], marginBottom: 24 }}>
            {exam.categoryName} 필기시험 모의고사
          </p>

          {/* Score Circle */}
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            border: `6px solid ${passed ? colors.success : colors['orange-40']}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <span style={{ fontSize: 36, fontWeight: fontWeight.bold, color: colors.black }}>{scorePercent}</span>
            <span style={{ fontSize: fontSize.sm, color: colors['gray-60'] }}>/ 100점</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.success }}>{score}</div>
              <div style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>정답</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors['orange-40'] }}>{exam.questions.length - score}</div>
              <div style={{ fontSize: fontSize.xs, color: colors['gray-60'] }}>오답</div>
            </div>
          </div>

          {/* Answer Review */}
          <div style={{ textAlign: 'left', marginBottom: 24 }}>
            <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: 12 }}>오답 확인</h3>
            {exam.questions.map((q, i) => {
              const isCorrect = answers[i] === q.answer;
              return (
                <div key={q.id} style={{ padding: '12px 0', borderBottom: `1px solid ${colors['gray-10']}` }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                    {isCorrect ? <CheckCircle size={18} color={colors.success} style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={18} color={colors['orange-40']} style={{ flexShrink: 0, marginTop: 2 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: fontSize.sm, color: colors.black, marginBottom: 4 }}>
                        <strong>Q{i + 1}.</strong> {q.question}
                      </p>
                      {!isCorrect && (
                        <>
                          <p style={{ fontSize: fontSize.xs, color: colors['orange-40'] }}>
                            내 답: {answers[i] !== null ? q.options[answers[i]!] : '미응답'}
                          </p>
                          <p style={{ fontSize: fontSize.xs, color: colors.success }}>
                            정답: {q.options[q.answer]}
                          </p>
                          <p style={{ fontSize: fontSize.xs, color: colors['gray-60'], marginTop: 4, lineHeight: 1.4 }}>
                            {q.explanation}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={startExam}
              style={{ flex: 1, height: 48, borderRadius: radius.md, border: `1px solid ${colors['gray-20']}`, background: colors.white, color: colors.black, fontSize: fontSize.md, fontWeight: fontWeight.semibold, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <RotateCcw size={16} /> 다시 풀기
            </button>
            <button
              onClick={() => router.push('/')}
              style={{ flex: 1, height: 48, borderRadius: radius.md, border: 'none', background: colors['orange-40'], color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Home size={16} /> 홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Taking Exam ───
  const question = exam.questions[currentQ];
  const selectedAnswer = answers[currentQ];

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors['gray-10']}` }}>
        <button onClick={() => { if (confirm('시험을 종료하시겠습니까?')) setState('result'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ChevronLeft size={24} color={colors.black} />
        </button>
        <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
          {currentQ + 1} / {exam.questions.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: timeLeft < 60 ? colors['orange-40'] : colors['gray-90'] }}>
          <Clock size={16} />
          <span style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: 3, background: colors['gray-10'] }}>
        <div style={{ height: '100%', width: `${((currentQ + 1) / exam.questions.length) * 100}%`, background: colors['orange-40'], transition: 'width 0.3s' }} />
      </div>

      {/* Question */}
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: fontSize.sm, color: colors['orange-40'], fontWeight: fontWeight.bold }}>Q{currentQ + 1}.</span>
          <h2 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.black, lineHeight: 1.5, marginTop: 6 }}>
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.options.map((option, idx) => {
            const selected = selectedAnswer === idx;
            const isCorrectAnswer = showExplanation && idx === question.answer;
            const isWrongAnswer = showExplanation && selected && idx !== question.answer;

            let bgColor: string = colors.white;
            let borderColor: string = colors['gray-20'];
            let textColor: string = colors.black;

            if (isCorrectAnswer) { bgColor = '#ECFDF5'; borderColor = colors.success; textColor = colors.success; }
            else if (isWrongAnswer) { bgColor = '#FFF1F0'; borderColor = colors['orange-40']; textColor = colors['orange-40']; }
            else if (selected && !showExplanation) { bgColor = `${colors['orange-40']}08`; borderColor = colors['orange-40']; textColor = colors['orange-40']; }

            return (
              <button
                key={idx}
                onClick={() => {
                  if (showExplanation) return;
                  const newAnswers = [...answers];
                  newAnswers[currentQ] = idx;
                  setAnswers(newAnswers);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: 12,
                  padding: '14px 16px',
                  borderRadius: radius.md,
                  border: `1.5px solid ${borderColor}`,
                  background: bgColor,
                  cursor: showExplanation ? 'default' : 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: `2px solid ${selected || isCorrectAnswer ? (isWrongAnswer ? colors['orange-40'] : isCorrectAnswer ? colors.success : colors['orange-40']) : colors['gray-30']}`,
                  background: selected || isCorrectAnswer ? (isWrongAnswer ? colors['orange-40'] : isCorrectAnswer ? colors.success : colors['orange-40']) : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: fontWeight.bold,
                  color: selected || isCorrectAnswer ? colors.white : colors['gray-60'],
                  flexShrink: 0,
                }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: fontSize.md, color: textColor, lineHeight: 1.5 }}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div style={{ marginTop: 16, padding: 16, background: '#FFFBEB', borderRadius: radius.md, border: `1px solid ${colors.star}` }}>
            <p style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: '#92400E', marginBottom: 4 }}>해설</p>
            <p style={{ fontSize: fontSize.sm, color: '#78350F', lineHeight: 1.5 }}>{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{ padding: '12px 24px 24px', display: 'flex', gap: 12, borderTop: `1px solid ${colors['gray-10']}` }}>
        {!showExplanation ? (
          <button
            onClick={() => {
              if (selectedAnswer !== null) setShowExplanation(true);
            }}
            disabled={selectedAnswer === null}
            style={{
              flex: 1, height: 48, borderRadius: radius.md, border: 'none',
              background: selectedAnswer !== null ? colors['orange-40'] : colors['gray-20'],
              color: selectedAnswer !== null ? colors.white : colors['gray-40'],
              fontSize: fontSize.md, fontWeight: fontWeight.bold, cursor: selectedAnswer !== null ? 'pointer' : 'default',
            }}
          >
            정답 확인
          </button>
        ) : (
          <button
            onClick={() => {
              setShowExplanation(false);
              if (currentQ < exam.questions.length - 1) {
                setCurrentQ(currentQ + 1);
              } else {
                setState('result');
              }
            }}
            style={{
              flex: 1, height: 48, borderRadius: radius.md, border: 'none',
              background: colors['orange-40'], color: colors.white,
              fontSize: fontSize.md, fontWeight: fontWeight.bold, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {currentQ < exam.questions.length - 1 ? (
              <>다음 문제 <ChevronRight size={18} /></>
            ) : (
              <>결과 보기 <Trophy size={18} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
