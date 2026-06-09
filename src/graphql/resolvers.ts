/**
 * @file GraphQL 리졸버. Query는 샘플 데이터에서 조회, Mutation(ask)은 RAG 답변 생성.
 * AI 호출은 lib/ai.ts에 위임 — API 키가 없으면 규칙 기반 fallback으로 동작(데모 안정성).
 */
import { artists, fandomTerms, type FandomTerm } from '@/data/seed';
import { generateAnswer } from '@/lib/ai';

interface TermsArgs {
  category?: FandomTerm['category'];
  search?: string;
}

export const resolvers = {
  Query: {
    artists: (_: unknown, { search }: { search?: string }) => {
      if (!search) {
        return artists;
      }
      const q = search.toLowerCase();
      return artists.filter((a) => a.name.toLowerCase().includes(q));
    },
    artist: (_: unknown, { id }: { id: string }) => {
      return artists.find((a) => a.id === id) ?? null;
    },
    terms: (_: unknown, { category, search }: TermsArgs) => {
      let result = fandomTerms;
      if (category) {
        result = result.filter((t) => t.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (t) =>
            t.term.toLowerCase().includes(q) ||
            t.romanized.toLowerCase().includes(q) ||
            t.meaning.toLowerCase().includes(q),
        );
      }
      return result;
    },
  },
  Mutation: {
    ask: async (_: unknown, { question }: { question: string }) => {
      return generateAnswer(question, { artists, terms: fandomTerms });
    },
  },
};
