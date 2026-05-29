'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function InsightsClient() {
    const [insight, setInsight] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    async function getInsights() {
        setLoading(true)
        setInsight('')
        setDone(false)

        const response = await fetch('/api/ai/insights')
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done: streamDone, value } = await reader.read()
            if (streamDone) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6)
                    if (data === '[DONE]') {
                        setDone(true)
                        break
                    }
                    try {
                        const parsed = JSON.parse(data)
                        setInsight(prev => prev + parsed.text)
                    } catch {}
                }
            }
        }

        setLoading(false)
    }

    return (
        <>
        <style>{`
            .ins-heading { color: #111827; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.5; }
            .ins-hint { color: #9ca3af; font-size: 14px; margin-top: 4px; }
            .ins-btn {
                background: #6366f1; color: white; border: none;
                border-radius: 12px; padding: 11px 24px;
                font-size: 14px; font-weight: 500; cursor: pointer;
                transition: opacity 0.15s; display: flex; align-items: center;
                justify-content: center; gap: 8px;
                font-family: 'DM Sans', sans-serif;
                white-space: nowrap;
            }
            .ins-btn:hover { opacity: 0.9; }
            .ins-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .ins-card {
                background: #ffffff;
                border: 1px solid #f3f4f6;
                border-radius: 16px;
                padding: 28px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .ins-empty {
                background: #ffffff;
                border: 1px solid #f3f4f6;
                border-radius: 16px;
                padding: 64px 24px;
                text-align: center;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .ins-empty-title { color: #374151; font-size: 16px; font-weight: 600; margin-bottom: 6px; }
            .ins-empty-hint { color: #9ca3af; font-size: 13px; max-width: 320px; margin: 0 auto; line-height: 1.6; }
            .ins-divider { border-top: 1px solid #f3f4f6; margin-top: 24px; padding-top: 20px; display: flex; justify-content: flex-end; }
            .ins-regen { color: #6366f1; font-size: 13px; font-weight: 500; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
            .ins-regen:hover { text-decoration: underline; }
            .ins-cursor { color: #6366f1; animation: blink 1s infinite; }
            @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

            .ins-prose p { color: #374151; font-size: 14px; line-height: 1.75; margin: 0 0 12px; }
            .ins-prose p:last-child { margin-bottom: 0; }
            .ins-prose h1,.ins-prose h2,.ins-prose h3 { color: #111827; font-weight: 600; margin: 20px 0 8px; line-height: 1.4; }
            .ins-prose h2 { font-size: 16px; }
            .ins-prose h3 { font-size: 14px; }
            .ins-prose ul,.ins-prose ol { color: #374151; font-size: 14px; line-height: 1.75; padding-left: 20px; margin: 8px 0; }
            .ins-prose li { margin-bottom: 4px; }
            .ins-prose strong { color: #111827; font-weight: 600; }
            .ins-prose code { background: #f3f4f6; color: #6366f1; padding: 1px 6px; border-radius: 4px; font-size: 12px; }
            .ins-prose blockquote { border-left: 3px solid #6366f1; padding-left: 16px; margin: 12px 0; color: #6b7280; font-style: italic; }

            .dark .ins-heading { color: #f9fafb; }
            .dark .ins-hint { color: #6b7280; }
            .dark .ins-card { background: #1f2937; border-color: rgba(55,65,81,0.5); box-shadow: none; }
            .dark .ins-empty { background: #1f2937; border-color: rgba(55,65,81,0.5); box-shadow: none; }
            .dark .ins-empty-title { color: #f9fafb; }
            .dark .ins-empty-hint { color: #6b7280; }
            .dark .ins-divider { border-top-color: #374151; }
            .dark .ins-prose p { color: #d1d5db; }
            .dark .ins-prose h1,.dark .ins-prose h2,.dark .ins-prose h3 { color: #f9fafb; }
            .dark .ins-prose ul,.dark .ins-prose ol { color: #d1d5db; }
            .dark .ins-prose strong { color: #f9fafb; }
            .dark .ins-prose code { background: rgba(99,102,241,0.15); color: #818cf8; }
            .dark .ins-prose blockquote { color: #9ca3af; }

            @media (max-width: 640px) {
                .ins-btn { width: 100%; }
                .ins-card { padding: 20px; }
                .ins-empty { padding: 48px 20px; }
            }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                    <h1 className="ins-heading">AI Insights</h1>
                    <p className="ins-hint">Personalised analysis of your spending</p>
                </div>
                <button onClick={getInsights} disabled={loading} className="ins-btn">
                    {loading ? (
                        <>
                            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                            Analysing...
                        </>
                    ) : (
                        '✨ Get AI Insights'
                    )}
                </button>
            </div>

            {/* Content */}
            {insight ? (
                <div className="ins-card">
                    <div className="ins-prose">
                        <ReactMarkdown>{insight}</ReactMarkdown>
                        {loading && <span className="ins-cursor">▊</span>}
                    </div>
                    {done && (
                        <div className="ins-divider">
                            <button onClick={getInsights} className="ins-regen">
                                Regenerate insights →
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                !loading && (
                    <div className="ins-empty">
                        <p style={{ fontSize: '40px', marginBottom: '12px' }}>✨</p>
                        <p className="ins-empty-title">Get personalised AI insights</p>
                        <p className="ins-empty-hint">
                            We'll analyse your spending and give you actionable recommendations
                        </p>
                    </div>
                )
            )}
        </div>
        </>
    )
}