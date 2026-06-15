/**
 * @file DB 시드. 기존 src/data/seed.ts의 가상 데이터(artists/fandomTerms)를 그대로 SQLite에 적재.
 * seed.ts가 단일 진실 소스(single source of truth)이고, 이 스크립트는 그걸 DB로 복사할 뿐이다.
 */
import { PrismaClient } from '@prisma/client';
import { artists, fandomTerms } from '../src/data/seed';

const prisma = new PrismaClient();

async function main() {
  // 멱등성: 재실행해도 깨지지 않도록 비우고 다시 넣는다.
  await prisma.album.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.fandomTerm.deleteMany();

  for (const a of artists) {
    await prisma.artist.create({
      data: {
        id: a.id,
        name: a.name,
        debutYear: a.debutYear,
        agency: a.agency,
        bio: a.bio,
        albums: {
          create: a.albums.map((al) => ({
            id: al.id,
            title: al.title,
            releaseYear: al.releaseYear,
            trackCount: al.trackCount,
          })),
        },
      },
    });
  }

  for (const t of fandomTerms) {
    await prisma.fandomTerm.create({
      data: {
        id: t.id,
        term: t.term,
        romanized: t.romanized,
        category: t.category,
        meaning: t.meaning,
        example: t.example ?? null,
      },
    });
  }

  const [artistCount, albumCount, termCount] = await Promise.all([
    prisma.artist.count(),
    prisma.album.count(),
    prisma.fandomTerm.count(),
  ]);
  console.log(`Seeded: ${artistCount} artists, ${albumCount} albums, ${termCount} terms.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
