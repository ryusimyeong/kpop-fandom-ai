/**
 * @file ArtistCard 스토리. 앨범 유무·오버플로우·다국어 등 "프레젠테이션 컴포넌트가
 *       극단적 입력에서도 레이아웃이 무너지지 않는지"를 상태별로 고정 문서화한다.
 *
 * [학습 메모/면접 어필] ArtistCard는 순수 프레젠테이션 컴포넌트라 자체 loading/error 상태가
 * 없다(데이터는 상위 컨테이너가 책임짐). 그래서 여기서는 "데이터 변형(empty/overflow/다국어)"에
 * 집중한다. 반대로 ChatPanel/TermDictionary 스토리에서는 컨테이너가 가진 loading/error/empty를
 * 다룬다 — 관심사 분리(presentational vs container)를 스토리 구성에도 그대로 반영했다.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { ArtistCard } from '@/components/ArtistCard';
import { artists } from '@/data/seed';
import type { Artist } from '@/data/seed';

const meta: Meta<typeof ArtistCard> = {
  title: 'Cards/ArtistCard',
  component: ArtistCard,
  parameters: {
    layout: 'centered',
    // [a11y 패널 설정 제안 — 설치는 통합단계에서 @storybook/addon-a11y 추가 후 활성]
    // 카드 텍스트에 text-gray-500/600 다수 → 대비(contrast) 룰을 켜둔 채로 회귀 감시.
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  // autodocs: Docs 탭 자동 생성. JSDoc/주석이 props 표로 노출되어 팀 공유에 유리.
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ArtistCard>;

/** 걸그룹 기본 데이터(앨범 2개). 가장 일반적인 happy-path 렌더. */
export const GirlGroup: Story = {
  args: { artist: artists[0] },
  parameters: {
    docs: {
      description: {
        story:
          '가장 흔한 정상 케이스. 이름·데뷔연도·소속사·소개·앨범 목록이 모두 채워진 상태로, ' +
          '다른 변형들의 "기준선(baseline)" 역할을 한다.',
      },
    },
  },
};

/** 보이그룹 데이터. 동일 레이아웃이 다른 콘텐츠에서도 일관되게 보이는지 확인. */
export const BoyGroup: Story = {
  args: { artist: artists[1] },
  parameters: {
    docs: {
      description: {
        story:
          '콘텐츠만 다른 두 번째 정상 케이스. 같은 컴포넌트가 데이터에 종속되지 않고 ' +
          '동일한 시각적 리듬을 유지하는지(폰트 크기·간격) 비교용으로 둔다.',
      },
    },
  },
};

/**
 * empty 변형: 앨범 배열이 빈 신인. 목록 영역이 0개일 때 빈 `<ul>`이 어색한
 * 여백/깨짐을 만들지 않는지 확인한다(데뷔 직후 앨범 미발매 시 실제로 발생).
 */
export const NoAlbums: Story = {
  args: {
    artist: { ...artists[0], albums: [] },
  },
  parameters: {
    docs: {
      description: {
        story:
          '엣지케이스(empty): 앨범이 0개인 신인 아티스트. 목록이 비어도 카드 하단 여백이 ' +
          '무너지지 않아야 한다. "데이터가 항상 가득 차 있다"는 가정이 깨지는 첫 지점이라 중요.',
      },
    },
  },
};

/**
 * overflow 변형: 비정상적으로 긴 소개/앨범 제목. 텍스트 줄바꿈·말줄임 없이 카드 폭을
 * 비집고 나가 레이아웃을 깨뜨리지 않는지(가로 스크롤/넘침) 점검한다.
 */
export const LongContentOverflow: Story = {
  args: {
    artist: {
      ...artists[0],
      name: 'SUPER-ULTRA-MEGA 별빛소녀 데뷔 10주년 기념 한정 유닛',
      bio:
        '이것은 의도적으로 매우 긴 소개문입니다. 데이터 소스(예: CMS, 외부 API)에서 길이 제한 없이 ' +
        '내려온 텍스트가 카드 레이아웃을 깨뜨리지 않는지 검증하기 위한 케이스입니다. ' +
        'This bio is intentionally very long to stress-test wrapping, line-height, and that the card ' +
        'never triggers horizontal overflow regardless of the upstream content length.',
      albums: [
        {
          id: 'al-long',
          title: 'Constellation Deluxe Anniversary Repackage Limited Special Edition',
          releaseYear: 2024,
          trackCount: 21,
        },
      ],
    } satisfies Artist,
  },
  parameters: {
    docs: {
      description: {
        story:
          '오버플로우 스트레스 테스트: 이름·소개·앨범 제목이 모두 비정상적으로 길 때. ' +
          '실서비스에서 텍스트 길이는 통제 불가능한 외부 변수이므로, 카드가 가로로 넘치거나 ' +
          '형제 카드의 높이를 들쭉날쭉하게 만들지 않는지 반드시 고정해 둔다.',
      },
    },
  },
};

/**
 * 다국어 변형: 한글·영문·이모지·숫자가 한 카드에 혼재. layout의 lang="en"과 한국어 콘텐츠가
 * 섞이는 이 토이의 실제 상황을 재현 — 폰트 폴백/베이스라인 정렬 확인용.
 */
export const Multilingual: Story = {
  args: {
    artist: {
      ...artists[0],
      name: '별빛소녀 (Starlit) ✨ スターリット',
      agency: 'Nova Entertainment / ノヴァ엔터',
      bio:
        '한글·영문·일본어·이모지가 섞인 글로벌 팬덤용 소개. Global fandom "Starseed" 보유. ' +
        'グローバルに活動するガールズグループ。',
    } satisfies Artist,
  },
  parameters: {
    docs: {
      description: {
        story:
          '다국어 혼재 케이스: 글로벌 K-pop 팬덤 서비스 특성상 한글/영문/일문/이모지가 한 줄에 ' +
          '섞인다. 서로 다른 문자폭과 베이스라인이 헤더 정렬(이름 ↔ 데뷔연도)을 어긋나게 하지 ' +
          '않는지 확인한다. lang 속성 미지정 구간의 폰트 폴백 점검에도 유용.',
      },
    },
  },
};
