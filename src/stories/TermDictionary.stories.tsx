/**
 * @file TermDictionary(컨테이너) 스토리. Apollo MockedProvider로 GET_TERMS 쿼리를 모킹해
 *       로딩/성공/에러/빈결과 및 카테고리 필터·검색 상호작용을 격리 렌더한다.
 *
 * [면접 어필 — 컨테이너 상태 전이 고정]
 * TermDictionary는 useQuery(GET_TERMS)로 loading/error/data 세 갈래를 직접 분기한다. 이 세 분기는
 * 실제 앱에서 동시에 보기 어렵지만(특히 error), MockedProvider로 각 응답을 결정적으로 주입하면
 * 한 화면씩 고정해 회귀 검증할 수 있다. 또 카테고리 버튼은 클릭마다 GET_TERMS의 variables가 바뀌므로,
 * "필터 클릭 → 다른 variables로 재조회 → 결과 갱신"까지 play로 재현했다.
 *
 * [MockedProvider 변수 매칭 주의 — 회귀에서 자주 막히는 지점]
 * 컴포넌트는 category 'all'/빈 검색을 undefined 로 변환해 보낸다(operations 변수 최소화). MockedProvider는
 * variables 를 "정확히" 매칭하므로, 목의 request.variables 도 { category: undefined, search: undefined } 처럼
 * 컴포넌트가 실제로 보내는 형태와 1:1로 맞춰야 매칭 실패(=무한 로딩)가 나지 않는다.
 *
 * [필요 의존성 — 설치는 통합단계에서. 직접 설치하지 않음]
 *   - @storybook/addon-interactions, @storybook/test  (play/expect/userEvent)
 *   - MockedProvider 는 이미 설치된 @apollo/client(^3.11)의 /testing 진입점에 포함(추가 설치 불필요)
 *   - 미설치 빌드 시 play import만 제거하면 렌더 전용 스토리로 동작
 */
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { within, userEvent, waitFor, expect } from '@storybook/test';
import { TermDictionary } from '@/components/TermDictionary';
import { GET_TERMS } from '@/graphql/operations';
import { fandomTerms } from '@/data/seed';

// __typename을 붙여 MockedProvider(addTypename) 캐시 정규화와 정확히 일치시킨다.
const withTypename = (t: (typeof fandomTerms)[number]) => ({ ...t, __typename: 'FandomTerm' });

/** 초기 조회(필터 all + 빈 검색): variables 가 모두 undefined 로 전송됨 → 전체 용어 반환. */
const allTermsMock: MockedResponse = {
  request: { query: GET_TERMS, variables: { category: undefined, search: undefined } },
  result: { data: { terms: fandomTerms.map(withTypename) } },
  delay: 300,
};

/** event 카테고리 필터 클릭 시 전송되는 variables. event 항목만 반환. */
const eventTermsMock: MockedResponse = {
  request: { query: GET_TERMS, variables: { category: 'event', search: undefined } },
  result: { data: { terms: fandomTerms.filter((t) => t.category === 'event').map(withTypename) } },
  delay: 200,
};

/** 결과가 비는 검색(매칭 없음) → "No matching terms." 안내 검증용. */
const emptySearchMock: MockedResponse = {
  request: { query: GET_TERMS, variables: { category: undefined, search: 'zzzzz' } },
  result: { data: { terms: [] } },
  delay: 200,
};

/** 에러 응답 → "Failed to load terms." 빨간 안내 검증용. */
const errorMock: MockedResponse = {
  request: { query: GET_TERMS, variables: { category: undefined, search: undefined } },
  error: new Error('Simulated query failure'),
  delay: 200,
};

const meta: Meta<typeof TermDictionary> = {
  title: 'Dictionary/TermDictionary',
  component: TermDictionary,
  parameters: {
    layout: 'padded',
    a11y: {
      // [a11y 패널 설정 제안] 카테고리 버튼이 토글인데 aria-pressed 미부여, 선택이 색으로만 구분됨(조사결과 미해결).
      // color-contrast 룰을 켜두고, 추후 aria-pressed 보강 시 패널에서 검증.
      config: { rules: [{ id: 'color-contrast', enabled: true }] },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TermDictionary>;

const withMocks = (mocks: MockedResponse[]) => {
  // decorator를 명명 함수로 만들어 react/display-name 룰을 충족(익명 컴포넌트 경고 방지).
  const MockedDecorator = (StoryFn: () => ReactElement) => (
    <MockedProvider mocks={mocks} addTypename>
      <div style={{ maxWidth: 640 }}>
        <StoryFn />
      </div>
    </MockedProvider>
  );
  MockedDecorator.displayName = 'TermDictionaryMockedDecorator';
  return MockedDecorator;
};

/**
 * loading 상태: 응답 delay 동안 "Loading…" 문구가 보이는 순간을 고정.
 * 빈 mocks 가 아니라 delay 있는 성공 목을 쓰되, play 없이 첫 프레임의 로딩을 문서로 노출한다.
 */
export const Loading: Story = {
  // delay를 길게 준 목으로 감싸 로딩 프레임이 충분히 머무르게 한다.
  decorators: [withMocks([{ ...allTermsMock, delay: 100000 }])],
  parameters: {
    docs: {
      description: {
        story:
          '로딩 상태(loading): GET_TERMS 응답을 기다리는 동안 "Loading…"이 노출되는지 확인. ' +
          '실제 앱에서는 순식간에 지나가 잡기 어려운 프레임을 긴 delay 목으로 고정해 시각 회귀를 가능케 한다.',
      },
    },
  },
};

/** 성공 상태: 전체 용어가 TermCard 그리드로 렌더. */
export const Loaded: Story = {
  decorators: [withMocks([allTermsMock])],
  parameters: {
    docs: {
      description: {
        story:
          '성공 상태(success): 전체 용어가 2열 그리드로 렌더된다. 가장 일반적인 정상 화면이자, ' +
          '필터/검색 변형들의 기준선.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(canvas.getByText('최애')).toBeInTheDocument();
      await expect(canvas.getByText('직캠')).toBeInTheDocument();
    });
  },
};

/** 에러 상태: 쿼리 실패 시 빨간 "Failed to load terms." 안내. */
export const ErrorState: Story = {
  decorators: [withMocks([errorMock])],
  parameters: {
    docs: {
      description: {
        story:
          '에러 상태(error): 쿼리 실패 시 빨간 안내 문구를 보여주는 분기. useQuery의 error 분기는 ' +
          '실제로 재현이 까다로워 스토리로 고정하는 가치가 크다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(canvas.getByText('Failed to load terms.')).toBeInTheDocument();
    });
  },
};

/** 빈 결과 상태: 매칭 없는 검색어 입력 → "No matching terms." */
export const EmptyResult: Story = {
  decorators: [withMocks([allTermsMock, emptySearchMock])],
  parameters: {
    docs: {
      description: {
        story:
          '빈 결과 상태(empty): 검색어가 어떤 용어와도 매칭되지 않을 때의 안내. 사용자가 "검색은 ' +
          '됐지만 결과가 없음"을 오류와 구분해 인지하도록 하는 중요한 상태.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 먼저 초기 로드가 끝나길 기다린 뒤 검색어 입력 → 재조회.
    await waitFor(async () => expect(canvas.getByText('최애')).toBeInTheDocument());
    await userEvent.type(canvas.getByLabelText('용어 검색'), 'zzzzz');
    await waitFor(
      async () => {
        await expect(canvas.getByText('No matching terms.')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};

/** 필터 상호작용: event 버튼 클릭 → variables 변경 → event 용어만 남는지 검증. */
export const FilterByCategory: Story = {
  decorators: [withMocks([allTermsMock, eventTermsMock])],
  parameters: {
    docs: {
      description: {
        story:
          '필터 상호작용(interaction): "event" 카테고리 버튼을 누르면 GET_TERMS variables 가 바뀌어 ' +
          'event 용어만 재조회된다. 버튼 클릭이 곧 새로운 네트워크 요청을 트리거하는 컨테이너 동작을 ' +
          'play로 검증 — 필터 회귀(엉뚱한 variables 전송)를 잡는 데 유효하다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => expect(canvas.getByText('최애')).toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'event' }));
    await waitFor(
      async () => {
        // event 용어(컴백)는 남고, relationship 용어(최애)는 사라져야 한다.
        await expect(canvas.getByText('컴백')).toBeInTheDocument();
        await expect(canvas.queryByText('최애')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};
