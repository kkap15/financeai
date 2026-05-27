'use client'

import { useState } from "react";
import { Message } from "../../../types/Message";
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);


    async function sendMessage() {
        if (!input.trim() || loading) return;

        setMessages(prev => [...prev, {role: 'user', content: input}]);

        setInput('');

        setLoading(true);

        const history = messages.map(m => m.content);

        const response = await fetch('/api/chat/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input, history })
        });

        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(data);

                        setMessages(prev => {
                            const updated = [...prev]
                            updated[updated.length - 1] = {
                                role: 'assistant',
                                content: updated[updated.length - 1].content + parsed.text
                            }
                            return updated;
                        })
                    } catch {}
                }
            }
        }
        setLoading(false);
    }

    return (
        <div className="flex flex-col h-[80vh]">
            { /* header   */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold dark:text-white">AI Finance Chat</h1>
                <p className="text-gray-500 dark:text-gray-400">Ask anything about your spending</p>
            </div>

            {/**  Messages */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-500 mt-20">
                        <p className="text-4xl mb-4">💬</p>
                        <p>Ask me anything about your finances</p>
                        <p className="text-sm mt-2">Try: "how much did I spend this month?"</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                        }`}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 dark:text-gray-300">
                            <span className="animate-pulse">thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your finances..."
                disabled={loading}
                className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    )
}
