/**
 * @file 자동 접근성(a11y) 회귀 검사 E2E.
 *
 * 목표: 주요 화면 상태에서 axe-core 기준 serious/critical 위반 0을 유지(품질 게이트).
 * 정적 1회 스캔이 아니라 "상호작용 후 바뀐 DOM"도 검사하는 이유:
 *  - 챗 답변/근거칩, 필터 선택 상태(aria-pressed) 같은 동적 DOM에서 a11y 회귀가 자주 발생한다.
 *  - 조사에서 보강 포인트로 잡힌 aria-live/aria-pressed/색대비 등이 실제로 위반을 만들지
 *    이 테스트가 지속적으로 감시한다.
 *
 * 운영 노트(팀원 공유): 새 위반이 잡히면 (1) 컴포넌트에서 고치거나 (2) 정당한 예외면
 * a11y-utils의 룰셋/태그를 조정해 의도를 문서화한다. 무조건 disable 하지 말 것.
 */
import { test } from '@playwright/test';
import { expectNoSeriousA11yViolations } from './a11y-utils';

test.describe('접근성 자동 검사', () => {
  test('메인 페이지 초기 로드 — 위반 0', async ({ page }) => {
    await page.goto('/');
    // 용어 카드가 그려진 뒤(비동기 GraphQL 결과 포함 상태) 스캔.
    await page.getByText('최애').waitFor({ state: 'visible', timeout: 10_000 });
    await expectNoSeriousA11yViolations(page, '메인 페이지 초기 로드');
  });

  test('챗 답변 표시 상태 — 위반 0', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('질문 입력').fill('별빛소녀');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.getByText(/Based on what I know:/).waitFor({ state: 'visible', timeout: 10_000 });
    // 봇 말풍선 + 근거칩(sources)이 추가된 DOM 상태에서 a11y 검사.
    await expectNoSeriousA11yViolations(page, '챗 답변 표시 상태');
  });

  test('카테고리 필터 선택 상태 — 위반 0', async ({ page }) => {
    await page.goto('/');
    await page.getByText('최애').waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: 'rank', exact: true }).click();
    await page.getByText('올킬').waitFor({ state: 'visible' });
    // 선택된 필터(시각적 강조)만 있고 aria-pressed 등 상태 표시가 부족하면 여기서 드러난다.
    await expectNoSeriousA11yViolations(page, '카테고리 필터 선택 상태');
  });
});
