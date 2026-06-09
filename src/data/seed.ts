/**
 * @file 샘플 데이터 — 실제 JYP 아티스트가 아닌 가상 데이터.
 * 이 프로젝트는 아키텍처 PoC이며, 저작권 이슈를 피하기 위해 모든 데이터는 허구입니다.
 */

export interface Album {
  id: string;
  title: string;
  releaseYear: number;
  trackCount: number;
}

export interface Artist {
  id: string;
  name: string;
  debutYear: number;
  agency: string;
  /** 글로벌 팬에게 소개할 한 줄 설명 (RAG 답변의 근거로 사용) */
  bio: string;
  albums: Album[];
}

/** 덕질 용어 사전 항목 */
export interface FandomTerm {
  id: string;
  /** 한국어/원어 표기 */
  term: string;
  /** 로마자/영문 표기 */
  romanized: string;
  category: 'general' | 'event' | 'rank' | 'relationship';
  /** 글로벌 팬을 위한 영문 풀이 */
  meaning: string;
  example?: string;
}

export const artists: Artist[] = [
  {
    id: 'a1',
    name: '별빛소녀 (Starlit)',
    debutYear: 2021,
    agency: 'Nova Entertainment',
    bio: '5인조 걸그룹. 신스팝 기반의 청량한 사운드와 강렬한 퍼포먼스가 강점. 글로벌 팬덤 "Starseed"를 보유.',
    albums: [
      { id: 'al1', title: 'First Light', releaseYear: 2021, trackCount: 5 },
      { id: 'al2', title: 'Constellation', releaseYear: 2023, trackCount: 9 },
    ],
  },
  {
    id: 'a2',
    name: '도시소년 (CityBoys)',
    debutYear: 2019,
    agency: 'Nova Entertainment',
    bio: '4인조 보이그룹. R&B와 힙합을 오가는 음악색. 자작곡 비중이 높은 싱어송라이터 그룹으로 평가받음.',
    albums: [
      { id: 'al3', title: 'Midnight Drive', releaseYear: 2020, trackCount: 7 },
      { id: 'al4', title: 'Neon', releaseYear: 2022, trackCount: 11 },
    ],
  },
];

export const fandomTerms: FandomTerm[] = [
  {
    id: 't1',
    term: '최애',
    romanized: 'choe-ae',
    category: 'relationship',
    meaning: 'Your absolute favorite member or artist — the one you bias above all others.',
    example: '"내 최애는 별빛소녀의 리더야." = "My ultimate bias is the leader of Starlit."',
  },
  {
    id: 't2',
    term: '컴백',
    romanized: 'comeback',
    category: 'event',
    meaning: 'A new release/promotion cycle by an artist (single, EP, or album), not literally returning from a break.',
    example: 'A group having their 3rd "comeback" means their 3rd release era.',
  },
  {
    id: 't3',
    term: '올킬',
    romanized: 'all-kill',
    category: 'rank',
    meaning: 'When a song tops every major real-time and daily chart simultaneously.',
    example: '"Certified all-kill" = topped all charts at once.',
  },
  {
    id: 't4',
    term: '직캠',
    romanized: 'fancam',
    category: 'general',
    meaning: 'A fan-filmed video focusing on a single member during a performance.',
  },
];
