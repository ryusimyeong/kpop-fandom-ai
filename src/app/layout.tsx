/**
 * @file 루트 레이아웃. Apollo Provider로 전체 트리를 감싼다.
 */
import type { Metadata } from 'next';
import './globals.css';
import { ApolloWrapper } from '@/lib/apollo-provider';

export const metadata: Metadata = {
  title: 'K-pop Fandom AI',
  description: 'AI assistant for global K-pop fans — Q&A bot + fandom term dictionary (PoC)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
