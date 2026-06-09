# K-pop Fandom AI

> 글로벌 K-pop 팬을 위한 AI 어시스턴트 — **팬 Q&A 봇** + **덕질 용어 사전**.
> Next.js(App Router) · GraphQL(Apollo) · Storybook으로 구성한 아키텍처 PoC입니다.

## 왜 만들었나

엔터테인먼트/팬덤 플랫폼에서 **AI를 사용자 접점에 적용**하면 어떤 모습일지 빠르게 검증하기 위한 프로토타입입니다. 두 가지 흐름을 담았습니다.

1. **Fan Q&A Bot** — 사용자의 질문을 받아, 보유 데이터(아티스트·앨범·용어)에서 관련 항목을 검색(retrieve)하고 그것을 근거로 LLM이 답변을 생성하는 **RAG** 흐름. 답변에는 근거가 된 데이터 id(`sources`)가 함께 따라와 추적 가능합니다.
2. **Fandom Term Dictionary** — "최애", "컴백", "올킬" 같은 덕질 용어를 글로벌 팬이 이해할 수 있도록 영문 풀이와 함께 제공. 카테고리 필터·검색 지원.

> ⚠️ 모든 아티스트/데이터는 **허구**입니다(저작권 회피). 이 프로젝트의 핵심은 데이터가 아니라 **아키텍처**입니다.

## 기술 스택

| 영역 | 사용 | 포인트 |
|---|---|---|
| **Framework** | Next.js 15 (App Router), React 18, TypeScript | Route Handler로 GraphQL 엔드포인트 노출 |
| **GraphQL (서버)** | Apollo Server + `@as-integrations/next` | 스키마(SDL)·리졸버·Query/Mutation 직접 작성 |
| **GraphQL (클라이언트)** | Apollo Client + InMemoryCache | 쿼리/뮤테이션, 변수·필터, 정규화 캐시 |
| **AI** | Anthropic Claude (RAG) | 키 없으면 규칙 기반 fallback — 데모/CI 안정성 |
| **Design System 문서화** | Storybook 8 | 컴포넌트 상태별 스토리(loading/empty/variant) |
| **Styling** | Tailwind CSS | |

## GraphQL 구조

- **Schema** (`src/graphql/schema.ts`): `Artist`, `Album`, `FandomTerm`, `AskAnswer` 타입 + `Query { artists, artist, terms }` + `Mutation { ask }`.
- **Resolvers** (`src/graphql/resolvers.ts`): Query는 검색/필터, `ask`는 RAG 답변 생성.
- **Operations** (`src/graphql/operations.ts`): 클라이언트 쿼리/뮤테이션 문서 — 변수·페이지네이션 패턴 포함.
- **Endpoint**: `POST /api/graphql` (Apollo Sandbox로 탐색 가능).

## Storybook으로 문서화한 컴포넌트

- `ChatBubble` — user/bot/loading/근거칩 상태
- `ArtistCard` — 걸그룹/보이그룹/앨범 없음
- `TermCard` — 카테고리별 배지 색상/예문 유무

## 실행

```bash
pnpm install

# 개발 서버 (앱)
pnpm dev            # http://localhost:3000

# Storybook
pnpm storybook      # http://localhost:6006

# (선택) LLM 답변 켜기
cp .env.example .env.local   # ANTHROPIC_API_KEY 입력
```

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
