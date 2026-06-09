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
        <span className="text-xs text-gray-500">debut {artist.debutYear}</span>
      </header>
      <p className="mb-1 text-xs font-medium text-pink-600">{artist.agency}</p>
      <p className="mb-3 text-sm text-gray-700">{artist.bio}</p>
      <ul className="space-y-1">
        {artist.albums.map((album) => (
          <li key={album.id} className="flex justify-between text-xs text-gray-600">
            <span>💿 {album.title}</span>
            <span>
              {album.releaseYear} · {album.trackCount} tracks
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
