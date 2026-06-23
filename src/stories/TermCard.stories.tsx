/**
 * @file TermCard 스토리. 카테고리별 배지 색상·예문 유무·오버플로우·다국어 변형을 문서화.
 *
 * [면접 어필] 카테고리(general/event/rank/relationship) 4종은 배지 "색"으로만 구분된다.
 * 색맹/저시력 사용자를 고려하면 색 단독 구분은 a11y 위험인데, 스토리로 4종을 나란히 고정해 두면
 * 색 대비/구분 가능성을 a11y 패널로 한눈에 회귀 검사할 수 있다. (개선안은 컴포넌트 영역 담당과 협의)
 */
import type { Meta, StoryObj } from '@storybook/react';
import { TermCard } from '@/components/TermCard';
import { fandomTerms } from '@/data/seed';
import type { FandomTerm } from '@/data/seed';

const meta: Meta<typeof TermCard> = {
  title: 'Cards/TermCard',
  component: TermCard,
  parameters: {
    layout: 'centered',
    // [a11y 패널 설정 제안 — 통합단계 @storybook/addon-a11y 추가 후 활성]
    // 배지가 색으로만 카테고리를 구분 → color-contrast 룰 상시 ON으로 회귀 감시.
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof TermCard>;

/** relationship 배지(핑크) + 예문 있음. */
export const Relationship: Story = {
  args: { term: fandomTerms.find((t) => t.category === 'relationship')! },
  parameters: {
    docs: { description: { story: 'relationship 카테고리(핑크 배지) + 예문 포함. 가장 정보가 꽉 찬 정상 케이스.' } },
  },
};

/** event 배지(블루) + 예문 있음. */
export const Event: Story = {
  args: { term: fandomTerms.find((t) => t.category === 'event')! },
  parameters: {
    docs: { description: { story: 'event 카테고리(블루 배지). 배지 색만으로 relationship과 구분되는지 비교용.' } },
  },
};

/** rank 배지(앰버) + 예문 있음. */
export const Rank: Story = {
  args: { term: fandomTerms.find((t) => t.category === 'rank')! },
  parameters: {
    docs: { description: { story: 'rank 카테고리(앰버 배지). 4색 배지 중 가장 밝은 색이라 대비 검사에서 위험도가 높은 케이스.' } },
  },
};

/** empty 변형: example 미포함(general). 예문 영역이 없을 때 카드 하단이 깔끔한지. */
export const NoExample: Story = {
  args: { term: fandomTerms.find((t) => t.category === 'general')! },
  parameters: {
    docs: {
      description: {
        story:
          '엣지케이스(empty): example가 없는 용어(general). 예문 블록이 조건부 렌더라 사라졌을 때 ' +
          '의미(meaning)와 카드 테두리 사이 여백이 어색해지지 않는지 확인한다.',
      },
    },
  },
};

/** overflow 변형: 초장문 meaning/example/term. 카드 폭 넘침·줄바꿈 검증. */
export const LongContentOverflow: Story = {
  args: {
    term: {
      id: 't-long',
      term: '인생곡-of-the-decade-슈퍼-울트라-명곡',
      romanized: 'insaeng-gok-super-ultra-myeong-gok',
      category: 'general',
      meaning:
        'A term whose definition is intentionally very long: this stress-tests that long meaning text ' +
        'wraps cleanly inside the card without horizontal overflow, even when the upstream dictionary ' +
        'source returns an unbounded string. 정의가 비정상적으로 길어도 카드가 가로로 넘치지 않아야 합니다.',
      example:
        '"이건 의도적으로 아주 긴 예문입니다 — supercalifragilisticexpialidocious 같은 긴 단어가 줄바꿈되는지까지 확인합니다."',
    } satisfies FandomTerm,
  },
  parameters: {
    docs: {
      description: {
        story:
          '오버플로우 스트레스: 용어/풀이/예문이 모두 비정상적으로 길 때. 긴 단어가 카드 폭을 ' +
          '비집고 나가 그리드(sm:grid-cols-2) 정렬을 깨뜨리지 않는지 점검한다.',
      },
    },
  },
};

/** 다국어 변형: 한/영/일/이모지가 term·meaning에 혼재. 헤더 정렬·배지 위치 유지 확인. */
export const Multilingual: Story = {
  args: {
    term: {
      id: 't-multi',
      term: '컴백 ✨ カムバック',
      romanized: 'comeback (カムバック)',
      category: 'event',
      meaning:
        'A new release/promotion cycle. 컴백은 단순 "복귀"가 아니라 새 활동 주기를 뜻해요. ' +
        '日本のファンにも同じ意味で使われます。',
      example: '"3rd comeback" = 3번째 활동기 = 3回目のカムバック',
    } satisfies FandomTerm,
  },
  parameters: {
    docs: {
      description: {
        story:
          '다국어 혼재: 글로벌 용어 사전이라 한·영·일·이모지가 한 카드에 섞인다. 서로 다른 문자폭이 ' +
          '헤더(용어 ↔ 로마자 ↔ 우측 배지) 정렬을 어긋나게 하지 않는지, 배지가 항상 우측 상단에 ' +
          '고정되는지 확인한다.',
      },
    },
  },
};
