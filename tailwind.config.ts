import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // 성능/폰트(why): layout.tsx의 next/font가 노출한 CSS 변수(--font-inter)를
      // sans 스택 맨 앞에 둔다. Tailwind preflight가 본문 폰트로 fontFamily.sans를 적용하므로,
      // 이렇게 해야 self-host된 Inter가 실제 렌더에 쓰인다(미설정 시 변수만 있고 적용 안 됨).
      // 폰트 로드 실패/지연 시 기본 sans 스택으로 폴백 → FOIT 없이 안전.
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

export default config;
