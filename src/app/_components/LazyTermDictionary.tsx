'use client';
/**
 * @file TermDictionary 코드 스플리팅 래퍼 — next/dynamic 시연.
 *
 * 왜 분리하나(why):
 * - TermDictionary는 Apollo useQuery + 검색/필터 상태를 가진 비교적 무거운 클라이언트 패널이다.
 *   이를 메인 번들에서 떼어내 별도 청크로 만들면 초기 JS 파싱/실행 비용이 줄어 TBT/INP에 유리하다.
 * - next/dynamic으로 컴포넌트 단위 코드 스플리팅을 적용한다.
 *
 * 보수적 선택(why ssr: true):
 * - `ssr: false`로 끄면 클라이언트에서만 그려져 초기 HTML이 비고, 기존 SSR/SSG 동작과
 *   첫 페인트 콘텐츠가 달라진다(동작 변경 위험). 그래서 ssr는 켜두고(기본값) 청크만 분리한다.
 * - loading 스켈레톤은 같은 크기 박스를 그려 청크 로드 동안에도 레이아웃 점프(CLS)가 없게 한다.
 *
 * next/dynamic은 클라이언트 경계에서만 ssr 옵션 제어가 자유로워 이 래퍼를 'use client'로 둔다.
 * (page.tsx는 서버 컴포넌트 유지)
 */
import dynamic from 'next/dynamic';

/**
 * 청크 로드 동안 보여줄 스켈레톤.
 * why: 실제 패널과 유사한 높이의 박스를 차지해 CLS를 0으로 유지(빈 공간 → 콘텐츠 점프 방지).
 */
function TermDictionarySkeleton() {
  return (
    <div
      className="h-64 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
      aria-hidden="true"
    />
  );
}

/**
 * 동적 import. 별도 JS 청크로 분리되며, 로드 전까지 스켈레톤을 노출한다.
 * named export(TermDictionary)를 default로 매핑해 전달한다.
 */
const TermDictionary = dynamic(
  () => import('@/components/TermDictionary').then((m) => ({ default: m.TermDictionary })),
  {
    loading: () => <TermDictionarySkeleton />,
    ssr: true, // 기존 SSR/SSG 첫 페인트 동작 보존(보수적)
  },
);

export function LazyTermDictionary() {
  return <TermDictionary />;
}
