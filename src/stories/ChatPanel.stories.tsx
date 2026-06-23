/**
 * @file ChatPanel(컨테이너) 스토리. Apollo MockedProvider로 ASK 뮤테이션을 모킹해
 *       "데이터 fetch가 있는 컨테이너"를 앱/백엔드 없이 격리 렌더한다.
 *
 * [면접 어필 — 왜 컨테이너를 스토리화했나]
 * 기존 스토리는 순수 프레젠테이션 3종(ArtistCard/ChatBubble/TermCard)뿐이었다. 실무 회귀의 상당수는
 * "데이터 상태 전이(빈 화면 → 로딩 → 성공/에러)"에서 발생하는데, 그 책임은 컨테이너에 있다.
 * 그래서 @apollo/client/testing 의 MockedProvider 로 네트워크를 결정적으로(deterministic) 고정하고,
 * @storybook/test 의 play 함수로 "입력 → 전송 → 응답" 상호작용까지 스토리에 박아 넣었다.
 * → 백엔드/DB가 없어도 채팅 흐름 전체를 CI에서 재현·검증할 수 있다.
 *
 * [필요 의존성 — 설치는 통합단계에서. 직접 설치하지 않음]
 *   - @storybook/addon-interactions, @storybook/test  (play/expect/userEvent용)
 *   - @apollo/client/testing 의 MockedProvider 는 이미 설치된 @apollo/client(^3.11)에 포함됨(추가 설치 불필요)
 *   - .storybook/main.ts addons 에 '@storybook/addon-interactions' 추가 권장
 *   - 만약 @storybook/test 미설치 상태로 빌드하면 아래 play import만 제거하면 렌더 스토리로는 동작
 */
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { within, userEvent, waitFor, expect } from '@storybook/test';
import { ChatPanel } from '@/components/ChatPanel';
import { ASK } from '@/graphql/operations';

/**
 * ASK 뮤테이션 성공 목 응답. variables(question)가 정확히 일치해야 매칭되므로,
 * play 함수에서 입력하는 질문 문자열과 반드시 동일하게 유지한다.
 */
const SUCCESS_QUESTION = '별빛소녀 소개해줘';
const askSuccessMock: MockedResponse = {
  request: { query: ASK, variables: { question: SUCCESS_QUESTION } },
  result: {
    data: {
      ask: {
        question: SUCCESS_QUESTION,
        answer: '별빛소녀(Starlit)는 2021년에 데뷔한 5인조 걸그룹이에요! 글로벌 팬덤 "Starseed"를 보유하고 있어요.',
        sources: ['a1'],
        __typename: 'AskAnswer',
      },
    },
  },
  // delay: 로딩 도트를 눈으로/테스트로 확인할 수 있도록 약간의 지연을 준다.
  delay: 400,
};

/** ASK 뮤테이션 에러 목 응답(네트워크 실패). ChatPanel의 catch → "Network error..." 봇 말풍선 경로 검증용. */
const askErrorMock: MockedResponse = {
  request: { query: ASK, variables: { question: SUCCESS_QUESTION } },
  error: new Error('Simulated network failure'),
  delay: 300,
};

const meta: Meta<typeof ChatPanel> = {
  title: 'Chat/ChatPanel',
  component: ChatPanel,
  parameters: {
    layout: 'padded',
    a11y: {
      // [a11y 패널 설정 제안] 채팅 로그 영역에 role="log"/aria-live가 아직 없음(조사결과 미해결 항목).
      // 룰을 켜둔 채로 두면 추후 보강 시 통과 여부를 패널에서 바로 확인 가능.
      config: { rules: [{ id: 'color-contrast', enabled: true }] },
    },
  },
  // 컨테이너 스토리는 args가 없으므로 argTypes 대신 decorator로 Apollo 환경을 주입한다.
  // 스토리별로 mocks 가 다르므로 기본 decorator는 두지 않고 각 스토리에서 감싼다.
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ChatPanel>;

/** Apollo MockedProvider 로 ChatPanel을 감싸는 헬퍼 decorator 생성기. */
const withMocks = (mocks: MockedResponse[]) => {
  // decorator를 명명 함수로 만들어 react/display-name 룰을 충족(익명 컴포넌트 경고 방지).
  const MockedDecorator = (StoryFn: () => ReactElement) => (
    <MockedProvider mocks={mocks} addTypename>
      <div style={{ maxWidth: 420 }}>
        <StoryFn />
      </div>
    </MockedProvider>
  );
  MockedDecorator.displayName = 'ChatPanelMockedDecorator';
  return MockedDecorator;
};

/**
 * empty(초기) 상태: 아직 아무 메시지도 없을 때의 안내 문구만 보이는 화면.
 * 사용자가 처음 마주하는 "비어 있지만 길을 안내하는" 상태가 중요해 첫 변형으로 둔다.
 */
export const EmptyInitial: Story = {
  decorators: [withMocks([])],
  parameters: {
    docs: {
      description: {
        story:
          '초기/빈 상태(empty): 메시지가 0개일 때 example 안내 문구만 노출된다. 첫인상 화면이라 ' +
          '"무엇을 물어보면 되는지" 힌트가 보이는지 확인. 네트워크 목이 필요 없는 순수 초기 렌더.',
      },
    },
  },
};

/**
 * 성공 상호작용: 질문 입력 → Send → (로딩 도트) → 봇 답변 + 근거칩 표시까지 play로 자동 재현.
 */
export const AskSuccess: Story = {
  decorators: [withMocks([askSuccessMock])],
  parameters: {
    docs: {
      description: {
        story:
          '성공 플로우(상호작용): 질문 입력 → 전송 → 로딩 → RAG 답변 수신을 play 함수로 자동 재현한다. ' +
          '백엔드 없이도 "사용자 발화 → 봇 답변 + 근거칩" 전체 경로를 CI에서 회귀 검증할 수 있다는 게 핵심.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('질문 입력');
    await userEvent.type(input, SUCCESS_QUESTION);
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));

    // 사용자 말풍선은 즉시 나타나야 한다(낙관적 추가).
    await expect(await canvas.findByText(SUCCESS_QUESTION)).toBeInTheDocument();

    // 지연 후 봇 답변과 근거칩이 나타나는지 검증.
    await waitFor(
      async () => {
        await expect(canvas.getByText(/별빛소녀\(Starlit\)는 2021년/)).toBeInTheDocument();
        await expect(canvas.getByText('source: a1')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};

/**
 * 에러 상호작용: 동일 입력 흐름이지만 목이 에러를 던져 catch 경로의 "Network error..." 봇 말풍선을 검증.
 */
export const AskError: Story = {
  decorators: [withMocks([askErrorMock])],
  parameters: {
    docs: {
      description: {
        story:
          '에러 플로우(상호작용): 네트워크 실패 시 ChatPanel이 catch 하여 "Network error. Please try again." ' +
          '봇 말풍선을 보여주는지 검증한다. 실패 경로는 수동 재현이 가장 번거로운 부분이라 스토리로 고정하는 가치가 크다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('질문 입력');
    await userEvent.type(input, SUCCESS_QUESTION);
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));

    await waitFor(
      async () => {
        await expect(canvas.getByText('Network error. Please try again.')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};
