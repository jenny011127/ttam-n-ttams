/**
 * 자격증 적성 테스트 데이터 & 매칭 로직
 * 10개 질문 → 콤보 기반 스코어링 → TOP 3 자격증 + 지역 기반 학원 추천
 */

// ─── 질문 타입 ───
export interface TestQuestion {
  id: string;
  question: string;
  subtitle?: string;
  options: TestOption[];
}

export interface TestOption {
  id: string;
  label: string;
}

// ─── 결과 타입 ───
export interface TestResult {
  categoryId: string;
  name: string;
  score: number;
  matchPercent: number;
  description: string;
  salaryRange: string;
  keywords: string[];
}

// ─── 10개 질문 ───
export const questions: TestQuestion[] = [
  {
    id: 'region',
    question: '어디에서 다닐 수 있어요?',
    subtitle: '가까운 학원을 찾아드릴게요',
    options: [
      { id: 'seoul', label: '서울' },
      { id: 'gyeonggi', label: '경기/인천' },
      { id: 'busan', label: '부산/경남' },
      { id: 'other', label: '그 외 지역' },
    ],
  },
  {
    id: 'gender',
    question: '성별이 어떻게 되세요?',
    subtitle: '직종 적합도를 분석해드릴게요',
    options: [
      { id: 'male', label: '남성' },
      { id: 'female', label: '여성' },
    ],
  },
  {
    id: 'age',
    question: '나이대가 어떻게 되세요?',
    options: [
      { id: 'teen', label: '10대' },
      { id: '20s', label: '20대' },
      { id: '30s', label: '30대' },
      { id: '40plus', label: '40대 이상' },
    ],
  },
  {
    id: 'status',
    question: '지금 어떤 상태예요?',
    options: [
      { id: 'student', label: '학생 (재학/졸업예정)' },
      { id: 'jobseeker', label: '취업 준비 중' },
      { id: 'career-change', label: '이직/전직 준비' },
      { id: 'on-leave', label: '휴직 중 (육아·병가 등)' },
      { id: 'employed', label: '재직 중 (자격증 추가)' },
    ],
  },
  {
    id: 'physical',
    question: '체력에 자신 있으세요?',
    subtitle: '솔직하게 답해주세요!',
    options: [
      { id: 'strong', label: '체력 자신 있음' },
      { id: 'average', label: '보통이에요' },
      { id: 'weak', label: '체력은 좀 약해요' },
    ],
  },
  {
    id: 'dexterity',
    question: '손재주가 있는 편이에요?',
    subtitle: '기술직에서 중요한 역량이에요',
    options: [
      { id: 'skilled', label: '손재주 좋아요' },
      { id: 'average', label: '보통이에요' },
      { id: 'clumsy', label: '손재주는 별로...' },
    ],
  },
  {
    id: 'danger',
    question: '위험한 환경에서도 괜찮아요?',
    subtitle: '높은 곳, 뜨거운 곳, 먼지 등',
    options: [
      { id: 'ok', label: '괜찮아요' },
      { id: 'moderate', label: '약간은 감수 가능' },
      { id: 'no', label: '안전한 곳이 좋아요' },
    ],
  },
  {
    id: 'salary',
    question: '목표 월급이 어느 정도예요?',
    subtitle: '세전 기준이에요',
    options: [
      { id: '200', label: '200~300만원' },
      { id: '300', label: '300~400만원' },
      { id: '400', label: '400~500만원' },
      { id: '500', label: '500만원 이상' },
    ],
  },
  {
    id: 'workstyle',
    question: '어떤 스타일로 일하고 싶어요?',
    options: [
      { id: 'hands-on', label: '몸 쓰는 현장직' },
      { id: 'service', label: '사람 대하는 서비스직' },
      { id: 'creative', label: '꾸미고 만드는 일' },
      { id: 'technical', label: '기술/전문직' },
    ],
  },
  {
    id: 'goal',
    question: '최종 목표가 뭐예요?',
    options: [
      { id: 'stable', label: '안정적인 취업' },
      { id: 'money', label: '고수익이 최고' },
      { id: 'startup', label: '1인 창업/프리랜서' },
      { id: 'skill', label: '기술 하나 제대로' },
    ],
  },
];

// ─── 자격증별 기본 프로필 ───
interface CertProfile {
  categoryId: string;
  name: string;
  baseScore: number;
  salaryRange: string;
  description: string;
  keywords: string[];
  // 매칭 조건
  genderFit: { male: number; female: number };
  ageFit: { teen: number; '20s': number; '30s': number; '40plus': number };
  physicalFit: { strong: number; average: number; weak: number };
  dexterityFit: { skilled: number; average: number; clumsy: number };
  dangerFit: { ok: number; moderate: number; no: number };
  salaryFit: { '200': number; '300': number; '400': number; '500': number };
  workstyleFit: { 'hands-on': number; service: number; creative: number; technical: number };
  goalFit: { stable: number; money: number; startup: number; skill: number };
  statusFit: { student: number; jobseeker: number; 'career-change': number; 'on-leave': number; employed: number };
}

const certProfiles: CertProfile[] = [
  {
    categoryId: 'welding',
    name: '용접기능사',
    baseScore: 50,
    salaryRange: '350~700만원',
    description: '조선·제조업 핵심 기술. 해외취업까지 가능한 고수익 기능직',
    keywords: ['고수익', '해외취업', '현장직', '기술전문'],
    genderFit: { male: 10, female: 2 },
    ageFit: { teen: 6, '20s': 10, '30s': 8, '40plus': 4 },
    physicalFit: { strong: 10, average: 5, weak: 0 },
    dexterityFit: { skilled: 8, average: 5, clumsy: 2 },
    dangerFit: { ok: 10, moderate: 5, no: -5 },
    salaryFit: { '200': 2, '300': 5, '400': 8, '500': 10 },
    workstyleFit: { 'hands-on': 10, service: 0, creative: 3, technical: 7 },
    goalFit: { stable: 5, money: 10, startup: 4, skill: 8 },
    statusFit: { student: 7, jobseeker: 9, 'career-change': 8, 'on-leave': 8, employed: 4 },
  },
  {
    categoryId: 'plumbing',
    name: '배관기능사',
    baseScore: 50,
    salaryRange: '300~600만원',
    description: '건설·플랜트 필수 기술. 경력 쌓으면 일당 26만원 이상',
    keywords: ['건설', '플랜트', '안정적', '기술직'],
    genderFit: { male: 10, female: 3 },
    ageFit: { teen: 5, '20s': 9, '30s': 9, '40plus': 5 },
    physicalFit: { strong: 9, average: 5, weak: 1 },
    dexterityFit: { skilled: 7, average: 5, clumsy: 3 },
    dangerFit: { ok: 8, moderate: 5, no: -2 },
    salaryFit: { '200': 3, '300': 6, '400': 8, '500': 9 },
    workstyleFit: { 'hands-on': 10, service: 0, creative: 2, technical: 7 },
    goalFit: { stable: 7, money: 8, startup: 5, skill: 7 },
    statusFit: { student: 6, jobseeker: 8, 'career-change': 9, 'on-leave': 9, employed: 5 },
  },
  {
    categoryId: 'electrician',
    name: '전기기능사',
    baseScore: 50,
    salaryRange: '280~500만원',
    description: '전기 분야 기초 자격증. 수요 연평균 6.5% 성장하는 유망 직종',
    keywords: ['유망직종', '성장산업', '기술전문', '안정적'],
    genderFit: { male: 9, female: 4 },
    ageFit: { teen: 7, '20s': 10, '30s': 8, '40plus': 5 },
    physicalFit: { strong: 7, average: 7, weak: 3 },
    dexterityFit: { skilled: 9, average: 6, clumsy: 2 },
    dangerFit: { ok: 8, moderate: 6, no: 0 },
    salaryFit: { '200': 4, '300': 7, '400': 8, '500': 6 },
    workstyleFit: { 'hands-on': 7, service: 1, creative: 3, technical: 10 },
    goalFit: { stable: 9, money: 6, startup: 4, skill: 9 },
    statusFit: { student: 8, jobseeker: 9, 'career-change': 7, 'on-leave': 7, employed: 6 },
  },
  {
    categoryId: 'tiling',
    name: '타일기능사',
    baseScore: 50,
    salaryRange: '300~550만원',
    description: '인테리어 수요 폭증. 일당 19~25만원의 안정적 기술직',
    keywords: ['인테리어', '1인창업', '손재주', '안정적'],
    genderFit: { male: 9, female: 3 },
    ageFit: { teen: 5, '20s': 8, '30s': 10, '40plus': 6 },
    physicalFit: { strong: 8, average: 5, weak: 1 },
    dexterityFit: { skilled: 10, average: 5, clumsy: 1 },
    dangerFit: { ok: 7, moderate: 6, no: 0 },
    salaryFit: { '200': 3, '300': 6, '400': 8, '500': 7 },
    workstyleFit: { 'hands-on': 8, service: 1, creative: 8, technical: 5 },
    goalFit: { stable: 5, money: 7, startup: 9, skill: 8 },
    statusFit: { student: 5, jobseeker: 8, 'career-change': 10, 'on-leave': 10, employed: 4 },
  },
  {
    categoryId: 'wallpaper',
    name: '도배기능사',
    baseScore: 50,
    salaryRange: '280~500만원',
    description: '1인 창업 가능. 인테리어 핵심 기술로 꾸준한 수요',
    keywords: ['1인창업', '인테리어', '프리랜서', '꾸준한수요'],
    genderFit: { male: 8, female: 4 },
    ageFit: { teen: 4, '20s': 7, '30s': 10, '40plus': 7 },
    physicalFit: { strong: 7, average: 6, weak: 2 },
    dexterityFit: { skilled: 9, average: 5, clumsy: 2 },
    dangerFit: { ok: 6, moderate: 7, no: 3 },
    salaryFit: { '200': 4, '300': 7, '400': 8, '500': 5 },
    workstyleFit: { 'hands-on': 7, service: 2, creative: 8, technical: 4 },
    goalFit: { stable: 4, money: 6, startup: 10, skill: 7 },
    statusFit: { student: 4, jobseeker: 7, 'career-change': 10, 'on-leave': 10, employed: 4 },
  },
  {
    categoryId: 'hvac',
    name: '에어컨/냉동기계',
    baseScore: 50,
    salaryRange: '300~550만원',
    description: '냉동기계기능사. 여름 성수기 수입 폭발, 계절 프리미엄',
    keywords: ['성수기고수익', '기술전문', '계절프리미엄', '실내작업'],
    genderFit: { male: 9, female: 3 },
    ageFit: { teen: 5, '20s': 9, '30s': 9, '40plus': 5 },
    physicalFit: { strong: 8, average: 5, weak: 2 },
    dexterityFit: { skilled: 8, average: 5, clumsy: 2 },
    dangerFit: { ok: 7, moderate: 6, no: 1 },
    salaryFit: { '200': 3, '300': 6, '400': 8, '500': 7 },
    workstyleFit: { 'hands-on': 8, service: 3, creative: 2, technical: 9 },
    goalFit: { stable: 6, money: 8, startup: 6, skill: 8 },
    statusFit: { student: 6, jobseeker: 8, 'career-change': 8, 'on-leave': 8, employed: 5 },
  },
  {
    categoryId: 'forklift',
    name: '지게차운전',
    baseScore: 50,
    salaryRange: '250~400만원',
    description: '물류·제조업 필수. 단기간 취득 가능, 취업률 높음',
    keywords: ['단기취득', '높은취업률', '물류', '제조업'],
    genderFit: { male: 9, female: 3 },
    ageFit: { teen: 4, '20s': 8, '30s': 8, '40plus': 8 },
    physicalFit: { strong: 7, average: 7, weak: 4 },
    dexterityFit: { skilled: 5, average: 7, clumsy: 5 },
    dangerFit: { ok: 7, moderate: 6, no: 2 },
    salaryFit: { '200': 7, '300': 8, '400': 5, '500': 2 },
    workstyleFit: { 'hands-on': 9, service: 1, creative: 0, technical: 5 },
    goalFit: { stable: 10, money: 4, startup: 2, skill: 5 },
    statusFit: { student: 5, jobseeker: 10, 'career-change': 8, 'on-leave': 8, employed: 4 },
  },
  {
    categoryId: 'waterproof',
    name: '방수기능사',
    baseScore: 50,
    salaryRange: '280~500만원',
    description: '노후건물 증가로 수요 급증. 경쟁 적고 안정적인 기술직',
    keywords: ['수요급증', '낮은경쟁', '건설', '안정적'],
    genderFit: { male: 9, female: 2 },
    ageFit: { teen: 4, '20s': 8, '30s': 9, '40plus': 6 },
    physicalFit: { strong: 9, average: 4, weak: 0 },
    dexterityFit: { skilled: 6, average: 6, clumsy: 4 },
    dangerFit: { ok: 9, moderate: 4, no: -3 },
    salaryFit: { '200': 4, '300': 7, '400': 7, '500': 5 },
    workstyleFit: { 'hands-on': 10, service: 0, creative: 2, technical: 5 },
    goalFit: { stable: 6, money: 7, startup: 5, skill: 7 },
    statusFit: { student: 4, jobseeker: 8, 'career-change': 9, 'on-leave': 9, employed: 4 },
  },
  {
    categoryId: 'painting',
    name: '도장기능사',
    baseScore: 50,
    salaryRange: '260~450만원',
    description: '건설·자동차 도장. 꼼꼼한 성격에 맞는 기술직',
    keywords: ['건설', '자동차', '꼼꼼함', '기술직'],
    genderFit: { male: 8, female: 4 },
    ageFit: { teen: 5, '20s': 8, '30s': 8, '40plus': 6 },
    physicalFit: { strong: 7, average: 6, weak: 2 },
    dexterityFit: { skilled: 8, average: 5, clumsy: 2 },
    dangerFit: { ok: 7, moderate: 5, no: 0 },
    salaryFit: { '200': 5, '300': 7, '400': 6, '500': 4 },
    workstyleFit: { 'hands-on': 7, service: 1, creative: 7, technical: 5 },
    goalFit: { stable: 6, money: 5, startup: 6, skill: 7 },
    statusFit: { student: 5, jobseeker: 8, 'career-change': 8, 'on-leave': 8, employed: 4 },
  },
  {
    categoryId: 'care-worker',
    name: '요양보호사',
    baseScore: 50,
    salaryRange: '200~300만원',
    description: '고령화 시대 필수. 320시간 교육 후 취득, 안정적 일자리',
    keywords: ['고령화시대', '안정적', '돌봄', '사회공헌'],
    genderFit: { male: 4, female: 10 },
    ageFit: { teen: 2, '20s': 5, '30s': 8, '40plus': 10 },
    physicalFit: { strong: 6, average: 8, weak: 5 },
    dexterityFit: { skilled: 5, average: 7, clumsy: 6 },
    dangerFit: { ok: 5, moderate: 7, no: 10 },
    salaryFit: { '200': 10, '300': 6, '400': 2, '500': 0 },
    workstyleFit: { 'hands-on': 3, service: 10, creative: 0, technical: 2 },
    goalFit: { stable: 10, money: 1, startup: 2, skill: 5 },
    statusFit: { student: 3, jobseeker: 7, 'career-change': 9, 'on-leave': 9, employed: 5 },
  },
  {
    categoryId: 'beauty-nail',
    name: '미용사/네일아트',
    baseScore: 50,
    salaryRange: '200~400만원',
    description: '뷰티 업계 국가자격증. 1인 창업이 가능한 매력적 직종',
    keywords: ['뷰티', '1인창업', '트렌디', '창의적'],
    genderFit: { male: 3, female: 10 },
    ageFit: { teen: 7, '20s': 10, '30s': 7, '40plus': 4 },
    physicalFit: { strong: 3, average: 7, weak: 8 },
    dexterityFit: { skilled: 10, average: 5, clumsy: 1 },
    dangerFit: { ok: 5, moderate: 7, no: 10 },
    salaryFit: { '200': 6, '300': 8, '400': 6, '500': 3 },
    workstyleFit: { 'hands-on': 2, service: 7, creative: 10, technical: 3 },
    goalFit: { stable: 4, money: 5, startup: 10, skill: 7 },
    statusFit: { student: 8, jobseeker: 8, 'career-change': 7, 'on-leave': 7, employed: 4 },
  },
];

// ─── 콤보 보너스 ───
interface ComboRule {
  conditions: Record<string, string | string[]>;
  bonus: Record<string, number>;
  reason?: string;
}

const comboRules: ComboRule[] = [
  // 남성 + 체력 강함 + 위험 OK → 용접/배관/방수 보너스
  {
    conditions: { gender: 'male', physical: 'strong', danger: 'ok' },
    bonus: { welding: 15, plumbing: 12, waterproof: 12 },
    reason: '체력과 담력을 겸비한 당신에게 딱!',
  },
  // 여성 + 손재주 좋음 + 안전 선호 → 미용 보너스
  {
    conditions: { gender: 'female', dexterity: 'skilled', danger: 'no' },
    bonus: { 'beauty-nail': 15 },
  },
  // 여성 + 서비스 스타일 + 40대 이상 → 요양보호사 보너스
  {
    conditions: { gender: 'female', workstyle: 'service', age: '40plus' },
    bonus: { 'care-worker': 15 },
  },
  // 고수익 목표 + 체력 강함 → 용접/배관 보너스
  {
    conditions: { salary: ['400', '500'], physical: 'strong' },
    bonus: { welding: 12, plumbing: 10, hvac: 8 },
  },
  // 1인 창업 목표 + 손재주 → 타일/도배/미용 보너스
  {
    conditions: { goal: 'startup', dexterity: 'skilled' },
    bonus: { tiling: 12, wallpaper: 12, 'beauty-nail': 10 },
  },
  // 안정적 취업 + 취준생 → 지게차/전기/요양 보너스
  {
    conditions: { goal: 'stable', status: 'jobseeker' },
    bonus: { forklift: 12, electrician: 10, 'care-worker': 8 },
  },
  // 기술 전문 스타일 + 기술 하나 제대로 → 전기/용접/냉동 보너스
  {
    conditions: { workstyle: 'technical', goal: 'skill' },
    bonus: { electrician: 12, welding: 10, hvac: 10 },
  },
  // 꾸미는 일 + 창업 → 타일/도배/미용/도장 보너스
  {
    conditions: { workstyle: 'creative', goal: 'startup' },
    bonus: { tiling: 10, wallpaper: 10, 'beauty-nail': 8, painting: 8 },
  },
  // 20대 + 학생 + 남성 → 용접/전기 (취업 잘됨)
  {
    conditions: { age: '20s', status: 'student', gender: 'male' },
    bonus: { welding: 8, electrician: 8, forklift: 6 },
  },
  // 30대 + 이직 → 타일/도배/냉동 (빠른 수익)
  {
    conditions: { age: '30s', status: 'career-change' },
    bonus: { tiling: 10, wallpaper: 10, hvac: 8 },
  },
  // 체력 약함 + 안전 선호 → 요양/미용 보너스, 기피직 페널티
  {
    conditions: { physical: 'weak', danger: 'no' },
    bonus: {
      'care-worker': 10, 'beauty-nail': 10,
      welding: -10, plumbing: -8, waterproof: -10,
    },
  },
  // 500만원+ 목표 + 위험 OK → 용접 최고보너스
  {
    conditions: { salary: '500', danger: 'ok' },
    bonus: { welding: 15, plumbing: 10 },
  },
];

// ─── 하드 필터 (disqualification) ───
interface HardFilter {
  conditions: Record<string, string | string[]>;
  penalize: Record<string, number>;
}

const hardFilters: HardFilter[] = [
  // 체력 약함 → 용접/배관/방수 대폭 감점
  {
    conditions: { physical: 'weak' },
    penalize: { welding: -20, plumbing: -15, waterproof: -20 },
  },
  // 위험환경 절대 NO → 용접/방수 대폭 감점
  {
    conditions: { danger: 'no' },
    penalize: { welding: -15, waterproof: -15, plumbing: -10 },
  },
  // 손재주 없음 → 타일/미용 감점
  {
    conditions: { dexterity: 'clumsy' },
    penalize: { tiling: -12, 'beauty-nail': -15 },
  },
];

// ─── 결과 카피 ───
export const resultCopy: Record<string, { catchphrase: string; detailPoints: string[] }> = {
  welding: {
    catchphrase: '불꽃 튀는 당신의 미래, 용접으로 시작!',
    detailPoints: [
      '조선·제조업 인력난으로 초봉부터 높음',
      '경력 5년차 연봉 5,500만~1억',
      '해외취업(호주·캐나다) 가능',
      '국비지원으로 무료 교육 가능',
    ],
  },
  plumbing: {
    catchphrase: '보이지 않는 곳에서 세상을 연결하는 기술',
    detailPoints: [
      '건설·플랜트 현장 필수 인력',
      '경력자 일당 18~26만원',
      '기사 승급 시 관리자 가능',
      '인력 부족으로 취업 수월',
    ],
  },
  electrician: {
    catchphrase: '미래 산업의 기반, 전기 기술자!',
    detailPoints: [
      '전기차·신재생에너지로 수요 폭발',
      '연평균 6.5% 성장하는 유망 분야',
      '기사→기술사 성장 루트 명확',
      '공기업·대기업 취업 가능',
    ],
  },
  tiling: {
    catchphrase: '한 장 한 장, 공간을 완성하는 장인',
    detailPoints: [
      '인테리어 수요 폭증으로 일감 풍부',
      '일당 19~25만원, 프리랜서 가능',
      '손재주를 살린 1인 창업 적합',
      '주거·상업 공간 모두 수요 있음',
    ],
  },
  wallpaper: {
    catchphrase: '벽 하나로 공간의 분위기를 바꾸는 기술',
    detailPoints: [
      '인테리어 핵심 기술, 꾸준한 수요',
      '1인 창업 진입장벽 낮음',
      '도배+타일 콤보로 수입 극대화',
      '국비지원 교육과정 다수',
    ],
  },
  hvac: {
    catchphrase: '여름이 기다려지는 직업, 냉동공조!',
    detailPoints: [
      '여름 성수기 수입 폭발',
      '냉동기계기능사 → 기사 성장 가능',
      '건물 유지보수 안정적 수요',
      '기술직 중 실내 작업 비율 높음',
    ],
  },
  forklift: {
    catchphrase: '가장 빠르게 취업하는 확실한 자격증',
    detailPoints: [
      '단기간(1~2주) 취득 가능',
      '물류·제조·건설 모든 분야 수요',
      '취업률 매우 높음',
      '40대 이상도 취업 용이',
    ],
  },
  waterproof: {
    catchphrase: '노후건물 시대, 수요가 폭발하는 블루오션',
    detailPoints: [
      '노후건물 증가로 수요 급증',
      '경쟁자 적은 블루오션 분야',
      '일당 17~23만원',
      '건설 경기에 덜 민감',
    ],
  },
  painting: {
    catchphrase: '색으로 마무리하는 꼼꼼한 기술자',
    detailPoints: [
      '건설·자동차 도장 분야',
      '꼼꼼한 성격에 적합',
      '일당 16~22만원',
      '인테리어 시공과 병행 가능',
    ],
  },
  'care-worker': {
    catchphrase: '따뜻한 손길이 필요한 시대, 요양보호사',
    detailPoints: [
      '고령화 시대 가장 안정적인 직업',
      '320시간 교육 후 자격 취득',
      '전국 어디서나 일자리 있음',
      '경력 무관, 40대 이상 환영',
    ],
  },
  'beauty-nail': {
    catchphrase: '아름다움을 만드는 당신만의 커리어',
    detailPoints: [
      '뷰티 업계 국가자격증',
      '1인 샵 창업 가능',
      '트렌드에 민감한 MZ세대 인기',
      '손재주를 살린 창의적 직업',
    ],
  },
};

// ─── 매칭 엔진 ───
export type Answers = Record<string, string>;

function matchesCondition(answers: Answers, conditions: Record<string, string | string[]>): boolean {
  return Object.entries(conditions).every(([key, value]) => {
    if (Array.isArray(value)) {
      return value.includes(answers[key]);
    }
    return answers[key] === value;
  });
}

export function calculateResults(answers: Answers): TestResult[] {
  const scores: Record<string, number> = {};

  // 1. 기본 프로필 매칭 점수
  for (const cert of certProfiles) {
    let score = cert.baseScore;

    // 각 질문별 적합도 점수
    const gender = answers.gender as keyof CertProfile['genderFit'];
    const age = answers.age as keyof CertProfile['ageFit'];
    const physical = answers.physical as keyof CertProfile['physicalFit'];
    const dexterity = answers.dexterity as keyof CertProfile['dexterityFit'];
    const danger = answers.danger as keyof CertProfile['dangerFit'];
    const salary = answers.salary as keyof CertProfile['salaryFit'];
    const workstyle = answers.workstyle as keyof CertProfile['workstyleFit'];
    const goal = answers.goal as keyof CertProfile['goalFit'];
    const status = answers.status as keyof CertProfile['statusFit'];

    if (gender) score += cert.genderFit[gender] ?? 0;
    if (age) score += cert.ageFit[age] ?? 0;
    if (physical) score += cert.physicalFit[physical] ?? 0;
    if (dexterity) score += cert.dexterityFit[dexterity] ?? 0;
    if (danger) score += cert.dangerFit[danger] ?? 0;
    if (salary) score += cert.salaryFit[salary] ?? 0;
    if (workstyle) score += cert.workstyleFit[workstyle] ?? 0;
    if (goal) score += cert.goalFit[goal] ?? 0;
    if (status) score += cert.statusFit[status] ?? 0;

    scores[cert.categoryId] = score;
  }

  // 2. 하드 필터 적용
  for (const filter of hardFilters) {
    if (matchesCondition(answers, filter.conditions)) {
      for (const [catId, penalty] of Object.entries(filter.penalize)) {
        scores[catId] = (scores[catId] ?? 0) + penalty;
      }
    }
  }

  // 3. 콤보 보너스 적용
  for (const rule of comboRules) {
    if (matchesCondition(answers, rule.conditions)) {
      for (const [catId, bonus] of Object.entries(rule.bonus)) {
        scores[catId] = (scores[catId] ?? 0) + bonus;
      }
    }
  }

  // 4. 점수 정규화 & 결과 생성
  const maxScore = Math.max(...Object.values(scores));
  const minScore = Math.min(...Object.values(scores));
  const range = maxScore - minScore || 1;

  const results: TestResult[] = certProfiles.map((cert) => {
    const rawScore = scores[cert.categoryId];
    const normalizedPercent = Math.round(((rawScore - minScore) / range) * 40 + 60); // 60~100%
    return {
      categoryId: cert.categoryId,
      name: cert.name,
      score: rawScore,
      matchPercent: Math.min(99, Math.max(55, normalizedPercent)),
      description: cert.description,
      salaryRange: cert.salaryRange,
      keywords: cert.keywords,
    };
  });

  // 점수순 정렬
  results.sort((a, b) => b.score - a.score);

  return results;
}
