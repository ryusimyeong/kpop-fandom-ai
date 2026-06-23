'use client';
/**
 * @file Web Vitals 리포팅 클라이언트 컴포넌트.
 *
 * 설계 의도(why):
 * - 공고 필수 요건인 "성능 최적화 및 Lighthouse/Web Vitals"를 *실측 가능한 형태*로 증명하기 위해,
 *   Next.js 내장 훅 `useReportWebVitals`로 LCP/CLS/INP/FCP/TTFB 등 핵심 지표를 런타임에 수집한다.
 * - Lighthouse는 "랩 데이터(lab)"이고, 이 훅은 실제 사용자 환경에서 측정되는 "필드 데이터(field, RUM)"다.
 *   둘을 함께 다룰 줄 안다는 점을 보여주는 게 포인트.
 * - PoC라 콘솔 출력 + window 커스텀 이벤트 디스패치만 한다. 실무라면 이 onMetric 자리에서
 *   navigator.sendBeacon으로 분석 엔드포인트(GA4 / 자체 수집 서버 등)에 전송한다.
 *   (sendBeacon은 페이지 unload 중에도 유실 없이 전송되므로 RUM 수집의 표준)
 *
 * 렌더링 비용 주의(why):
 * - 이 컴포넌트는 DOM을 그리지 않는다(null 반환). 측정 부수효과만 담당하므로 LCP/CLS에 영향 0.
 * - layout.tsx에 두되 'use client' 경계를 이 컴포넌트로 한정해, 나머지 트리는 서버 컴포넌트로 유지한다.
 */
import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals 지표 타입. next/web-vitals가 넘겨주는 metric 객체의 사용 필드만 추린 최소 타입.
 * (라이브러리 타입을 그대로 쓰지 않고 좁혀서, 우리가 의존하는 필드를 명시적으로 문서화한다.)
 */
interface WebVitalMetric {
  /** 지표 이름. CLS | INP | LCP | FCP | TTFB | Next.js 커스텀(hydration 등) */
  name: string;
  /** 측정값. CLS는 unitless 누적값, 그 외는 ms 단위 */
  value: number;
  /** 'good' | 'needs-improvement' | 'poor' — 임계값 기준 평가 등급(있을 때만) */
  rating?: string;
  /** 같은 페이지 로드 내에서 지표를 식별하는 id */
  id: string;
}

export function WebVitals() {
  useReportWebVitals((metric: WebVitalMetric) => {
    // CLS는 소수점 누적값이라 그대로, 나머지는 ms 정수로 보기 좋게 가공.
    const display = metric.name === 'CLS' ? metric.value.toFixed(4) : `${Math.round(metric.value)}ms`;

    // 개발/데모용 콘솔 리포팅. 등급(rating)까지 찍어 "지표 → 평가"를 한눈에 본다.
    // (운영에서는 console 대신 sendBeacon 전송으로 대체)
    console.info(`[web-vitals] ${metric.name}=${display}${metric.rating ? ` (${metric.rating})` : ''}`);

    // 다른 코드(예: 테스트·디버그 오버레이)가 구독할 수 있도록 커스텀 이벤트도 디스패치.
    // SSR 안전을 위해 window 존재 가드.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('web-vital', { detail: metric }));
    }
  });

  // 측정 부수효과 전용 컴포넌트라 화면에는 아무것도 그리지 않는다(레이아웃 영향 0).
  return null;
}
