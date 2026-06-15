/**
 * @file GraphQL 리졸버. Query는 Prisma로 DB 조회, Artist.albums는 DataLoader로 배치 로딩(N+1 방지),
 * Mutation(ask)은 RAG 답변 생성.
 *
 * [학습 메모] 인메모리 .filter()를 Prisma 쿼리로 교체하면서 의식한 것:
 * - 조회 책임을 DB로 내리고(필터/정렬/페이징을 DB가 처리), 리졸버는 "어떻게 조립하느냐"에 집중.
 * - Artist.albums는 부모 Artist마다 호출되므로 N+1의 온상 → DataLoader로 같은 tick의 key를 모아 1쿼리로.
 */
import type { GraphQLContext } from './context';
import { decodeCursor, toConnection } from './pagination';
import { generateAnswer } from '@/lib/ai';

type TermCategory = 'general' | 'event' | 'rank' | 'relationship';

interface TermsArgs {
  category?: TermCategory;
  search?: string;
}

interface ArtistRow {
  id: string;
  name: string;
  debutYear: number;
  agency: string;
  bio: string;
}

export const resolvers = {
  Query: {
    artists: (_: unknown, { search }: { search?: string }, ctx: GraphQLContext) => {
      return ctx.prisma.artist.findMany({
        where: search ? { name: { contains: search } } : undefined,
        orderBy: { id: 'asc' },
      });
    },

    artistsConnection: async (
      _: unknown,
      { first = 10, after }: { first?: number; after?: string },
      ctx: GraphQLContext,
    ) => {
      // 방어적 상한: 한 번에 너무 많이 못 가져가게.
      const take = Math.min(Math.max(first ?? 10, 1), 100);

      // after cursor가 있으면 그 id 이후부터(=cursor 행은 건너뜀) 조회.
      // hasNextPage 판단을 위해 한 개 더(take + 1) 가져온다.
      const afterId = after ? decodeCursor(after) : null;

      const rows = await ctx.prisma.artist.findMany({
        take: take + 1,
        ...(afterId ? { cursor: { id: afterId }, skip: 1 } : {}),
        orderBy: { id: 'asc' },
      });

      return toConnection(rows, take);
    },

    artist: (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      return ctx.prisma.artist.findUnique({ where: { id } });
    },

    terms: (_: unknown, { category, search }: TermsArgs, ctx: GraphQLContext) => {
      return ctx.prisma.fandomTerm.findMany({
        where: {
          ...(category ? { category } : {}),
          ...(search
            ? {
                OR: [
                  { term: { contains: search } },
                  { romanized: { contains: search } },
                  { meaning: { contains: search } },
                ],
              }
            : {}),
        },
        orderBy: { id: 'asc' },
      });
    },
  },

  Artist: {
    // 부모 Artist의 albums를 DataLoader로 배치 로딩 → N+1 제거.
    albums: (parent: ArtistRow, _args: unknown, ctx: GraphQLContext) => {
      return ctx.loaders.albumsByArtistId.load(parent.id);
    },
  },

  Mutation: {
    ask: async (_: unknown, { question }: { question: string }, ctx: GraphQLContext) => {
      // RAG는 전체 KB가 필요하므로 DB에서 한 번 로드해 ai.ts에 그대로 전달(인터페이스 동일).
      const [artists, terms] = await Promise.all([
        ctx.prisma.artist.findMany({
          include: { albums: { orderBy: { releaseYear: 'asc' } } },
          orderBy: { id: 'asc' },
        }),
        ctx.prisma.fandomTerm.findMany({ orderBy: { id: 'asc' } }),
      ]);

      return generateAnswer(question, {
        artists,
        // ai.ts의 FandomTerm.category는 union, example은 optional(string|undefined) →
        // DB의 String/null을 ai.ts 인터페이스에 맞게 좁혀준다.
        terms: terms.map((t) => ({
          ...t,
          category: t.category as TermCategory,
          example: t.example ?? undefined,
        })),
      });
    },
  },
};
