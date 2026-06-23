/**
 * @file ChatBubble 스토리. 사용자/봇/로딩/에러/근거칩/오버플로우/다국어 등 상태별 변형을 문서화.
 *
 * [학습 메모] Storybook을 처음 도입하며 의식한 것: 컴포넌트를 앱 실행 없이 "상태별로" 따로 띄워본다는 점.
 * 특히 loading·empty·error 같이 평소 재현이 번거로운 상태를 스토리로 고정해두면, 디자인 QA와
 * 회귀 확인이 쉬워진다. 실무에서 공통 컴포넌트(@teamlink/ui 등)는 만들어봤지만 Storybook 문서화는
 * 안 해봤어서, 그 갭을 메우려고 상태별 스토리를 일부러 여러 개 만들었다.
 *
 * [면접 어필] ChatBubble은 자체적으로 "에러"라는 prop을 갖지 않는다. 채팅 UI에서 에러는 보통
 * "에러 문구를 담은 봇 말풍선"으로 표현된다(ChatPanel의 catch 핸들러가 그렇게 동작). 그래서
 * Error 변형도 별도 상태가 아니라 "에러 텍스트를 가진 bot 메시지"로 충실히 재현했다 — 실제
 * 런타임 표현과 스토리를 일치시키는 게 회귀 방지에 유리하다고 판단.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from '@/components/ChatBubble';

const meta: Meta<typeof ChatBubble> = {
  title: 'Chat/ChatBubble',
  component: ChatBubble,
  parameters: {
    layout: 'padded',
    // [a11y 패널 설정 제안 — 설치는 통합단계에서 @storybook/addon-a11y 추가 후 활성]
    // 근거칩이 text-[10px] + text-gray-600 → 최소크기/대비 룰을 켜둔 채 회귀 감시.
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'radio', options: ['user', 'bot'], description: '발화 주체(정렬·색 결정)' },
    loading: { control: 'boolean', description: '답변 생성 중 로딩 도트 표시' },
    sources: { control: 'object', description: '봇 답변의 근거 id 칩' },
    children: { control: 'text', description: '메시지 본문' },
  },
};
export default meta;

type Story = StoryObj<typeof ChatBubble>;

/** default(user): 우측 정렬 핑크 말풍선. */
export const UserMessage: Story = {
  args: { role: 'user', children: '별빛소녀 데뷔 언제야?' },
  parameters: {
    docs: {
      description: {
        story: '사용자 발화. 우측 정렬 + 핑크 배경으로 봇과 시각적으로 구분되는지 확인하는 기본 상태.',
      },
    },
  },
};

/** default(bot) + 근거칩: 좌측 정렬 회색 말풍선 + source 칩. */
export const BotAnswer: Story = {
  args: {
    role: 'bot',
    children: '별빛소녀(Starlit)는 2021년에 데뷔한 5인조 걸그룹이에요!',
    sources: ['a1'],
  },
  parameters: {
    docs: {
      description: {
        story:
          'RAG 봇 답변. 근거(source) 칩이 함께 노출돼 "AI가 무엇을 근거로 답했는지"를 사용자가 ' +
          '확인할 수 있다 — 환각 신뢰도 측면에서 핵심 UX라 별도 변형으로 고정.',
      },
    },
  },
};

/** loading 변형: 본문 대신 bounce 도트 3개. */
export const BotLoading: Story = {
  args: { role: 'bot', loading: true, children: '' },
  parameters: {
    docs: {
      description: {
        story:
          '로딩 상태(loading): 답변 생성 중 bounce 도트를 표시한다. 비동기 응답을 기다리는 동안 ' +
          'UI가 멈춘 듯 보이지 않게 하는 핵심 상태. 스크린리더용 aria-label("답변 생성 중")이 ' +
          '도트에 달려 있는지 a11y 패널로 함께 확인.',
      },
    },
  },
};

/**
 * error 변형: 별도 prop이 아니라 "에러 문구를 담은 봇 말풍선". ChatPanel의 catch 경로와 동일한 표현.
 */
export const BotError: Story = {
  args: {
    role: 'bot',
    children: 'Network error. Please try again.',
  },
  parameters: {
    docs: {
      description: {
        story:
          '에러 상태(error): 네트워크/서버 오류 시 ChatPanel이 만들어내는 봇 말풍선을 그대로 재현. ' +
          'ChatBubble은 에러 전용 prop이 없으므로 "에러 텍스트를 가진 일반 봇 메시지"로 표현되는데, ' +
          '이 변형을 고정해 두면 에러 카피 변경 시에도 시각 회귀를 잡을 수 있다.',
      },
    },
  },
};

/** overflow 변형: 줄바꿈 없는 초장문 + 다수 근거칩. whitespace-pre-wrap·max-w-[80%] 검증. */
export const LongAnswerWithSources: Story = {
  args: {
    role: 'bot',
    children:
      'CityBoys는 2019년 데뷔한 4인조 보이그룹이고, R&B와 힙합을 오가는 음악색이 특징이에요. ' +
      '자작곡 비중이 높아요. 추가로 길게 늘려보면: this answer keeps going to verify that the ' +
      'bubble respects max-w-[80%], wraps long words, and the source chips wrap to a new line ' +
      'instead of overflowing the bubble horizontally.',
    sources: ['a2', 't2', 't1', 't3', 't4'],
  },
  parameters: {
    docs: {
      description: {
        story:
          '오버플로우(overflow): 긴 답변 + 근거칩이 여러 개일 때. 말풍선이 max-w-[80%]를 지키며 ' +
          '줄바꿈되고, 근거칩들이 가로로 넘치지 않고 다음 줄로 wrap 되는지 확인한다.',
      },
    },
  },
};

/** 다국어 변형: 한/영/일/이모지 혼재 답변에서 whitespace-pre-wrap·줄바꿈이 자연스러운지. */
export const MultilingualAnswer: Story = {
  args: {
    role: 'bot',
    children:
      '별빛소녀 ✨ Starlit debuted in 2021. グローバルファンダム "Starseed" を持っています。\n' +
      '줄바꿈(개행)도 whitespace-pre-wrap로 그대로 보존되는지 확인하는 두 번째 줄입니다.',
    sources: ['a1'],
  },
  parameters: {
    docs: {
      description: {
        story:
          '다국어/개행 케이스: 글로벌 팬덤 답변은 한·영·일·이모지가 섞이고 명시적 개행(\\n)도 포함된다. ' +
          'whitespace-pre-wrap이 개행을 보존하면서도 문자폭이 다른 텍스트를 자연스럽게 줄바꿈하는지 점검.',
      },
    },
  },
};
