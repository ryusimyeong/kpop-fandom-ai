/**
 * @file 아티스트 상세 페이지 (SSG / 정적 생성).
 *
 * [왜 이렇게 했나 — 공고 우대 "SSG" 실물 증명]
 * - Next.js 15 App Router의 정적 생성 규칙을 정확히 따른다:
 *   1) `generateStaticParams`로 빌드타임에 모든 Artist id를 미리 알려 → 각 id마다 HTML을 사전 렌더.
 *   2) `export const dynamic = 'force-static'`로 이 라우트가 100% 정적임을 명시(런타임 동적 렌더 금지).
 *   3) `export const dynamicParams = false`로 params 목록에 없는 id 접근 시 404(완전한 정적 화이트리스트).
 * - 데이터는 Apollo 클라이언트가 아니라 Prisma를 빌드타임에 직접 조회한다(서버 컴포넌트).
 *   서버 컴포넌트는 빌드 시 Node 환경에서 실행되므로 DB 접근이 가능하고, 클라이언트 번들에
 *   GraphQL 왕복/Apollo 의존이 섞이지 않아 정적 HTML이 그대로 떨어진다.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// 이 라우트는 완전 정적이다. (ISR이 필요하면 아래 force-static 대신
//   `export const revalidate = 3600;` 처럼 초 단위 재검증 주기를 주면 된다.
//   현 토이는 데이터가 빌드타임 고정이므로 force-static이 적절.)
export const dynamic = 'force-static';
// generateStaticParams가 만든 id 외에는 404 — 정적 화이트리스트를 분명히 한다.
export const dynamicParams = false;

/**
 * 빌드타임에 정적 생성할 경로(params) 목록.
 * Prisma로 전체 Artist id를 읽어 `/artist/a1`, `/artist/a2` … 를 사전 생성한다.
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const artists = await prisma.artist.findMany({ select: { id: true } });
  return artists.map((a) => ({ id: a.id }));
}

/**
 * SEO 메타데이터(빌드타임 생성). title/description + Open Graph.
 * Next 15에서 params는 Promise이므로 await로 푼다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const artist = await prisma.artist.findUnique({ where: { id } });

  if (!artist) {
    return { title: 'Artist not found · K-pop Fandom AI' };
  }

  const title = `${artist.name} · K-pop Fandom AI`;
  // bio를 그대로 description으로 재사용(가상 데이터이므로 그대로 노출 무방).
  const description = artist.bio;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
    },
  };
}

/**
 * 아티스트 상세 본문. 앨범까지 한 번에 가져온다(include).
 * 빌드타임에 1회 실행되어 정적 HTML로 굳는다.
 */
export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artist = await prisma.artist.findUnique({
    where: { id },
    // 앨범은 발매연도 오름차순으로 정렬해 보여준다.
    include: { albums: { orderBy: { releaseYear: 'asc' } } },
  });

  // dynamicParams=false라 정상 빌드에선 도달하지 않지만, 타입 좁히기 + 방어적 404.
  if (!artist) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-pink-600 hover:underline">
          ← 홈으로
        </Link>
      </nav>

      <article className="rounded-xl border border-gray-200 p-6 shadow-sm">
        <header className="mb-3 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{artist.name}</h1>
          <span className="text-sm text-gray-500">debut {artist.debutYear}</span>
        </header>
        <p className="mb-2 text-sm font-medium text-pink-600">{artist.agency}</p>
        <p className="mb-6 text-base text-gray-700">{artist.bio}</p>

        <section aria-labelledby="albums-heading">
          <h2 id="albums-heading" className="mb-2 text-lg font-bold text-gray-900">
            Discography
          </h2>
          <ul className="space-y-1">
            {artist.albums.map((album) => (
              <li
                key={album.id}
                className="flex justify-between border-b border-gray-100 py-1 text-sm text-gray-600"
              >
                <span>💿 {album.title}</span>
                <span>
                  {album.releaseYear} · {album.trackCount} tracks
                </span>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </main>
  );
}
