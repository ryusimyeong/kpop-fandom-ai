/**
 * @file 요청 범위(per-request) DataLoader 모음 + 배치 함수.
 *
 * [학습 메모] 왜 DataLoader인가 — N+1 문제 해결
 * - `artists` 쿼리로 Artist N개를 가져온 뒤 각 Artist의 `albums`를 resolve하면,
 *   순진하게 짜면 Artist마다 album 쿼리가 1번씩 나가 총 1 + N번 쿼리가 발생한다(N+1).
 * - DataLoader는 같은 이벤트 루프 tick 안에서 들어온 key(artistId)들을 모아두었다가,
 *   배치 함수를 "단 한 번" 호출한다 → albums를 `WHERE artistId IN (...)` 한 방으로 가져와 1+1번으로 줄인다.
 * - 배치 함수는 받은 key 순서와 "정확히 같은 순서/길이"의 결과 배열을 돌려줘야 한다(DataLoader 계약).
 * - 캐싱이 요청 간에 새지 않도록 로더는 요청마다 새로 만든다(아래 createLoaders).
 */
import DataLoader from 'dataloader';
import type { PrismaClient, Album } from '@prisma/client';

/**
 * artistId 배열을 받아 각 artistId의 albums 배열을 같은 순서로 돌려주는 배치 함수.
 * 단 한 번의 findMany로 모든 album을 가져온 뒤, 메모리에서 artistId별로 그룹핑한다.
 */
export async function batchAlbumsByArtistId(
  prisma: PrismaClient,
  artistIds: readonly string[],
): Promise<Album[][]> {
  const albums = await prisma.album.findMany({
    where: { artistId: { in: [...artistIds] } },
    orderBy: { releaseYear: 'asc' },
  });

  const byArtist = new Map<string, Album[]>();
  for (const album of albums) {
    const list = byArtist.get(album.artistId);
    if (list) list.push(album);
    else byArtist.set(album.artistId, [album]);
  }

  // DataLoader 계약: 입력 key 순서대로, 매칭 없으면 빈 배열.
  return artistIds.map((id) => byArtist.get(id) ?? []);
}

export interface Loaders {
  albumsByArtistId: DataLoader<string, Album[]>;
}

/** 요청마다 새 로더 세트를 생성(요청 격리: 캐시가 다른 요청으로 새지 않게). */
export function createLoaders(prisma: PrismaClient): Loaders {
  return {
    albumsByArtistId: new DataLoader<string, Album[]>((ids) =>
      batchAlbumsByArtistId(prisma, ids),
    ),
  };
}
