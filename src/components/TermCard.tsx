/**
 * @file 덕질 용어 카드. 용어/로마자/카테고리/영문 풀이/예문을 보여주는 프레젠테이션 컴포넌트.
 */
import type { FandomTerm } from '@/data/seed';

export interface TermCardProps {
  term: FandomTerm;
}

const CATEGORY_STYLE: Record<FandomTerm['category'], string> = {
  general: 'bg-gray-100 text-gray-700',
  event: 'bg-blue-100 text-blue-700',
  rank: 'bg-amber-100 text-amber-700',
  relationship: 'bg-pink-100 text-pink-700',
};

export function TermCard({ term }: TermCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 p-4">
      <header className="mb-2 flex items-center gap-2">
        <h3 className="text-base font-bold text-gray-900">{term.term}</h3>
        <span className="text-sm text-gray-400">/ {term.romanized}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_STYLE[term.category]}`}>
          {term.category}
        </span>
      </header>
      <p className="text-sm text-gray-700">{term.meaning}</p>
      {term.example && <p className="mt-2 text-xs italic text-gray-500">{term.example}</p>}
    </article>
  );
}
