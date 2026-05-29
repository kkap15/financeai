'use client'

const features = [
    'Connect 1 bank account',
    'Transaction history',
    'Budget tracking',
    'Spending dashboard',
    'AI spending insights',
    'AI finance chat',
    'Semantic transaction search',
    'Unlimited bank accounts',
]

export default function ProPanel({ currentPeriodEnd }: { currentPeriodEnd?: string | null }) {
    async function handlePortal() {
        const res = await fetch('/api/subscriptions/portal', { method: 'POST' })
        const data = await res.json()
        if (!res.ok || !data.url) {
            alert('Unable to open billing portal. Please try again.')
            return
        }
        window.location.href = data.url
    }

    const renewalDate = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString('en-AU', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
        : null

    return (
        <>
        <style>{`
            .pp-badge { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; letter-spacing: 0.04em; text-transform: uppercase; display: inline-block; margin-bottom: 20px; }
            .pp-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .pp-row:last-of-type { border-bottom: none; }
            .pp-feature { color: #374151; font-size: 13px; }
            .pp-check { color: #6366f1; font-size: 14px; flex-shrink: 0; }
            .pp-manage { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 14px; padding: 24px; text-align: center; margin-top: 24px; }
            .pp-renewal { color: #9ca3af; font-size: 13px; margin-bottom: 16px; }
            .pp-btn { background: transparent; color: #6366f1; border: 1px solid #6366f1; border-radius: 10px; padding: 11px 24px; font-size: 14px; font-weight: 500; cursor: pointer; width: 100%; transition: background 0.15s, color 0.15s; font-family: 'DM Sans', sans-serif; }
            .pp-btn:hover { background: #6366f1; color: white; }

            .dark .pp-row { border-bottom-color: #374151; }
            .dark .pp-feature { color: #d1d5db; }
            .dark .pp-manage { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); }
        `}</style>

        <div>
            <span className="pp-badge">Pro Plan</span>

            <div>
                {features.map(feature => (
                    <div key={feature} className="pp-row">
                        <span className="pp-check">✓</span>
                        <span className="pp-feature">{feature}</span>
                    </div>
                ))}
            </div>

            <div className="pp-manage">
                {renewalDate && (
                    <p className="pp-renewal">Renews on {renewalDate}</p>
                )}
                <button onClick={handlePortal} className="pp-btn">
                    Manage Subscription
                </button>
            </div>
        </div>
        </>
    )
}