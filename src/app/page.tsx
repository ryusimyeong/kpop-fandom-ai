/**
 * @file 메인 페이지. 챗봇 + 용어 사전을 한 화면에 배치.
 */
import { ChatPanel } from '@/components/ChatPanel';
import { TermDictionary } from '@/components/TermDictionary';

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          <span className="text-pink-500">K-pop</span> Fandom AI
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          AI assistant for global fans · Q&amp;A bot + fandom term dictionary
        </p>
        <p className="mt-1 text-xs text-gray-400">
          PoC — Next.js · GraphQL (Apollo) · Storybook. All data is fictional.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <ChatPanel />
        <TermDictionary />
      </div>
    </main>
  );
}
