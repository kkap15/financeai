'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BudgetForm() {
    const [category, setCategory] = useState('')
    const [limit, setLimit] = useState('')
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const router = useRouter()

    async function handleSubmit() {
        if (!category || !limit) return
        setLoading(true)
        await fetch('/api/budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, limit: parseFloat(limit) })
        })
        setLoading(false)
        setCategory('')
        setLimit('')
        router.refresh()
    }

    useEffect(() => {
        fetch('/api/transactions/categories')
            .then(r => r.json())
            .then(setCategories)
    }, [])

    const disabled = loading || !category || !limit

    return (
        <>
        <style>{`
            .bf-card {
                background: #ffffff;
                border: 1px solid #f3f4f6;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .bf-label {
                color: #6b7280;
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.07em;
                margin-bottom: 6px;
                display: block;
            }
            .bf-input {
                width: 100%;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 10px 14px;
                color: #111827;
                font-size: 14px;
                outline: none;
                box-sizing: border-box;
                transition: border-color 0.15s;
                font-family: 'DM Sans', sans-serif;
            }
            .bf-input:focus { border-color: #6366f1; }
            .bf-heading { color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 20px; font-family: 'Syne', sans-serif; }

            .dark .bf-card { background: #1f2937; border-color: rgba(55,65,81,0.5); box-shadow: none; }
            .dark .bf-label { color: #6b7280; }
            .dark .bf-input { background: #374151; border-color: #4b5563; color: #f9fafb; }
            .dark .bf-input::placeholder { color: #6b7280; }
            .dark .bf-input option { background: #374151; color: #f9fafb; }
            .dark .bf-heading { color: #f9fafb; }
        `}</style>

        <div className="bf-card">
            <h2 className="bf-heading">Set a Budget</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Category */}
                <div>
                    <label className="bf-label">Category</label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="bf-input"
                    >
                        <option value="">Select a category</option>
                        {categories.map(c => (
                            <option key={c} value={c}>
                                {c.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Monthly Limit */}
                <div>
                    <label className="bf-label">Monthly Limit ($)</label>
                    <input
                        type="number"
                        value={limit}
                        onChange={e => setLimit(e.target.value)}
                        placeholder="e.g. 500"
                        className="bf-input"
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        background: disabled ? '#e5e7eb' : '#6366f1',
                        color: disabled ? '#9ca3af' : '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                        fontFamily: "'DM Sans', sans-serif",
                    }}
                >
                    {loading ? 'Saving...' : 'Save Budget'}
                </button>
            </div>
        </div>
        </>
    )
}