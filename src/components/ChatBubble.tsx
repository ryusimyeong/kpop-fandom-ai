/**
 * @file 채팅 말풍선. 사용자/봇 발화를 구분해 렌더. 순수 프레젠테이션 컴포넌트(Storybook 문서화 대상).
 */
import type { ReactNode } from 'react';

export interface ChatBubbleProps {
  role: 'user' | 'bot';
  /** 메시지 본문 */
  children: ReactNode;
  /** 봇 답변의 근거 칩(아티스트/용어 id 등). user 메시지에는 보통 없음. */
  sources?: string[];
  /** 답변 생성 중 로딩 상태 */
  loading?: boolean;
}

export function ChatBubble({ role, children, sources, loading }: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        {loading ? (
          <span className="inline-flex gap-1" aria-label="답변 생성 중">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.3s]" />
          </span>
        ) : (
          <div className="whitespace-pre-wrap">{children}</div>
        )}
        {sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {sources.map((s) => (
              <span key={s} className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                source: {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
