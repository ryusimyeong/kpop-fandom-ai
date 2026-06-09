'use client';
/**
 * @file App Router에서 Client Component 트리에 Apollo를 주입하는 Provider 래퍼.
 */
import { ApolloProvider } from '@apollo/client';
import { useMemo, type ReactNode } from 'react';
import { makeApolloClient } from './apollo-client';

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = useMemo(() => makeApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
