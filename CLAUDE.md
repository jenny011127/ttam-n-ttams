@AGENTS.md

# 땀앤땀스 프로젝트

## 개요
- **땀앤땀스** = 자격증 학원 비교 플랫폼 (강남언니 모델)
- 뜻: "AI가 대신할 수 없는 육체적 노동, 땀 흘리자"
- 수익: 학원 → CPA 광고비 (국비지원 마케팅 예산 흡수)
- 2단계: 자격증 취득 후 일자리 매칭

## 기술 스택
- Next.js 16 + TypeScript + React 19
- Tailwind CSS v4 (`@theme inline` 패턴)
- Supabase (DB + 백엔드)
- Vercel 배포
- lucide-react 아이콘
- Pretendard Variable 폰트

## 디자인 시스템
- **Key Color**: Orange/40 `#F9502E`
- **Orange scale**: 60→10 (design-tokens.ts 참고)
- **Gray scale**: 알밤 그대로 계승 (90→05)
- **Navy**: `#1B202C`, **Black**: `#1D1D1D`
- **Semantic**: 국비지원 `#3B82F6`, 합격률 `#10B981`, 별점 `#FBBF24`
- 인라인 스타일 + design-tokens 상수 사용 (Tailwind 클래스 최소화)
- 모바일 앱셸: max-width 430px, 하단 safe-area

## 디렉토리 구조
- `src/lib/design-tokens.ts` — 컬러/폰트/간격/그림자 상수
- `src/lib/categories.ts` — 8개 자격증 카테고리
- `src/lib/data/` — 카테고리별 더미 데이터 (학원36, 과정14, 리뷰16)
- `src/lib/data/mock-exams.ts` — 모의고사 문항 (4개 카테고리 × 10문항)
- `src/components/tabs/` — 5개 탭 (Home, Search, Ranking, Review, My)
- `src/components/shared/` — AcademyCard, StarRating
- `src/app/academy/[id]/` — 학원 상세 페이지
- `src/app/exam/[categoryId]/` — 모의고사 CBT 페이지

## UX 벤치마크
- **강남언니** (거래/전환 중심): 카드 리스트, 인증뱃지, 별점+리뷰수, 가격, 카테고리 칩
- 하단 네비: 홈 | 학원찾기 | 랭킹 | 후기 | 마이

## 팀
- 민지 (PM/개발)
- branden@da-sh.io (대표, GitHub collaborator 초대 필요)
- GitHub: jenny011127 계정 (SSH 연결)

## 자격증 카테고리 (8개)
요양보호사, 한식조리기능사, 지게차운전기능사, 제과기능사, 미용사/네일, 필라테스/요가, 용접기능사, 전기기능사

## 시장 배경
- 국비지원 학원: 정부가 수강생 1명당 훈련비 지급 → 학원은 수강생 유치가 핵심
- 땀앤땀스가 이 마케팅 비용을 가져오는 CPA 구조
- 참고: 보살핌(월 5억), 강남언니(연 417억 매출, 영업이익 122억)
