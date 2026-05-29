'use client'

export default function FreePanel() {
    async function handleUpgrade() {
        const res = await fetch('/api/subscriptions/checkout', {method: 'POST'});
        const { url } = await res.json();
        window.location.href = url;
    }

    return(
        <div>
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                    Free Plan
                </span>
            </div>

            <div className="space-y-3 mb-8">
                {[
                    { feature: 'Connect 1 bank account', free: true, pro: true },
                    { feature: 'Last 30 days transaction', free: true, pro: true },
                    { feature: 'Unlimited bank accounts', free: false, pro: true },
                    { feature: 'Full transactions history', free: false, pro: true },
                    { feature: 'AI spending insights', free: false, pro: true },
                    { feature: 'AI finance chat', free: false, pro: true },
                    { feature: 'Semantic transaction search', free: false, pro: true },
                    { feature: 'Budget Tracking', free: false, pro: true }
                ].map(({ feature, free, pro }) => (
                    <div key={feature} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                        <div className="flex gap-8">
                            <span className="text-sm w-12 text-center">
                                {free ? '✅' : '-'}
                            </span>
                            <span className="text-sm w-12 text-center">
                                {pro ? '✅' : '-'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
                <p className="text-lg font-semibold mb-1 dark:text-white">Upgrade to Pro</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Unlock AI insights, unlimited banks and more
                </p>
                <p className="text-3xl font-bold mb-4 dark:text-white">
                    $9<span className="text-lg text-gray-500 dark:text-gray-400 font-normal">/month</span>
                </p>
                <button
                onClick={handleUpgrade}
                className="bg-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-600 w-full">
                    Upgrade to Pro →
                </button>
            </div>
        </div>
    )
}
