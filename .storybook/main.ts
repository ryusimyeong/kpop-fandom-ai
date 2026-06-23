import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    // play 상호작용 패널: 컨테이너 스토리(ChatPanel/TermDictionary)의 userEvent/waitFor 흐름을 패널에서 단계별로 확인.
    '@storybook/addon-interactions',
    // a11y 패널: 각 스토리 meta의 parameters.a11y(color-contrast 룰 등) 설정을 활성화해 스토리 단위 접근성 검사.
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['../public'],
  viteFinal: async (cfg) => {
    // 앱과 동일한 @ alias를 Storybook 빌드에도 적용.
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias ?? {}),
      '@': fileURLToPath(new URL('../src', import.meta.url)),
    };
    return cfg;
  },
};

export default config;
