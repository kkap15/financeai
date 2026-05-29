'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Message } from '../../../types/Message'

export default function ChatClient() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    async function sendMessage() {
        if (!input.trim() || loading) return

        setMessages(prev => [...prev, { role: 'user', content: input }])
        setInput('')
        setLoading(true)

        const history = messages.map(m => m.content)

        const response = await fetch('/api/chat/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input, history })
        })

        setMessages(prev => [...prev, { role: 'assistant', content: '' }])

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') break
                    try {
                        const parsed = JSON.parse(data)
                        setMessages(prev => {
                            const updated = [...prev]
                            updated[updated.length - 1] = {
                                role: 'assistant',
                                content: updated[updated.length - 1].content + parsed.text
                            }
                            return updated
                        })
                    } catch {}
                }
            }
        }

        setLoading(false)
    }

    return (
        <>
        <style>{`
            .chat-heading { color: #111827; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.5; }
            .chat-hint { color: #9ca3af; font-size: 14px; margin-top: 4px; }
            .chat-window {
                background: #ffffff;
                border: 1px solid #f3f4f6;
                border-radius: 16px;
                padding: 20px;
                overflow-y: auto;
                flex: 1;
                margin-bottom: 12px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .chat-empty { text-align: center; color: #9ca3af; margin-top: 80px; }
            .chat-empty-title { font-size: 14px; margin-top: 12px; }
            .chat-empty-hint { font-size: 12px; margin-top: 6px; color: #c4c9d4; }
            .chat-bubble-user {
                background: #6366f1;
                color: #ffffff;
                border-radius: 18px 18px 4px 18px;
                padding: 10px 16px;
                font-size: 14px;
                max-width: 75%;
            }
            .chat-bubble-ai {
                background: #f3f4f6;
                color: #111827;
                border-radius: 18px 18px 18px 4px;
                padding: 10px 16px;
                font-size: 14px;
                max-width: 75%;
            }
            .chat-thinking {
                background: #f3f4f6;
                color: #9ca3af;
                border-radius: 18px 18px 18px 4px;
                padding: 10px 16px;
                font-size: 14px;
            }
            .chat-input {
                flex: 1;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 12px 16px;
                font-size: 14px;
                outline: none;
                background: #ffffff;
                color: #111827;
                transition: border-color 0.15s;
                font-family: 'DM Sans', sans-serif;
            }
            .chat-input:focus { border-color: #6366f1; }
            .chat-input:disabled { opacity: 0.5; }
            .chat-send {
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 12px;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: opacity 0.15s;
                font-family: 'DM Sans', sans-serif;
                white-space: nowrap;
            }
            .chat-send:hover { opacity: 0.9; }
            .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }

            .dark .chat-heading { color: #f9fafb; }
            .dark .chat-hint { color: #6b7280; }
            .dark .chat-window { background: #1f2937; border-color: rgba(55,65,81,0.5); box-shadow: none; }
            .dark .chat-empty { color: #6b7280; }
            .dark .chat-empty-hint { color: #4b5563; }
            .dark .chat-bubble-ai { background: #374151; color: #f9fafb; }
            .dark .chat-thinking { background: #374151; color: #6b7280; }
            .dark .chat-input { background: #1f2937; border-color: #374151; color: #f9fafb; }
            .dark .chat-input::placeholder { color: #6b7280; }
            .dark .chat-input:focus { border-color: #6366f1; }

            .prose-chat p { margin: 0 0 8px; }
            .prose-chat p:last-child { margin-bottom: 0; }
            .prose-chat ul { margin: 8px 0; padding-left: 20px; }
            .prose-chat li { margin-bottom: 4px; }
            .prose-chat code { background: rgba(0,0,0,0.08); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
            .dark .prose-chat code { background: rgba(255,255,255,0.1); }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 10rem)' }}>

            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
                <h1 className="chat-heading">AI Finance Chat</h1>
                <p className="chat-hint">Ask anything about your spending</p>
            </div>

            {/* Messages */}
            <div className="chat-window">
                {messages.length === 0 && (
                    <div className="chat-empty">
                        <p style={{ fontSize: '40px' }}>💬</p>
                        <p className="chat-empty-title">Ask me anything about your finances</p>
                        <p className="chat-empty-hint">Try: "how much did I spend this month?"</p>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            {msg.role === 'user' ? (
                                <div className="chat-bubble-user">{msg.content}</div>
                            ) : (
                                <div className="chat-bubble-ai">
                                    <div className="prose-chat">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div className="chat-thinking">
                                <span style={{ animation: 'pulse 1.5s infinite' }}>thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about your finances..."
                    disabled={loading}
                    className="chat-input"
                />
                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="chat-send"
                >
                    Send
                </button>
            </div>
        </div>
        </>
    )
}