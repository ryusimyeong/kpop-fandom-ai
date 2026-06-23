/**
 * @file 메인 페이지 핵심 사용자 시나리오 E2E.
 *
 * 검증 대상(공고 "품질관리" 증명):
 *  1) 메인 페이지가 로드되고 랜드마크/헤딩이 보인다.
 *  2) 챗봇에 질문을 입력하면 봇 답변이 화면에 나타난다(API 키 없이 규칙 기반 fallback이라 결정적).
 *  3) 용어 사전 검색/카테고리 필터가 결과를 좁힌다.
 *
 * 셀렉터 전략:
 *  - 가능한 한 role/accessible-name 기반(getByRole/getByLabel)으로 잡는다.
 *    이는 "접근성 트리"를 통해 요소를 찾는 것이라, 셀렉터가 곧 a11y 회귀 테스트 역할도 한다.
 *  - 텍스트/플레이스홀더는 실제 소스(page.tsx, ChatPanel.tsx, TermDictionary.tsx)와 1:1로 맞췄다.
 */
import { test, expect } from '@playwright/test';

test.describe('메인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지가 로드되고 제목/두 패널이 보인다', async ({ page }) => {
    // h1: "K-pop Fandom AI" — span으로 쪼개져 있어 부분 매칭.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Fandom AI');

    // 두 패널의 헤더가 보이는지(챗봇 / 용어사전).
    await expect(page.getByText('Fan Q&A Bot')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Fandom Term Dictionary/ })).toBeVisible();

    // main 랜드마크 존재(스크린리더 탐색 기준점).
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('챗봇에 질문하면 봇 답변이 나타난다', async ({ page }) => {
    const input = page.getByLabel('질문 입력');
    await expect(input).toBeVisible();

    // 보유 데이터(별빛소녀)에 매칭되는 질문 → fallback이 "Based on what I know:"로 시작하는 답을 준다.
    await input.fill('별빛소녀');
    await page.getByRole('button', { name: 'Send' }).click();

    // 입력은 전송 후 비워진다(ChatPanel: setInput('')).
    await expect(input).toHaveValue('');

    // 봇 답변 텍스트가 채팅 영역에 나타나는지 확인(규칙 기반 응답의 고정 문구).
    await expect(page.getByText(/Based on what I know:/)).toBeVisible({ timeout: 10_000 });

    // 사용자 발화도 그대로 남아 있어야 한다.
    await expect(page.getByText('별빛소녀', { exact: true })).toBeVisible();
  });

  test('Enter 키로도 질문을 전송할 수 있다', async ({ page }) => {
    const input = page.getByLabel('질문 입력');
    await input.fill('컴백');
    await input.press('Enter');

    await expect(input).toHaveValue('');
    await expect(page.getByText(/Based on what I know:/)).toBeVisible({ timeout: 10_000 });
  });

  test('데이터에 없는 질문은 "데이터 없음" 안내를 보여준다', async ({ page }) => {
    const input = page.getByLabel('질문 입력');
    // 어떤 토큰과도 겹치지 않는 무의미 질의 → retrieve 결과 0 → "I don't have data matching".
    await input.fill('zzzqqqxx9999');
    await input.press('Enter');

    await expect(page.getByText(/I don't have data matching/)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('용어 사전', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 첫 진입 시 GET_TERMS 로딩이 끝나 카드가 그려질 때까지 대기(시드 용어 t1~t4).
    await expect(page.getByText('최애')).toBeVisible({ timeout: 10_000 });
  });

  test('초기 상태에서 모든 용어가 보인다', async ({ page }) => {
    await expect(page.getByText('최애')).toBeVisible(); // relationship
    await expect(page.getByText('컴백')).toBeVisible(); // event
    await expect(page.getByText('올킬')).toBeVisible(); // rank
    await expect(page.getByText('직캠')).toBeVisible(); // general
  });

  test('검색어로 용어를 좁힐 수 있다', async ({ page }) => {
    const search = page.getByLabel('용어 검색');
    await search.fill('comeback'); // t2(컴백)의 romanized

    await expect(page.getByText('컴백')).toBeVisible();
    // 다른 용어는 사라져야 한다(검색이 실제로 필터링하는지).
    await expect(page.getByText('최애')).toHaveCount(0);
  });

  test('카테고리 필터 버튼으로 결과를 좁힐 수 있다', async ({ page }) => {
    // 'rank' 카테고리만 → 올킬(t3)만 남는다.
    await page.getByRole('button', { name: 'rank', exact: true }).click();

    await expect(page.getByText('올킬')).toBeVisible();
    await expect(page.getByText('최애')).toHaveCount(0);
    await expect(page.getByText('컴백')).toHaveCount(0);
  });

  test('매칭되는 용어가 없으면 안내 문구를 보여준다', async ({ page }) => {
    await page.getByLabel('용어 검색').fill('존재하지않는용어zzz');
    await expect(page.getByText('No matching terms.')).toBeVisible();
  });
});
