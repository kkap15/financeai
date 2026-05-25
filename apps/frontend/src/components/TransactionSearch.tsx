'use client'

import { useState } from 'react'
import { Transaction } from '@org/shared-types'

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
    <div className="bg-white rounded-xl shadow p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">🔍 Smart Search</h2>
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='Try "coffee shops" or "subscriptions" or "food delivery"'
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searched && (
        <div className="mt-4">
          {results.length === 0 ? (
            <p className="text-gray-500 text-sm">No matching transactions found.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map(t => (
                <div key={t.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{t.description}</p>
                    <p className="text-xs text-gray-500">
                      {t.category.replace(/_/g, ' ')} ·{' '}
                      {new Date(t.date).toLocaleDateString('en-AU')}
                    </p>
                  </div>
                  <span className={`font-medium text-sm ${
                    t.amount < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {t.amount < 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}