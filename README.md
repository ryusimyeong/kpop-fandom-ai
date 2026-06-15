# K-pop Fandom AI

> 글로벌 K-pop 팬을 위한 AI 어시스턴트 — **팬 Q&A 봇** + **덕질 용어 사전**.
> **GraphQL과 Storybook을 직접 익히기 위해 만든 학습용 토이 프로젝트**입니다.
> Next.js(App Router) · GraphQL(Apollo) · Storybook으로 구성한 아키텍처 PoC.

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
| AI | Anthropic Claude (RAG) | 키 없으면 규칙 기반 fallback |
| 컴포넌트 문서화 | Storybook 8 (Vite) | 상태별 스토리(loading/empty/variant) |
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

---

## GraphQL 구조

- **Schema** (`src/graphql/schema.ts`): `Artist`·`Album`·`FandomTerm`·`AskAnswer` + `Query { artists, artist, terms }` + `Mutation { ask }`
- **Resolvers** (`src/graphql/resolvers.ts`): Query는 검색/필터, `ask`는 RAG 답변 생성
- **Operations** (`src/graphql/operations.ts`): 클라이언트 쿼리/뮤테이션 문서(변수·필드 선택)
- **Endpoint**: `POST /api/graphql` (Apollo Sandbox로 탐색 가능)

## Storybook으로 문서화한 컴포넌트

- `ChatBubble` — user / bot / loading / 근거칩
- `ArtistCard` — 걸그룹 / 보이그룹 / 앨범 없음
- `TermCard` — 카테고리별 배지 색상 / 예문 유무

---

## 실행

```bash
pnpm install

pnpm dev            # 앱: http://localhost:3000
pnpm storybook      # 스토리북: http://localhost:6006

pnpm lint           # ESLint (flat config)
pnpm test           # Vitest 단위 테스트
pnpm build          # 프로덕션 빌드

# (선택) LLM 답변 켜기
cp .env.example .env.local   # ANTHROPIC_API_KEY 입력
```

`lint` · `test` · `build` 모두 통과하도록 품질 인프라를 갖췄습니다.

키를 넣지 않아도 챗봇은 규칙 기반 답변으로 동작합니다.

## 폴더 구조

```
src/
├─ app/
│  ├─ api/graphql/route.ts   # Apollo Server (Route Handler)
│  ├─ layout.tsx             # Apollo Provider 주입
│  └─ page.tsx               # 챗봇 + 사전 화면
├─ components/               # 프레젠테이션 + 컨테이너 컴포넌트
├─ graphql/                  # schema · resolvers · operations
├─ lib/                      # apollo client/provider · ai(RAG)
├─ data/seed.ts              # 허구 샘플 데이터
└─ stories/                  # Storybook 스토리
```

---

## 한계 & 다음 단계 (솔직하게)

이 프로젝트는 **학습용 PoC**라 의도적으로 범위를 좁혔습니다.

- 데이터는 인메모리 허구 데이터 — 실제 DB·인증·실서비스 데이터는 범위 밖.
- GraphQL 페이지네이션(cursor 기반)·DataLoader(N+1 방지)·구독(Subscription)은 아직 미구현 — 다음 학습 대상.
- 단위 테스트(RAG fallback 로직)는 작성했으나, E2E·컴포넌트 렌더 테스트는 범위 밖 — 다음 단계.

"완성된 제품"이 아니라 **새 기술을 빠르게 익혀 동작하는 형태로 만들어내는 과정**을 보여주는 것이 목적입니다.
