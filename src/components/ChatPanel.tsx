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

  return (
    <section className="flex h-[28rem] flex-col rounded-xl border border-gray-200">
      <header className="border-b border-gray-100 px-4 py-3 text-sm font-bold text-gray-900">
        💬 Fan Q&A Bot
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">Ask me about an artist or a fandom term! (e.g. &quot;별빛소녀 소개해줘&quot;)</p>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} sources={m.sources}>
            {m.text}
          </ChatBubble>
        ))}
        {loading && <ChatBubble role="bot" loading children="" />}
      </div>
      <div className="flex gap-2 border-t border-gray-100 p-3">
        <input
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
        <button
          className="rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={handleSend}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </section>
  );
}
