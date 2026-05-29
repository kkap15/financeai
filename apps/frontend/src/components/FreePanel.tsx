'use client'

const features = [
    { feature: 'Connect 1 bank account', free: true },
    { feature: 'Transaction history', free: true },
    { feature: 'Budget tracking', free: true },
    { feature: 'Spending dashboard', free: true },
    { feature: 'AI spending insights', free: false },
    { feature: 'AI finance chat', free: false },
    { feature: 'Semantic transaction search', free: false },
    { feature: 'Unlimited bank accounts', free: false },
]

export default function FreePanel() {
    async function handleUpgrade() {
        const res = await fetch('/api/subscriptions/checkout', { method: 'POST' })
        const { url } = await res.json()
        window.location.href = url
    }

    return (
        <>
        <style>{`
            .fp-badge { background: #f3f4f6; color: #6b7280; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 999px; letter-spacing: 0.04em; text-transform: uppercase; display: inline-block; margin-bottom: 20px; }
            .fp-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .fp-row:last-of-type { border-bottom: none; }
            .fp-feature { color: #374151; font-size: 13px; }
            .fp-check { color: #10b981; font-size: 14px; }
            .fp-cross { color: #d1d5db; font-size: 14px; }
            .fp-upgrade { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 14px; padding: 24px; text-align: center; margin-top: 24px; }
            .fp-upgrade-title { color: #111827; font-size: 15px; font-weight: 600; margin-bottom: 4px; }
            .fp-upgrade-hint { color: #9ca3af; font-size: 13px; margin-bottom: 16px; }
            .fp-price { color: #111827; font-size: 2rem; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.03em; }
            .fp-price span { color: #9ca3af; font-size: 14px; font-weight: 400; }
            .fp-btn { background: #6366f1; color: white; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 500; cursor: pointer; width: 100%; transition: opacity 0.15s; font-family: 'DM Sans', sans-serif; }
            .fp-btn:hover { opacity: 0.9; }

            .dark .fp-badge { background: #374151; color: #9ca3af; }
            .dark .fp-row { border-bottom-color: #374151; }
            .dark .fp-feature { color: #d1d5db; }
            .dark .fp-cross { color: #4b5563; }
            .dark .fp-upgrade { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); }
            .dark .fp-upgrade-title { color: #f9fafb; }
            .dark .fp-price { color: #f9fafb; }
        `}</style>

        <div>
            <span className="fp-badge">Free Plan</span>

            <div>
                {features.map(({ feature, free }) => (
                    <div key={feature} className="fp-row">
                        <span className="fp-feature">{feature}</span>
                        <span className={free ? 'fp-check' : 'fp-cross'}>
                            {free ? '✓' : '✕'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="fp-upgrade">
                <p className="fp-upgrade-title">Upgrade to Pro</p>
                <p className="fp-upgrade-hint">Unlock AI insights, chat, and semantic search</p>
                <p className="fp-price">$10<span>/month</span></p>
                <button onClick={handleUpgrade} className="fp-btn">
                    Upgrade to Pro →
                </button>
            </div>
        </div>
        </>
    )
}