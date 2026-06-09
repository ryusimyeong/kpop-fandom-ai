/**
 * @file ArtistCard 스토리. 앨범 유무 등 변형을 문서화.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { ArtistCard } from '@/components/ArtistCard';
import { artists } from '@/data/seed';

const meta: Meta<typeof ArtistCard> = {
  title: 'Cards/ArtistCard',
  component: ArtistCard,
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof ArtistCard>;

export const GirlGroup: Story = {
  args: { artist: artists[0] },
};

export const BoyGroup: Story = {
  args: { artist: artists[1] },
};

export const NoAlbums: Story = {
  args: {
    artist: { ...artists[0], albums: [] },
  },
};
