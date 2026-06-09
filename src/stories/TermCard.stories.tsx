/**
 * @file TermCard 스토리. 카테고리별 배지 색상과 예문 유무 변형을 문서화.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { TermCard } from '@/components/TermCard';
import { fandomTerms } from '@/data/seed';

const meta: Meta<typeof TermCard> = {
  title: 'Cards/TermCard',
  component: TermCard,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof TermCard>;

export const Relationship: Story = {
  args: { term: fandomTerms.find((t) => t.category === 'relationship')! },
};

export const Event: Story = {
  args: { term: fandomTerms.find((t) => t.category === 'event')! },
};

export const Rank: Story = {
  args: { term: fandomTerms.find((t) => t.category === 'rank')! },
};

export const NoExample: Story = {
  args: { term: fandomTerms.find((t) => t.category === 'general')! },
};
