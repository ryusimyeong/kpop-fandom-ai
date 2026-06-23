/**
 * @file 덕질 용어 상세 페이지 (SSG / 정적 생성).
 *
 * [왜 이렇게 했나]
 * - 아티스트 상세와 동일한 SSG 패턴을 용어 엔티티에도 적용해, 다른 엔티티에도 정적 생성을
 *   일관되게 쓸 수 있음을 증명한다.
 * - `generateStaticParams`로 모든 FandomTerm id를 빌드타임에 사전 렌더.
 * - `force-static` + `dynamicParams=false`로 완전 정적 화이트리스트.
 * - 데이터는 Prisma 직접 조회(서버 컴포넌트, 빌드타임 실행).
 *
 * [주의] Prisma의 category는 SQLite 호환을 위해 String으로 저장돼 있어,
 *   UI 배지 색 매핑 시 seed.ts의 union 타입으로 좁혀서 사용한다.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { FandomTerm } from '@/data/seed';

export const dynamic = 'force-static';
export const dynamicParams = false;

// 카테고리 배지 색(메인 TermCard와 동일 팔레트 유지 — 시각 일관성).
const CATEGORY_STYLE: Record<FandomTerm['category'], string> = {
  general: 'bg-gray-100 text-gray-700',
  event: 'bg-blue-100 text-blue-700',
  rank: 'bg-amber-100 text-amber-700',
  relationship: 'bg-pink-100 text-pink-700',
};

/** 빌드타임 정적 경로 목록: 모든 용어 id → `/term/t1` … */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const terms = await prisma.fandomTerm.findMany({ select: { id: true } });
  return terms.map((t) => ({ id: t.id }));
}

/** SEO 메타데이터(빌드타임). 용어명 + 영문 풀이를 title/description/OG로. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const term = await prisma.fandomTerm.findUnique({ where: { id } });

  if (!term) {
    return { title: 'Term not found · K-pop Fandom AI' };
  }

  const title = `${term.term} (${term.romanized}) · K-pop Fandom AI`;
  const description = term.meaning;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

/** 용어 상세 본문. 빌드타임 1회 실행 → 정적 HTML. */
export default async function TermDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const term = await prisma.fandomTerm.findUnique({ where: { id } });

  if (!term) notFound();

  // String → union 좁히기(저장 시 4종 중 하나만 들어가므로 안전).
  const category = term.category as FandomTerm['category'];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-pink-600 hover:underline">
          ← 홈으로
        </Link>
      </nav>

      <article className="rounded-xl border border-gray-200 p-6 shadow-sm">
        <header className="mb-4 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{term.term}</h1>
          <span className="text-base text-gray-500">/ {term.romanized}</span>
          <span
            className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLE[category]}`}
          >
            {category}
          </span>
        </header>

        {/* 영문 풀이 — 한국어 페이지지만 이 구간은 영어이므로 lang="en"으로 명시(스크린리더 발음 정확도). */}
        <p lang="en" className="text-base text-gray-700">
          {term.meaning}
        </p>

        {term.example && (
          <p lang="en" className="mt-3 border-l-2 border-pink-200 pl-3 text-sm italic text-gray-500">
            {term.example}
          </p>
        )}
      </article>
    </main>
  );
}
