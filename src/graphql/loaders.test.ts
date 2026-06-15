import { describe, it, expect, vi } from 'vitest';
import type { PrismaClient, Album } from '@prisma/client';
import { createLoaders, batchAlbumsByArtistId } from './loaders';

// 테스트용 가짜 album 데이터(DB 불필요).
const ALBUMS: Album[] = [
  { id: 'al1', title: 'First Light', releaseYear: 2021, trackCount: 5, artistId: 'a1' },
  { id: 'al2', title: 'Constellation', releaseYear: 2023, trackCount: 9, artistId: 'a1' },
  { id: 'al3', title: 'Midnight Drive', releaseYear: 2020, trackCount: 7, artistId: 'a2' },
];

/** prisma.album.findMany만 흉내 내는 최소 mock. in 필터를 직접 적용한다. */
function makeFakePrisma() {
  const findMany = vi.fn(async ({ where }: { where: { artistId: { in: string[] } } }) => {
    const ids = where.artistId.in;
    return ALBUMS.filter((a) => ids.includes(a.artistId));
  });
  const prisma = { album: { findMany } } as unknown as PrismaClient;
  return { prisma, findMany };
}

describe('batchAlbumsByArtistId (배치 함수 계약)', () => {
  it('입력 key 순서대로 그룹핑된 albums를 돌려준다(매칭 없으면 빈 배열)', async () => {
    const { prisma } = makeFakePrisma();
    const result = await batchAlbumsByArtistId(prisma, ['a2', 'a1', 'a999']);

    expect(result).toHaveLength(3);
    expect(result[0].map((a) => a.id)).toEqual(['al3']); // a2
    expect(result[1].map((a) => a.id)).toEqual(['al1', 'al2']); // a1
    expect(result[2]).toEqual([]); // a999 매칭 없음
  });
});

describe('createLoaders DataLoader 배치 동작 (N+1 방지)', () => {
  it('같은 tick에 여러 key를 load하면 findMany는 단 1번만 호출된다', async () => {
    const { prisma, findMany } = makeFakePrisma();
    const loaders = createLoaders(prisma);

    // Artist 2개의 albums를 동시에 요청(= 같은 tick).
    const [a1Albums, a2Albums] = await Promise.all([
      loaders.albumsByArtistId.load('a1'),
      loaders.albumsByArtistId.load('a2'),
    ]);

    // 핵심: N+1이라면 2번 불렸겠지만, 배치되어 1번만 호출된다.
    expect(findMany).toHaveBeenCalledTimes(1);
    // 한 번의 쿼리에 두 key가 모두 모여 들어갔는지 확인.
    expect(findMany.mock.calls[0][0].where.artistId.in.sort()).toEqual(['a1', 'a2']);

    expect(a1Albums.map((a) => a.id)).toEqual(['al1', 'al2']);
    expect(a2Albums.map((a) => a.id)).toEqual(['al3']);
  });

  it('같은 key를 두 번 load하면 캐시되어 추가 쿼리가 없다', async () => {
    const { prisma, findMany } = makeFakePrisma();
    const loaders = createLoaders(prisma);

    await loaders.albumsByArtistId.load('a1');
    await loaders.albumsByArtistId.load('a1');

    expect(findMany).toHaveBeenCalledTimes(1);
  });
});
