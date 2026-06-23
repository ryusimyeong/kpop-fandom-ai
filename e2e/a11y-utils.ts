/**
 * @file axe-core 접근성 검사 공통 헬퍼.
 *
 * 설계 의도:
 * - 여러 시나리오에서 동일한 "심각도 serious/critical 위반 0" 기준을 재사용하기 위해 분리.
 * - WCAG 2.1 A/AA 룰셋으로 태그를 한정한다(베스트프랙티스 룰은 노이즈가 많아 게이트에서 제외하되
 *   참고용으로 결과는 남긴다). 공고의 "접근성" 요건은 통상 WCAG AA 기준이므로 이에 맞춤.
 * - 위반 발견 시 어떤 룰/어떤 노드인지 메시지에 풀어서 던져, 실패 로그만 보고도 고칠 수 있게 한다.
 */
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** 품질 게이트로 막을 심각도. moderate/minor는 경고 수준이라 게이트에서는 제외. */
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

/**
 * 현재 페이지 상태를 axe로 스캔하고, serious/critical 위반이 하나라도 있으면 테스트를 실패시킨다.
 * @param page  Playwright page
 * @param label 실패 메시지에 표시할 시나리오 이름(예: "메인 페이지 초기 로드")
 */
export async function expectNoSeriousA11yViolations(page: Page, label: string): Promise<void> {
  const results = await new AxeBuilder({ page })
    // WCAG 2.0/2.1 A·AA만 게이트 대상으로. (운영 a11y 기준과 일치)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ''));

  if (blocking.length > 0) {
    // 사람이 읽기 쉬운 형태로 위반 룰·도움말·영향 노드를 직렬화해 한 번에 보여준다.
    const detail = blocking
      .map((v) => {
        const nodes = v.nodes.map((n) => `      - ${n.target.join(' ')}`).join('\n');
        return `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodes}`;
      })
      .join('\n\n');
    throw new Error(`a11y 위반(serious/critical) 발견 — ${label}\n${detail}`);
  }

  // 게이트는 통과했지만 위반이 0이어야 한다는 의도를 명시적으로 단언(회귀 방지).
  expect(blocking, `${label}: serious/critical a11y 위반 0`).toHaveLength(0);
}
