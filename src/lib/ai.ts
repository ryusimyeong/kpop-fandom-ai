/**
 * @file RAG 답변 생성. 보유 데이터(아티스트/용어)에서 관련 항목을 검색해 컨텍스트를 구성하고,
 * LLM에 전달해 근거 기반 답변을 생성한다.
 *
 * 설계 의도:
 * - 검색(retrieve) → 컨텍스트 주입(augment) → 생성(generate)의 RAG 흐름을 그대로 보여준다.
 * - `ANTHROPIC_API_KEY`가 없으면 규칙 기반 fallback으로 동작해 데모/CI가 절대 깨지지 않게 한다.
 *   (실제 운영이라면 LLM 호출, PoC 데모라면 fallback — 둘 다 같은 인터페이스)
 */
import type { Artist, FandomTerm } from '@/data/seed';

interface KnowledgeBase {
  artists: Artist[];
  terms: FandomTerm[];
}

export interface RagAnswer {
  question: string;
  answer: string;
  sources: string[];
}

/** 질문과 각 항목의 텍스트를 단순 토큰 겹침으로 점수화해 관련 항목을 retrieve. */
function retrieve(question: string, kb: KnowledgeBase) {
  const q = question.toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);

  const score = (text: string) => {
    const t = text.toLowerCase();
    return tokens.reduce((acc, tok) => (t.includes(tok) ? acc + 1 : acc), 0);
  };

  const artistHits = kb.artists
    .map((a) => ({ item: a, s: score(`${a.name} ${a.agency} ${a.bio}`) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  const termHits = kb.terms
    .map((t) => ({ item: t, s: score(`${t.term} ${t.romanized} ${t.meaning}`) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);

  return { artistHits, termHits };
}

/** retrieve 결과를 LLM 프롬프트용 컨텍스트 문자열로 직렬화. */
function buildContext(hits: ReturnType<typeof retrieve>): { context: string; sources: string[] } {
  const lines: string[] = [];
  const sources: string[] = [];

  for (const { item } of hits.artistHits.slice(0, 3)) {
    lines.push(`[Artist:${item.id}] ${item.name} (debut ${item.debutYear}, ${item.agency}) — ${item.bio} Albums: ${item.albums.map((al) => al.title).join(', ')}.`);
    sources.push(item.id);
  }
  for (const { item } of hits.termHits.slice(0, 3)) {
    lines.push(`[Term:${item.id}] ${item.term} (${item.romanized}) — ${item.meaning}`);
    sources.push(item.id);
  }

  return { context: lines.join('\n'), sources };
}

/** API 키가 없을 때 쓰는 규칙 기반 답변. 컨텍스트를 그대로 정리해 돌려준다. */
function fallbackAnswer(question: string, context: string, sources: string[]): RagAnswer {
  const answer = context
    ? `Based on what I know:\n${context}\n\n(This is a rule-based answer — set ANTHROPIC_API_KEY to enable the LLM.)`
    : `I don't have data matching "${question}" yet. Try asking about an artist or a fandom term.`;
  return { question, answer, sources };
}

/** 메인 진입점. 키가 있으면 Claude 호출, 없으면 fallback. */
export async function generateAnswer(question: string, kb: KnowledgeBase): Promise<RagAnswer> {
  const hits = retrieve(question, kb);
  const { context, sources } = buildContext(hits);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallbackAnswer(question, context, sources);
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system:
          'You are a friendly K-pop fandom assistant for global fans. Answer ONLY from the provided context. ' +
          'If the context is empty or irrelevant, say you do not have that info. Keep it concise and warm.',
        messages: [
          {
            role: 'user',
            content: `Context:\n${context || '(none)'}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      return fallbackAnswer(question, context, sources);
    }
    const data = (await res.json()) as { content?: Array<{ text?: string }> };
    const answer = data.content?.[0]?.text?.trim() || fallbackAnswer(question, context, sources).answer;
    return { question, answer, sources };
  } catch {
    return fallbackAnswer(question, context, sources);
  }
}
