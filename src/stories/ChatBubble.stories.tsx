/**
 * @file ChatBubble 스토리. 사용자/봇/로딩/근거칩 등 상태별 변형을 문서화.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from '@/components/ChatBubble';

const meta: Meta<typeof ChatBubble> = {
  title: 'Chat/ChatBubble',
  component: ChatBubble,
  parameters: { layout: 'padded' },
  argTypes: {
    role: { control: 'radio', options: ['user', 'bot'] },
    loading: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof ChatBubble>;

export const UserMessage: Story = {
  args: { role: 'user', children: '별빛소녀 데뷔 언제야?' },
};

export const BotAnswer: Story = {
  args: {
    role: 'bot',
    children: '별빛소녀(Starlit)는 2021년에 데뷔한 5인조 걸그룹이에요!',
    sources: ['a1'],
  },
};

export const BotLoading: Story = {
  args: { role: 'bot', loading: true, children: '' },
};

export const LongAnswerWithSources: Story = {
  args: {
    role: 'bot',
    children:
      'CityBoys는 2019년 데뷔한 4인조 보이그룹이고, R&B와 힙합을 오가는 음악색이 특징이에요. 자작곡 비중이 높아요.',
    sources: ['a2', 't2'],
  },
};
