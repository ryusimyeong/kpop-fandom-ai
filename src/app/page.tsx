/**
 * @file 메인 페이지. 챗봇 + 용어 사전을 한 화면에 배치.
 */
import { ChatPanel } from '@/components/ChatPanel';
// 성능: TermDictionary는 next/dynamic으로 코드 스플리팅한 래퍼를 사용(초기 번들 경량화).
// SSR은 유지되므로 SSG/첫 페인트 동작은 그대로다.
import { LazyTermDictionary } from './_components/LazyTermDictionary';

export default function Home() {
  // why: main에 id를 부여해 layout의 skip link 타깃으로 사용. 영어 카피 구간은 lang="en"으로
  //      국소 지정해 문서 기본 lang="ko"와 구분(스크린리더 발음 정확도, WCAG 3.1.2 Language of Parts).
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          <span className="text-pink-500">K-pop</span> Fandom AI
        </h1>
        {/* text-gray-500 유지: 흰 배경 대비 약 4.6:1로 WCAG AA(4.5:1) 충족 */}
        <p className="mt-1 text-sm text-gray-500" lang="en">
          AI assistant for global fans · Q&amp;A bot + fandom term dictionary
        </p>
        {/* text-gray-400(대비 약 3:1)은 본문에 부적합 → text-gray-600으로 상향(약 7:1, AA 충족) */}
        <p className="mt-1 text-xs text-gray-600" lang="en">
          PoC — Next.js · GraphQL (Apollo) · Storybook. All data is fictional.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <ChatPanel />
        <LazyTermDictionary />
      </div>
    </main>
  );
}
