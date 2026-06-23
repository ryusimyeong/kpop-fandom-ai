# K-pop Fandom AI

> 글로벌 K-pop 팬을 위한 AI 어시스턴트 — **팬 Q&A 봇** + **덕질 용어 사전**.
> **GraphQL·Storybook·접근성·SSG·성능 측정을 직접 익히기 위해 만든 학습용 토이 프로젝트**입니다.
> Next.js(App Router) · GraphQL(Apollo + Prisma + DataLoader) · Storybook · Playwright/axe로 구성한 아키텍처 PoC.

> **현대 프론트엔드의 품질 축을 한 프로젝트에서 실증**하는 것을 목표로 했습니다 — 타입 안정성(TS strict), 데이터 레이어(GraphQL/N+1/cursor), **접근성(ARIA·axe 자동검사)**, **성능(Web Vitals·next/font·코드스플리팅)**, **정적 생성(SSG)**, 컴포넌트 문서화(Storybook), E2E(Playwright). *lint·단위테스트(13)·build·storybook 빌드 모두 통과.*

---

## 왜 만들었나

저는 실무에서 React/Next.js·Vue, 성능/빌드 최적화, 실시간 AI 대화(WebSocket·Web Audio)를 다뤄왔지만,
**GraphQL과 Storybook은 프로덕션에서 직접 써본 적이 없었습니다.** 이 둘을 "읽어서 아는" 수준이 아니라
"만들어서 아는" 수준으로 끌어올리려고, 제가 관심 있는 **엔터테인먼트/팬덤 도메인 + AI**라는 주제로
작은 PoC를 만들었습니다.

세 가지를 한 프로젝트에서 자연스럽게 엮는 것을 목표로 했습니다.

- **GraphQL** — 데이터(아티스트·앨범·용어) 조회를 GraphQL 스키마/쿼리로
- **AI(RAG)** — 그 데이터를 근거로 LLM이 답하는 챗봇
- **Storybook** — 화면을 구성하는 컴포넌트를 상태별로 문서화

> ⚠️ 모든 아티스트/데이터는 **허구**입니다(저작권 회피). 이 프로젝트의 핵심은 데이터가 아니라 **구조와 학습**입니다.

---

## 무엇을 만들었나

### 1. Fan Q&A Bot (RAG)
사용자의 질문을 받아 → 보유 데이터에서 관련 항목을 **검색(retrieve)** → 그것을 컨텍스트로 **주입(augment)** →
LLM이 **답변 생성(generate)**. 답변에는 근거가 된 데이터 id(`sources`)가 함께 따라와 추적할 수 있습니다.
`ANTHROPIC_API_KEY`가 없으면 **규칙 기반 fallback**으로 동작해 데모/CI가 깨지지 않습니다.

### 2. Fandom Term Dictionary
"최애", "컴백", "올킬" 같은 덕질 용어를 글로벌 팬이 이해하도록 **영문 풀이**와 함께 제공.
GraphQL 쿼리로 **카테고리 필터·검색**을 처리합니다.

---

## 기술 스택

| 영역 | 사용 | 메모 |
|---|---|---|
| Framework | Next.js 15 (App Router), React 18, TypeScript | Route Handler로 GraphQL 엔드포인트 노출 |
| GraphQL (서버) | Apollo Server + `@as-integrations/next` | 스키마(SDL)·리졸버·Query/Mutation 직접 작성 |
| GraphQL (클라이언트) | Apollo Client + InMemoryCache | 쿼리/뮤테이션, 변수·필터, 정규화 캐시 |
| DB / ORM | Prisma + SQLite | 리졸버가 인메모리 배열이 아닌 실제 DB 조회 |
| N+1 방지 | DataLoader (요청 범위) | `Artist.albums`를 key 모아 1쿼리로 배치 로딩 |
| 페이지네이션 | cursor 기반 (Relay 스타일) | `artistsConnection(first, after)` + opaque cursor |
| AI | Anthropic Claude (RAG) | 키 없으면 규칙 기반 fallback |
| 컴포넌트 문서화 | Storybook 8 (Vite) + addon-a11y | 상태별 스토리(loading/empty/error/variant) + 스토리별 a11y 패널 |
| 접근성 (a11y) | 시맨틱·ARIA·키보드 + `@axe-core/playwright` | landmark·`aria-live`·focus-visible, axe로 serious/critical 위반 0 자동검사 |
| 성능 / Web Vitals | `next/font`·`next/image`·`next/dynamic`·`useReportWebVitals` | CLS 방지(폰트 swap·이미지 치수 예약), 코드스플리팅, LCP/CLS/INP 리포팅 |
| 정적 생성 (SSG) | `generateStaticParams` + `force-static` | `/artist/[id]`·`/term/[id]`를 빌드타임 정적 HTML로 사전 렌더(+ `generateMetadata` SEO) |
| E2E | Playwright | 메인 로드·챗·검색 시나리오 + axe a11y 게이트 |
| Styling | Tailwind CSS | |

---

## 이 프로젝트로 배운 것 (학습 기록)

> 실무에서 안 써본 GraphQL/Storybook을 직접 부딪히며 정리한 내용. 면접에서 "써봤다"고 말할 수 있는 근거.

**GraphQL**
- **스키마 우선 설계**: 타입(`Artist`, `FandomTerm`, `AskAnswer`)을 먼저 정의하고 Query/Mutation을 노출.
  쿼리는 조회, 뮤테이션(`ask`)은 부수효과(AI 생성)라는 역할 구분을 직접 적용해봤다.
- **over-fetching 통제**: 클라이언트가 필요한 필드만 선택한다는 점이 REST와의 핵심 차이라고 이해.
  실무에서 REST + 스토어로 중복 호출을 줄였던 문제의식이 GraphQL에선 언어 차원에서 해결된다는 걸 체감.
- **변수·필터**: `$search`, `$category`로 같은 쿼리를 파라미터화해 재사용.
- **정규화 캐시**: Apollo InMemoryCache가 엔티티(`__typename:id`) 단위로 캐싱한다는 점을, 실무에서 쓴
  TanStack Query의 키 단위 캐시와 비교하며 익혔다.

**RAG / AI**
- "모델이 아는 것"이 아니라 "내가 준 컨텍스트"로만 답하게 만드는 것이 RAG의 핵심.
  system 프롬프트로 컨텍스트 외 답변을 막고, `sources`로 근거를 추적해 환각을 억제하도록 설계.
- 실무(말랑톡)의 실시간 AI 대화 경험을, 엔터 도메인 + GraphQL 데이터 소스로 옮겨보며 적용.

**Storybook**
- 컴포넌트를 앱 실행 없이 **상태별로** 띄워 확인. loading/empty/error처럼 재현이 번거로운 상태를
  스토리로 고정하면 QA·회귀 확인이 쉬워진다는 걸 직접 경험.
- 실무에서 공통 컴포넌트는 만들어봤지만 Storybook 문서화는 안 해봤던 갭을 메우려는 의도.
- (트러블슈팅) `@storybook/nextjs`(webpack5) + Next 15 조합에서 빌드 충돌이 나서, 컴포넌트가 순수 React임을
  활용해 `@storybook/react-vite`로 교체해 해결. 빌더 차이를 이해하는 계기가 됐다.

**접근성 (a11y)** — *실무에서 성능은 47→98로 정량 관리했지만 a11y는 약했던 갭을 메우려는 의도*
- 시맨틱 마크업(`main`/`section`/heading 위계)·landmark에 `aria-labelledby`로 이름 부여, 채팅 결과는
  `role="log"` + `aria-live="polite"` + `aria-busy`로 동적 갱신을 스크린리더에 전달, 장식 이모지는 `aria-hidden`.
- 키보드: `focus-visible` 스타일, Enter 전송, Tab 순서. 입력창 `label`/`aria-label`.
- **axe-core를 Playwright E2E에 붙여 위반을 "측정"으로 관리** — serious/critical 0을 품질 게이트로.
  성능을 점수로 관리하듯 a11y도 점수로 관리하는 습관을 토이에서 들였다.

**성능 / Web Vitals** — *실무 성능 최적화(페이로드 84%↓)를 토이 규모에서 패턴으로 재현*
- `next/font`로 폰트를 자가호스팅·`display: swap` → 폰트 FOIT/레이아웃 시프트(CLS) 방지.
- `next/image`로 치수 예약(CLS 방지)·lazy/`priority` 구분, `next/dynamic`으로 무거운 패널 코드스플리팅.
- `useReportWebVitals`로 LCP/CLS/INP를 수집하는 훅 시연 — "측정 가능한 성능"을 코드로.

**SSG (정적 사이트 생성)** — *공고 우대. SSR은 실무(블립마켓 SEO 60→98)에서 했고, SSG는 토이로 직접*
- `/artist/[id]`·`/term/[id]`를 `generateStaticParams`로 빌드타임에 모든 id를 사전 렌더(정적 HTML).
- `export const dynamic = 'force-static'` + `dynamicParams = false`로 **완전한 정적 화이트리스트**(목록 밖 id는 404).
- 데이터는 Apollo가 아닌 **Prisma를 빌드타임에 직접 조회**(서버 컴포넌트) → 클라 번들에 GraphQL 왕복이 안 섞이고
  순수 정적 HTML이 떨어진다. `generateMetadata`로 페이지별 SEO(openGraph) 부여.
- 빌드 로그에서 `● (SSG) /artist/a1, /artist/a2 …`로 정적 생성을 눈으로 확인.

---

## GraphQL 구조

- **Schema** (`src/graphql/schema.ts`): `Artist`·`Album`·`FandomTerm`·`AskAnswer`·`ArtistConnection`/`ArtistEdge`/`PageInfo` + `Query { artists, artistsConnection, artist, terms }` + `Mutation { ask }`
- **Resolvers** (`src/graphql/resolvers.ts`): Query는 Prisma DB 조회(검색/필터/페이징), `Artist.albums`는 DataLoader 배치, `ask`는 RAG 답변 생성
- **DB** (`prisma/schema.prisma`, `src/lib/prisma.ts`): SQLite + Prisma. `prisma/seed.ts`가 `src/data/seed.ts`의 가상 데이터를 DB에 적재. PrismaClient는 싱글턴으로 dev HMR 커넥션 누수 방지
- **DataLoader** (`src/graphql/loaders.ts`): `Artist.albums`를 요청 범위 로더로 배치 → `WHERE artistId IN (...)` 한 방으로 N+1 제거. 컨텍스트(`src/graphql/context.ts`)에서 요청마다 새 로더 생성(요청 격리)
- **Cursor 페이지네이션** (`src/graphql/pagination.ts`): `artistsConnection(first, after)` — `edges{ node, cursor }` + `pageInfo{ hasNextPage, endCursor }`. cursor는 id 기반 base64 opaque. `first+1` 조회로 `hasNextPage` 판단
- **Operations** (`src/graphql/operations.ts`): 클라이언트 쿼리/뮤테이션 문서(변수·필드 선택)
- **Endpoint**: `POST /api/graphql` (Apollo Sandbox로 탐색 가능)

### N+1 / 페이지네이션을 직접 확인하기

```graphql
# cursor 페이지네이션: first개씩 + 다음 페이지는 endCursor를 after로
{ artistsConnection(first: 1) {
    edges { cursor node { id name albums { title } } }
    pageInfo { hasNextPage endCursor }
} }
```
여러 Artist를 조회해도 `albums`는 DataLoader가 모아 **단 한 번의 album 쿼리**로 가져온다(N+1 제거).

## Storybook으로 문서화한 컴포넌트

- `ChatBubble` — user / bot / loading / 근거칩 / 긴 텍스트(overflow) / 다국어
- `ArtistCard` — 걸그룹 / 보이그룹 / 앨범 없음 / 긴 이름·소개
- `TermCard` — 카테고리별 배지 색상 / 예문 유무 / 긴 풀이
- `ChatPanel` · `TermDictionary` — MockedProvider로 GraphQL 응답을 모킹한 상호작용 스토리(default/loading/error/empty)
- 각 스토리는 `addon-a11y` 패널로 위반을 즉석 확인 가능

## 접근성 · E2E 확인하기

```bash
pnpm test            # Vitest 단위테스트(GraphQL pagination/loaders, RAG fallback) 13종
pnpm build           # Next 빌드 — SSG 정적 생성(● /artist/[id], /term/[id]) 로그 확인
pnpm build-storybook # Storybook 정적 빌드(a11y 패널 포함)
pnpm exec playwright install chromium && pnpm test:e2e  # Playwright E2E + axe a11y 게이트
```

---

## 실행

```bash
pnpm install        # postinstall에서 prisma generate 자동 실행

pnpm db:setup       # SQLite 스키마 생성(db push) + 가상 데이터 시드
# (= pnpm db:push && pnpm db:seed)

pnpm dev            # 앱: http://localhost:3000  (GraphQL: /api/graphql)
pnpm storybook      # 스토리북: http://localhost:6006

pnpm lint           # ESLint (flat config)
pnpm test           # Vitest 단위 테스트 (DB 불필요 — 순수 로직/mock)
pnpm build          # prisma generate → 프로덕션 빌드

# (선택) LLM 답변 켜기
cp .env.example .env.local   # ANTHROPIC_API_KEY 입력
```

> 테스트는 DB에 의존하지 않습니다(DataLoader 배치/cursor 로직은 mock·순수 함수로 검증, RAG는 seed 배열 사용).
> 앱을 **실행**해 GraphQL로 데이터를 조회하려면 `pnpm db:setup`으로 SQLite를 한 번 준비하세요.
> `dev.db`는 커밋되지 않으며(시드로 재생성), `lint`/`test`/`build`는 DB 없이도 통과합니다.

`lint` · `test` · `build` 모두 통과하도록 품질 인프라를 갖췄습니다.

키를 넣지 않아도 챗봇은 규칙 기반 답변으로 동작합니다.

## 폴더 구조

```
prisma/
├─ schema.prisma             # Artist · Album · FandomTerm (SQLite)
└─ seed.ts                   # src/data/seed.ts → DB 시드

src/
├─ app/
│  ├─ api/graphql/route.ts   # Apollo Server (Route Handler) + per-request context
│  ├─ layout.tsx             # Apollo Provider 주입
│  └─ page.tsx               # 챗봇 + 사전 화면
├─ components/               # 프레젠테이션 + 컨테이너 컴포넌트
├─ graphql/                  # schema · resolvers · operations · loaders · pagination · context
├─ lib/                      # apollo client/provider · prisma(싱글턴) · ai(RAG)
├─ data/seed.ts              # 허구 샘플 데이터 (시드의 단일 소스)
└─ stories/                  # Storybook 스토리
```

---

## 한계 & 다음 단계 (솔직하게)

이 프로젝트는 **학습용 PoC**라 의도적으로 범위를 좁혔습니다.

**구현함(프로덕션 관심사를 직접 다룸)**
- 리졸버를 **Prisma + SQLite** DB 조회로 전환(인메모리 배열 → 실제 DB).
- **DataLoader로 N+1 제거**: `Artist.albums`를 요청 범위 로더로 배치 로딩.
- **cursor 기반 페이지네이션**: `artistsConnection(first, after)` (Relay 스타일, opaque cursor).
- 단위 테스트: RAG fallback + DataLoader 배치 동작 + cursor encode/decode·hasNextPage 로직.

**여전히 범위 밖(솔직하게)**
- DB는 단일 파일 SQLite·허구 데이터 — 인증·실서비스 데이터·마이그레이션 운영은 범위 밖.
- GraphQL 구독(Subscription)·필드 단위 권한·rate limit은 미구현.
- 페이지네이션은 forward(`first/after`)만 — backward(`last/before`)·`totalCount`는 미구현.
- 데이터 양이 작아 N+1 개선 효과는 "구조로 증명"한 것(부하 테스트로 수치화는 안 함).
- E2E·컴포넌트 렌더 테스트는 범위 밖 — 다음 단계.

"완성된 제품"이 아니라 **새 기술을 빠르게 익혀 동작하는 형태로 만들어내는 과정**을 보여주는 것이 목적입니다.
