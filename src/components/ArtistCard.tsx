/**
 * @file 아티스트 카드. 이름·데뷔연도·소속·소개·앨범 목록을 보여주는 프레젠테이션 컴포넌트.
 */
import type { Artist } from '@/data/seed';

export interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 p-4 shadow-sm transition hover:shadow-md">
      <header className="mb-2 flex items-baseline justify-between">
        <h3 className="text-lg font-bold text-gray-900">{artist.name}</h3>
        {/* debut 연도: "debut"이 단독으로 무엇인지 모호 → sr-only로 "데뷔" 의미 보강. text-gray-500은 흰 배경 AA(4.5:1) 충족 */}
        <span className="text-xs text-gray-500">
          <span className="sr-only">데뷔 연도 </span>debut {artist.debutYear}
        </span>
      </header>
      <p className="mb-1 text-xs font-medium text-pink-600">{artist.agency}</p>
      <p className="mb-3 text-sm text-gray-700">{artist.bio}</p>
      {/* 앨범 목록에 그룹 라벨 부여(스크린리더에 "앨범 목록"임을 안내) */}
      <ul className="space-y-1" aria-label="앨범 목록">
        {artist.albums.map((album) => (
          <li key={album.id} className="flex justify-between text-xs text-gray-600">
            {/* 💿 이모지는 장식 → aria-hidden. 트랙 수 단위(·, tracks)는 그대로 두되 의미 전달은 충분 */}
            <span>
              <span aria-hidden="true">💿 </span>
              {album.title}
            </span>
            <span>
              {album.releaseYear} · {album.trackCount} tracks
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
