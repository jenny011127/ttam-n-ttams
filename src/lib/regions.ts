/**
 * 땀앤땀스 지역 데이터 (하이브리드)
 * - 서울/경기: 시·구 단위 세분화
 * - 인천/부산·경남·울산/대전·충청/그 외: 광역 단위
 */

export interface Region {
  id: string;
  label: string;
  keywords: string[]; // academy.addressShort 매칭용
}

export interface RegionGroup {
  id: string;
  label: string;
  emoji: string;
  expandable: boolean; // true면 시/구 세분화, false면 광역만
  /** "전체" 선택 시 사용할 키워드 */
  allKeywords: string[];
  districts: Region[];
}

export const ALL_REGION: Region = {
  id: 'all',
  label: '전국 전체',
  keywords: [],
};

export const REGION_GROUPS: RegionGroup[] = [
  {
    id: 'seoul',
    label: '서울',
    emoji: '🏙',
    expandable: true,
    allKeywords: ['서울'],
    districts: [
      { id: 'seoul-gangnam', label: '강남구', keywords: ['강남'] },
      { id: 'seoul-gangdong', label: '강동구', keywords: ['강동'] },
      { id: 'seoul-gangbuk', label: '강북구', keywords: ['강북'] },
      { id: 'seoul-gangseo', label: '강서구', keywords: ['강서'] },
      { id: 'seoul-gwanak', label: '관악구', keywords: ['관악'] },
      { id: 'seoul-gwangjin', label: '광진구', keywords: ['광진'] },
      { id: 'seoul-guro', label: '구로구', keywords: ['구로'] },
      { id: 'seoul-geumcheon', label: '금천구', keywords: ['금천'] },
      { id: 'seoul-nowon', label: '노원구', keywords: ['노원'] },
      { id: 'seoul-dobong', label: '도봉구', keywords: ['도봉'] },
      { id: 'seoul-dongdaemun', label: '동대문구', keywords: ['동대문'] },
      { id: 'seoul-dongjak', label: '동작구', keywords: ['동작'] },
      { id: 'seoul-mapo', label: '마포구', keywords: ['마포'] },
      { id: 'seoul-seodaemun', label: '서대문구', keywords: ['서대문'] },
      { id: 'seoul-seocho', label: '서초구', keywords: ['서초'] },
      { id: 'seoul-seongdong', label: '성동구', keywords: ['성동'] },
      { id: 'seoul-seongbuk', label: '성북구', keywords: ['성북'] },
      { id: 'seoul-songpa', label: '송파구', keywords: ['송파'] },
      { id: 'seoul-yangcheon', label: '양천구', keywords: ['양천'] },
      { id: 'seoul-yeongdeungpo', label: '영등포구', keywords: ['영등포'] },
      { id: 'seoul-yongsan', label: '용산구', keywords: ['용산'] },
      { id: 'seoul-eunpyeong', label: '은평구', keywords: ['은평'] },
      { id: 'seoul-jongno', label: '종로구', keywords: ['종로'] },
      { id: 'seoul-jung', label: '중구', keywords: ['중구'] },
      { id: 'seoul-jungnang', label: '중랑구', keywords: ['중랑'] },
    ],
  },
  {
    id: 'gyeonggi',
    label: '경기',
    emoji: '🌆',
    expandable: true,
    allKeywords: ['경기'],
    districts: [
      { id: 'gg-suwon', label: '수원시', keywords: ['수원'] },
      { id: 'gg-seongnam', label: '성남시', keywords: ['성남'] },
      { id: 'gg-yongin', label: '용인시', keywords: ['용인'] },
      { id: 'gg-bucheon', label: '부천시', keywords: ['부천'] },
      { id: 'gg-hwaseong', label: '화성시', keywords: ['화성'] },
      { id: 'gg-ansan', label: '안산시', keywords: ['안산'] },
      { id: 'gg-anyang', label: '안양시', keywords: ['안양'] },
      { id: 'gg-pyeongtaek', label: '평택시', keywords: ['평택'] },
      { id: 'gg-uijeongbu', label: '의정부시', keywords: ['의정부'] },
      { id: 'gg-siheung', label: '시흥시', keywords: ['시흥'] },
      { id: 'gg-paju', label: '파주시', keywords: ['파주'] },
      { id: 'gg-gimpo', label: '김포시', keywords: ['김포'] },
      { id: 'gg-gwangmyeong', label: '광명시', keywords: ['광명'] },
      { id: 'gg-goyang', label: '고양시', keywords: ['고양'] },
      { id: 'gg-gunpo', label: '군포시', keywords: ['군포'] },
      { id: 'gg-osan', label: '오산시', keywords: ['오산'] },
      { id: 'gg-icheon', label: '이천시', keywords: ['이천'] },
      { id: 'gg-yangju', label: '양주시', keywords: ['양주'] },
      { id: 'gg-namyangju', label: '남양주시', keywords: ['남양주'] },
      { id: 'gg-gwangju', label: '광주시', keywords: ['광주'] },
      { id: 'gg-hanam', label: '하남시', keywords: ['하남'] },
      { id: 'gg-guri', label: '구리시', keywords: ['구리'] },
      { id: 'gg-pocheon', label: '포천시', keywords: ['포천'] },
      { id: 'gg-yeoju', label: '여주시', keywords: ['여주'] },
      { id: 'gg-anseong', label: '안성시', keywords: ['안성'] },
    ],
  },
  {
    id: 'incheon',
    label: '인천',
    emoji: '🌊',
    expandable: false,
    allKeywords: ['인천'],
    districts: [],
  },
  {
    id: 'busan',
    label: '부산·경남·울산',
    emoji: '🌅',
    expandable: false,
    allKeywords: ['부산', '경남', '울산', '창원', '김해'],
    districts: [],
  },
  {
    id: 'daejeon',
    label: '대전·충청',
    emoji: '🗺',
    expandable: false,
    allKeywords: ['대전', '충청', '세종', '천안', '청주'],
    districts: [],
  },
  {
    id: 'other',
    label: '그 외 지역',
    emoji: '🏞',
    expandable: false,
    allKeywords: ['강원', '전라', '제주', '대구', '광주', '경북', '전주', '포항', '춘천'],
    districts: [],
  },
];

/**
 * 선택된 지역 ID로 학원 매칭용 keywords 배열 반환
 */
export function getKeywordsForRegionId(regionId: string): string[] {
  if (regionId === 'all') return [];

  // 광역 전체 선택 (ex: seoul-all, gyeonggi-all)
  if (regionId.endsWith('-all')) {
    const groupId = regionId.replace('-all', '');
    const group = REGION_GROUPS.find(g => g.id === groupId);
    return group ? group.allKeywords : [];
  }

  // 일반 광역 선택 (ex: incheon, busan)
  const group = REGION_GROUPS.find(g => g.id === regionId);
  if (group) return group.allKeywords;

  // 시/구 선택
  for (const g of REGION_GROUPS) {
    const d = g.districts.find(x => x.id === regionId);
    if (d) return d.keywords;
  }

  return [];
}

/**
 * 지역 ID로 label 반환
 */
export function getLabelForRegionId(regionId: string): string {
  if (regionId === 'all') return '전국';
  if (regionId.endsWith('-all')) {
    const groupId = regionId.replace('-all', '');
    const group = REGION_GROUPS.find(g => g.id === groupId);
    return group ? `${group.label} 전체` : '전국';
  }
  const group = REGION_GROUPS.find(g => g.id === regionId);
  if (group) return group.label;
  for (const g of REGION_GROUPS) {
    const d = g.districts.find(x => x.id === regionId);
    if (d) return `${g.label} ${d.label}`;
  }
  return '전국';
}

/**
 * 랜딩 결과 게이트의 광역 지역 → 시/구 기본값
 */
export function mapLandingRegionToId(landingRegion: string | null): string {
  if (!landingRegion) return 'all';
  switch (landingRegion) {
    case 'seoul': return 'seoul-all';
    case 'gyeonggi': return 'gyeonggi-all';
    case 'busan': return 'busan';
    case 'other': return 'other';
    default: return 'all';
  }
}
