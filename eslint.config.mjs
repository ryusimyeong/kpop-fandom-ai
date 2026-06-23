import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'storybook-static/**',
      'next-env.d.ts',
      // Playwright E2E 실행 산출물(리포트/임시 결과) — 소스가 아니므로 lint 제외.
      'playwright-report/**',
      'test-results/**',
    ],
  },
]

export default eslintConfig
