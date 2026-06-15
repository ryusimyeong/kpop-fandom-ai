import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { generateAnswer } from './ai'
import { artists, fandomTerms } from '@/data/seed'

const kb = { artists, terms: fandomTerms }

describe('generateAnswer (RAG fallback)', () => {
  // 키가 없을 때의 규칙 기반 경로를 검증한다(네트워크 호출 없음 → CI 안정).
  const original = process.env.ANTHROPIC_API_KEY

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })
  afterEach(() => {
    if (original === undefined) delete process.env.ANTHROPIC_API_KEY
    else process.env.ANTHROPIC_API_KEY = original
  })

  it('관련 용어를 retrieve해 sources에 근거 id를 담는다', async () => {
    const term = fandomTerms[0] // '최애' (choe-ae)
    const res = await generateAnswer(term.romanized, kb)

    expect(res.question).toBe(term.romanized)
    expect(res.sources).toContain(term.id)
    expect(res.answer).toContain(term.meaning)
  })

  it('관련 아티스트를 retrieve해 sources에 담는다', async () => {
    const artist = artists[0]
    const res = await generateAnswer(artist.name, kb)

    expect(res.sources).toContain(artist.id)
  })

  it('매칭되는 데이터가 없으면 빈 sources와 안내 메시지를 돌려준다', async () => {
    const res = await generateAnswer('zzzznomatch9999', kb)

    expect(res.sources).toEqual([])
    expect(res.answer.toLowerCase()).toContain("don't have")
  })

  it('항상 question/answer/sources 형태를 만족한다', async () => {
    const res = await generateAnswer('컴백', kb)

    expect(res).toHaveProperty('question')
    expect(typeof res.answer).toBe('string')
    expect(Array.isArray(res.sources)).toBe(true)
  })
})
