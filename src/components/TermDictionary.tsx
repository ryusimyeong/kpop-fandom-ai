'use client';
/**
 * @file 덕질 용어 사전 패널. GET_TERMS 쿼리로 용어를 조회하고 카테고리 필터/검색 제공.
 */
import { useState } from 'react';
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

  return (
    <section className="rounded-xl border border-gray-200 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">📖 Fandom Term Dictionary</h2>
      </header>

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-pink-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          aria-label="용어 검색"
        />
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs ${
                category === c ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-500">Failed to load terms.</p>}
      {data?.terms?.length === 0 && <p className="text-sm text-gray-400">No matching terms.</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {data?.terms?.map((t: FandomTerm) => (
          <TermCard key={t.id} term={t} />
        ))}
      </div>
    </section>
  );
}
