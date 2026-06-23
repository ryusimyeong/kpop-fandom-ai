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
  // why: 정렬·색만으로 화자를 구분하면 스크린리더는 누가 한 말인지 알 수 없다.
  //      sr-only 접두 라벨로 "나의 질문:" / "봇 답변:"을 음성으로만 전달(시각 디자인 불변, WCAG 1.3.1).
  const speakerLabel = isUser ? '나의 질문: ' : '봇 답변: ';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-900'
        }`}
      >
        {loading ? (
          // 로딩 도트: 시각 표현(bounce)에 더해 role="status"로 "답변 생성 중"을 보조기술에 전달.
          <span className="inline-flex gap-1" role="status" aria-label="답변 생성 중">
            {/* 점들은 순수 장식이므로 aria-hidden. bg-gray-400 → 회색 말풍선(bg-gray-100) 위 대비 보강 위해 bg-gray-500 */}
            <span aria-hidden="true" className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
            <span aria-hidden="true" className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.15s]" />
            <span aria-hidden="true" className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.3s]" />
          </span>
        ) : (
          <div className="whitespace-pre-wrap">
            <span className="sr-only">{speakerLabel}</span>
            {children}
          </div>
        )}
        {sources && sources.length > 0 && (
          // 근거 칩 목록: 의미상 리스트 → ul/li. 그룹 라벨 aria-label로 "근거"임을 안내.
          <ul className="mt-2 flex flex-wrap gap-1" aria-label="근거 출처">
            {sources.map((s) => (
              <li
                key={s}
                // text-[10px](10px)는 너무 작아 가독성 위험 → text-xs(12px)로 상향.
                // text-gray-600 → text-gray-700로 반투명 흰 배경 위 대비 보강.
                className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-700"
              >
                source: {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
