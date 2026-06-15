/**
 * @file Apollo Server를 Next.js App Router의 Route Handler로 노출.
 * GET/POST 모두 /api/graphql 단일 엔드포인트로 처리.
 *
 * Next.js 15의 Route Handler 타입 시그니처와 맞추기 위해 핸들러를 (req) => ... 형태로 래핑한다.
 */
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { createContext, type GraphQLContext } from '@/graphql/context';

const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

// context 콜백은 요청마다 호출된다 → 요청마다 새 DataLoader 세트를 만들어 요청을 격리한다.
const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async () => createContext(),
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
