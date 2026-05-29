'use client'

import { useState } from 'react'
import { Transaction } from '../types/Transaction'

function formatCategory(category: string) {
    return category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function TransactionSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    async function handleSearch() {
        if (!query.trim()) return
        setLoading(true)
        setSearched(true)
        const res = await fetch(`/api/ai/search?query=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
        setLoading(false)
    }

    return (
      <>
        <style>{`
            .ts-wrap { padding: 20px; border-bottom: 1px solid #f3f4f6; }
            .ts-title { color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 12px; }
            .ts-input {
                flex: 1; border: 1px solid #e5e7eb; border-radius: 10px;
                padding: 9px 14px; font-size: 13px; outline: none;
                background: #f9fafb; color: #111827;
                transition: border-color 0.15s;
                font-family: 'DM Sans', sans-serif;
            }
            .ts-input:focus { border-color: #6366f1; background: #fff; }
            .ts-btn {
                background: #6366f1; color: white; border: none;
                border-radius: 10px; padding: 9px 20px; font-size: 13px;
                font-weight: 500; cursor: pointer; white-space: nowrap;
                transition: opacity 0.15s; font-family: 'DM Sans', sans-serif;
            }
            .ts-btn:hover { opacity: 0.9; }
            .ts-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .ts-result-row { padding: 12px 0; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
            .ts-result-row:not(:last-child) { border-bottom: 1px solid #f3f4f6; }
            .ts-result-desc { color: #111827; font-size: 13px; font-weight: 500; }
            .ts-result-meta { color: #9ca3af; font-size: 11px; margin-top: 2px; }
            .ts-empty { color: #9ca3af; font-size: 13px; padding: 12px 0; }

            .dark .ts-wrap { border-bottom-color: #374151; }
            .dark .ts-title { color: #f9fafb; }
            .dark .ts-input { background: #374151; border-color: #4b5563; color: #f9fafb; }
            .dark .ts-input::placeholder { color: #6b7280; }
            .dark .ts-input:focus { border-color: #6366f1; background: #374151; }
            .dark .ts-result-row:not(:last-child) { border-bottom-color: #374151; }
            .dark .ts-result-desc { color: #f9fafb; }
            .dark .ts-result-meta { color: #6b7280; }
            .dark .ts-empty { color: #6b7280; }
        `}</style>

        <div className="ts-wrap">
            <p className="ts-title">🔍 Smart Search</p>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value)
                        if (!e.target.value.trim()) {
                            setSearched(false)
                            setResults([])
                        }
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder='Try "coffee shops" or "subscriptions"'
                    className="ts-input"
                />
                <button onClick={handleSearch} disabled={loading} className="ts-btn">
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {searched && (
                <div style={{ marginTop: '16px' }}>
                    {results.length === 0 ? (
                        <p className="ts-empty">No matching transactions found.</p>
                    ) : (
                        <div>
                            {results.map(t => (
                                <div key={t.id} className="ts-result-row">
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <p className="ts-result-desc" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {t.description}
                                        </p>
                                        <p className="ts-result-meta">
                                            {formatCategory(t.category)} · {new Date(t.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <span style={{
                                        color: t.amount < 0 ? '#10b981' : undefined,
                                        fontSize: '13px', fontWeight: 600, flexShrink: 0
                                    }} className={t.amount >= 0 ? 'ts-result-desc' : ''}>
                                        {t.amount < 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </>
    )
}