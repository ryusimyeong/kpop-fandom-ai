'use client';
/**
 * @file 팬 Q&A 챗봇 패널. ASK 뮤테이션으로 RAG 답변을 받아 ChatBubble로 렌더.
 */
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ASK } from '@/graphql/operations';
import { ChatBubble } from './ChatBubble';

interface Message {
  role: 'user' | 'bot';
  text: string;
  sources?: string[];
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ask, { loading }] = useMutation(ASK);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) {
      return;
    }
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');

    try {
      const { data } = await ask({ variables: { question } });
      const answer = data?.ask;
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: answer?.answer ?? 'Sorry, something went wrong.', sources: answer?.sources },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Network error. Please try again.' }]);
    }
  };

  // why: section을 헤더 제목과 aria-labelledby로 연결해 landmark에 이름을 부여(스크린리더 랜드마크 목록에서 식별 가능).
  return (
    <section
      className="flex h-[28rem] flex-col rounded-xl border border-gray-200"
      aria-labelledby="chat-panel-heading"
    >
      <header className="border-b border-gray-100 px-4 py-3 text-sm font-bold text-gray-900">
        {/* 이모지는 장식 → aria-hidden으로 스크린리더가 "말풍선 이모지"로 읽지 않게 함 */}
        <h2 id="chat-panel-heading" className="text-sm font-bold">
          <span aria-hidden="true">💬 </span>Fan Q&amp;A Bot
        </h2>
      </header>
      {/*
       * 채팅 메시지 영역을 라이브 영역으로 선언.
       * role="log" + aria-live="polite": 새 봇 답변/사용자 발화가 추가되면 스크린리더가
       *   현재 읽기를 끊지 않고 차례로 안내한다(WCAG 4.1.3 Status Messages).
       * aria-busy: 답변 생성 중임을 보조기술에 노출(시각적 로딩 도트의 텍스트 등가물).
       * aria-atomic="false": 영역 전체가 아닌 새로 추가된 노드만 읽도록 한다.
       */}
      <div
        className="flex-1 overflow-y-auto p-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-busy={loading}
        aria-label="대화 내용"
      >
        {messages.length === 0 && (
          // text-gray-400 → text-gray-600으로 상향(흰 배경 대비 AA 충족). 한국어 예문은 lang="ko"
          <p className="text-sm text-gray-600">
            Ask me about an artist or a fandom term! (e.g. <span lang="ko">&quot;별빛소녀 소개해줘&quot;</span>)
          </p>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} sources={m.sources}>
            {m.text}
          </ChatBubble>
        ))}
        {loading && (
          <ChatBubble role="bot" loading>
            {''}
          </ChatBubble>
        )}
      </div>
      <div className="flex gap-2 border-t border-gray-100 p-3">
        {/*
         * 입력창: 보이는 라벨 대신 sr-only <label>로 연결(htmlFor/id).
         * why: aria-label만으로도 접근 가능하나, 실제 <label> 연결이 더 견고하고
         *      음성입력/일부 보조기술 호환성이 높다(WCAG 1.3.1, 3.3.2 Labels).
         */}
        <label htmlFor="chat-question-input" className="sr-only">
          질문 입력
        </label>
        <input
          id="chat-question-input"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="Type your question..."
          aria-label="질문 입력"
        />
        {/* aria-label: 버튼 텍스트 "Send"만으로는 무엇을 보내는지 불명확 → 한국어 명시 라벨 부여 */}
        <button
          type="button"
          className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={handleSend}
          disabled={loading}
          aria-label="질문 보내기"
        >
          Send
        </button>
      </div>
    </section>
  );
}
