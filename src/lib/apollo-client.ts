'use client';
/**
 * @file 클라이언트 사이드 Apollo Client 인스턴스.
 * InMemoryCache로 쿼리 결과 정규화/캐싱 — 동일 쿼리 재요청을 방지한다.
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
