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
        {/* 용어 자체는 한국어 → lang="ko"로 발음 정확도 확보(문서 기본 lang은 ko지만 명시적 표기로 견고성↑) */}
        <h3 className="text-base font-bold text-gray-900" lang="ko">
          {term.term}
        </h3>
        {/* 로마자 표기: 영문 → lang="en". text-gray-400(대비 부족) → text-gray-600으로 상향(AA) */}
        <span className="text-sm text-gray-600" lang="en">
          {/* "/"는 장식적 구분 기호 → 스크린리더가 "슬래시"로 읽지 않게 hidden, 의미는 sr-only로 보강 */}
          <span aria-hidden="true">/ </span>
          <span className="sr-only">로마자 표기 </span>
          {term.romanized}
        </span>
        {/* 카테고리 배지: text-[10px](가독성 위험) → text-xs(12px)로 상향. 색에만 의존하지 않도록 sr-only 라벨 부여 */}
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[term.category]}`}
        >
          <span className="sr-only">카테고리: </span>
          {term.category}
        </span>
      </header>
      {/* 뜻 풀이는 영문 설명 → lang="en" */}
      <p className="text-sm text-gray-700" lang="en">
        {term.meaning}
      </p>
      {/* 예문: text-gray-500(작은 글씨라 대비 마진 부족) → text-gray-600으로 상향(AA) */}
      {term.example && (
        <p className="mt-2 text-xs italic text-gray-600">{term.example}</p>
      )}
    </article>
  );
}
