/**
 * @file Playwright E2E 설정.
 *
 * 설계 의도 (공고 필수 "접근성·품질관리" 증명용):
 * - 단위테스트(Vitest)는 GraphQL 리졸버/RAG 로직 같은 "레이어"를 검증한다.
 *   E2E는 그 위에서 "사용자가 실제로 보는 화면이 작동하는가 + 접근성 위반이 없는가"를 검증한다.
 *   두 레이어는 책임이 다르므로 별개로 둔다(Vitest 설정/테스트는 건드리지 않음).
 *
 * - webServer로 Next.js를 빌드·기동한다. 왜 dev가 아니라 build+start인가?
 *   1) 프로덕션 빌드의 실제 산출물(SSR/정적화 결과)을 검사해야 a11y/품질 신뢰도가 높다.
 *   2) dev 모드는 HMR 오버레이·개발 전용 경고 DOM이 끼어 axe 결과에 노이즈를 줄 수 있다.
 *   prisma db push/seed를 먼저 돌리는 이유: dev.db는 .gitignore 대상이라 CI/클린 체크아웃에는
 *   DB가 없다. GraphQL 쿼리(GET_TERMS 등)가 빈 DB로 실패하면 화면이 비어 시나리오가 깨지므로,
 *   서버 기동 전에 스키마 push + 시드를 보장한다.
 *
 * - ANTHROPIC_API_KEY를 일부러 주지 않는다 → src/lib/ai.ts가 규칙 기반 fallback으로 동작해
 *   네트워크/요금 없이 챗 응답이 결정적(deterministic)이 된다. CI에서 절대 깨지지 않게 하기 위함.
 */
import { defineConfig, devices } from '@playwright/test';

/** 로컬/CI 공통 베이스 URL. 환경변수로 덮어쓸 수 있게 해 포트 충돌 시 유연성 확보. */
const PORT = process.env.E2E_PORT ?? '3100';
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  /** E2E는 상태(DB) 공유 가능성이 있어 파일 간 병렬은 유지하되, 한 파일 내 순서 의존은 피하도록 작성. */
  fullyParallel: true,
  /** CI에서 실수로 남긴 test.only를 빌드 실패로 잡아 품질 게이트 역할. */
  forbidOnly: !!process.env.CI,
  /** 플래키 방어: CI에서만 1회 재시도(로컬은 재시도 0으로 빠른 피드백). */
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  /** 리포트: CI 친화적 list + 실패 분석용 HTML(자동 오픈 안 함). */
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL,
    /** 실패 시에만 트레이스/스크린샷 보존 — 디버깅 비용 최소화. */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /**
   * 서버 자동 기동.
   * - reuseExistingServer: 로컬에서 이미 띄워둔 서버가 있으면 재사용해 반복 실행을 빠르게.
   * - timeout 180s: prisma generate + next build가 콜드 빌드일 때 시간이 걸릴 수 있어 넉넉히.
   */
  webServer: {
    command: `pnpm prisma db push --skip-generate && pnpm prisma db seed && pnpm build && pnpm start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
