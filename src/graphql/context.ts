/**
 * @file GraphQL 요청 컨텍스트. 리졸버가 공유하는 prisma 클라이언트와 요청 범위 DataLoader를 담는다.
 */
import { prisma } from '@/lib/prisma';
import { createLoaders, type Loaders } from './loaders';

export interface GraphQLContext {
  prisma: typeof prisma;
  loaders: Loaders;
}

/** Apollo Server context 콜백에서 요청마다 호출 → 새 로더 세트로 요청을 격리. */
export function createContext(): GraphQLContext {
  return {
    prisma,
    loaders: createLoaders(prisma),
  };
}
