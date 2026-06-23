/**
 * @file 루트 레이아웃. Apollo Provider로 전체 트리를 감싸고, 메타데이터/폰트/성능 측정을 설정한다.
 *
 * 담당 범위(why - 협업 충돌 방지):
 * - "메타데이터 / 폰트 / 성능(Web Vitals)"은 이 영역에서 담당.
 * - a11y(ARIA/시맨틱/lang/skip link 등)는 별도 담당이 처리하므로 해당 부분은 그대로 보존한다.
 */
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/lib/apollo-provider';
import { WebVitals } from './_components/WebVitals';

/**
 * 폰트 최적화(why):
 * - next/font/google은 빌드타임에 폰트를 self-host로 가져와 외부 요청(구글 폰트 CDN 왕복)을 제거한다.
 *   → 렌더 블로킹·DNS/TLS 왕복 감소로 LCP 개선.
 * - `display: 'swap'`: 폰트 로드 전 폴백 폰트로 즉시 텍스트를 그려 FOIT(보이지 않는 텍스트)를 막아 FCP 개선.
 * - next/font는 size-adjust 기반 폴백 메트릭을 자동 주입해 폰트 교체 시 레이아웃 점프(CLS)를 0에 수렴시킨다.
 * - CSS 변수(`--font-inter`)로 노출해 Tailwind 등에서 재사용 가능하게 한다.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * 메타데이터(why):
 * - metadataBase: openGraph/canonical의 상대경로를 절대 URL로 해석하는 기준. 미설정 시 OG 이미지 경로가 깨진다.
 * - openGraph/twitter: 소셜 공유 시 미리보기 카드 노출(SEO·공유 전환율). 글로벌 K-pop 팬 대상이라 공유가 핵심 유입.
 * - title.template: 하위 페이지(예: 아티스트 상세)에서 title만 지정하면 "%s · K-pop Fandom AI"로 자동 합성.
 */
export const metadata: Metadata = {
  metadataBase: new URL('https://kpop-fandom-ai.example.com'),
  title: {
    default: 'K-pop Fandom AI',
    template: '%s · K-pop Fandom AI',
  },
  description: 'AI assistant for global K-pop fans — Q&A bot + fandom term dictionary (PoC)',
  applicationName: 'K-pop Fandom AI',
  keywords: ['K-pop', 'fandom', 'AI', 'Q&A', 'dictionary', 'GraphQL'],
  openGraph: {
    type: 'website',
    title: 'K-pop Fandom AI',
    description: 'AI assistant for global K-pop fans — Q&A bot + fandom term dictionary (PoC)',
    siteName: 'K-pop Fandom AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K-pop Fandom AI',
    description: 'AI assistant for global K-pop fans — Q&A bot + fandom term dictionary (PoC)',
  },
  robots: { index: true, follow: true },
};

/**
 * Viewport(why):
 * - Next.js 15부터 viewport/themeColor는 metadata에서 분리된 별도 export로 다룬다(최신 규약 준수).
 * - themeColor: 모바일 브라우저 주소창 색을 브랜드(핑크)로 맞춰 일관된 인상.
 * - maximumScale을 의도적으로 제한하지 않아(접근성: 확대 허용) 사용자 줌을 막지 않는다.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ec4899', // tailwind pink-500 — 브랜드 컬러와 일치
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // why: 콘텐츠는 영어 UI에 한국어 용어/예문이 혼재하므로 문서 기본 언어는 'ko'로 둔다.
  //      (한국어가 본문 다수를 차지 → 스크린리더 기본 발음 규칙을 한국어로 잡고,
  //       영어 구간은 각 컴포넌트에서 필요 시 lang="en"으로 국소 지정. WCAG 3.1.1 충족)
  return (
    <html lang="ko">
      {/* 폰트 CSS 변수를 트리 전체에 적용(next/font 자동 self-host). a11y용 lang/skip link는 보존 */}
      <body className={inter.variable}>
        {/* 성능 지표(LCP/CLS/INP) 실측 리포팅 — DOM 미출력, 측정 부수효과 전용이라 레이아웃 영향 0 */}
        <WebVitals />
        {/*
         * Skip link(건너뛰기 링크): 키보드 사용자가 Tab 첫 입력으로 본문(main)에 바로 도달.
         * why: 반복 영역을 건너뛰는 WCAG 2.4.1(Bypass Blocks) 충족. 평소엔 sr-only로 숨겼다가
         *      포커스되면(focus:) 화면 좌상단에 노출된다.
         */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-pink-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
