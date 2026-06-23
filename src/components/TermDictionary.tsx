'use client';
/**
 * @file 덕질 용어 사전 패널. GET_TERMS 쿼리로 용어를 조회하고 카테고리 필터/검색 제공.
 */
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_TERMS } from '@/graphql/operations';
import { TermCard } from './TermCard';
import type { FandomTerm } from '@/data/seed';

const CATEGORIES: Array<FandomTerm['category'] | 'all'> = ['all', 'general', 'event', 'rank', 'relationship'];

export function TermDictionary() {
  const [category, setCategory] = useState<FandomTerm['category'] | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data, loading, error } = useQuery(GET_TERMS, {
    variables: {
      category: category === 'all' ? undefined : category,
      search: search || undefined,
    },
  });

  // why: section을 제목과 aria-labelledby로 연결해 landmark에 이름 부여.
  return (
    <section className="rounded-xl border border-gray-200 p-4" aria-labelledby="term-dict-heading">
      <header className="mb-3 flex items-center justify-between">
        <h2 id="term-dict-heading" className="text-sm font-bold text-gray-900">
          {/* 이모지는 장식 → aria-hidden으로 스크린리더가 읽지 않게 함 */}
          <span aria-hidden="true">📖 </span>Fandom Term Dictionary
        </h2>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        {/* sr-only <label>로 입력창 라벨 연결(견고성) + aria-label 병행 */}
        <label htmlFor="term-search-input" className="sr-only">
          용어 검색
        </label>
        <input
          id="term-search-input"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-pink-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          aria-label="용어 검색"
        />
        {/*
         * 카테고리 필터: 토글 버튼 그룹.
         * role="group" + aria-label로 "무엇을 거르는 버튼 묶음"인지 안내.
         * 각 버튼 aria-pressed: 선택 상태를 색(시각)뿐 아니라 보조기술에도 전달
         *   (WCAG 1.4.1 색에만 의존 금지, 4.1.2 Name/Role/Value).
         */}
        <div className="flex flex-wrap gap-1" role="group" aria-label="카테고리 필터">
          {CATEGORIES.map((c) => {
            const selected = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={selected}
                // 비선택 상태 text-gray-600 → text-gray-700로 대비 보강(작은 글씨 AA 안전 마진)
                className={`rounded-full px-3 py-1 text-xs ${
                  selected ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/*
       * 상태 메시지(로딩/빈 결과)를 라이브 영역으로 묶는다.
       * role="status"(=aria-live polite): 검색/필터로 결과가 바뀌면 스크린리더가 상태를 안내(WCAG 4.1.3).
       * 색 대비: text-gray-400 → text-gray-600(흰 배경 AA 충족).
       */}
      <div role="status" aria-live="polite">
        {loading && <p className="text-sm text-gray-600">Loading…</p>}
        {data?.terms?.length === 0 && !loading && (
          <p className="text-sm text-gray-600">No matching terms.</p>
        )}
      </div>
      {/* 에러는 즉시 알림 → role="alert"(assertive). text-red-500 → text-red-600(대비 보강) */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          Failed to load terms.
        </p>
      )}

      {/* 용어 카드 그리드: 의미상 목록 → ul/li로 마크업(스크린리더에 "n개 항목" 안내).
          TermCard는 순수 프레젠테이션으로 유지하고, 네비게이션은 Link 래핑으로 추가한다.
          (SSG로 사전 생성된 /term/[id] 상세 페이지로 이동) */}
      <ul className="grid list-none gap-3 sm:grid-cols-2">
        {data?.terms?.map((t: FandomTerm) => (
          <li key={t.id}>
            <Link
              href={`/term/${t.id}`}
              // 링크 접근명: 카드 텍스트만으로는 "어디로 가는지" 모호 → 명시적 aria-label
              aria-label={`${t.term} 용어 자세히 보기`}
              className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            >
              <TermCard term={t} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
