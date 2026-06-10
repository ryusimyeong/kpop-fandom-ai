'use client';
/**
 * @file 클라이언트 사이드 Apollo Client 인스턴스.
 *
 * [학습 메모] InMemoryCache는 응답을 `__typename:id` 단위로 정규화해 저장한다.
 * 그래서 같은 엔티티를 가리키는 서로 다른 쿼리가 캐시를 공유하고, 동일 쿼리 재요청이 자동으로 생략된다.
 * 실무(말랑톡)에서 TanStack Query로 서버 상태 캐싱을 다뤄봤는데, Apollo의 정규화 캐시는
 * "엔티티 단위"라는 점이 키 단위 캐시와 어떻게 다른지 직접 비교하며 익혔다.
 */
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

function resolveUri(): string {
  // 브라우저에서는 상대경로, SSR/스토리북 등에서는 절대경로가 필요할 수 있어 분기.
  if (typeof window !== 'undefined') {
    return '/api/graphql';
  }
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  return `${base}/api/graphql`;
}

export function makeApolloClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: resolveUri() }),
    cache: new InMemoryCache(),
  });
}
