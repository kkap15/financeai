'use client'

export default function ProPanel({ currentPeriodEnd }: { currentPeriodEnd?: string | null }) {
    async function handleSubscription() {
        const res = await fetch('/api/subscriptions/portal', {method: 'POST'});
        const data = await res.json();
        if (!res.ok || !data.url) {
            console.error('Portal error:', data);
            alert('Unable to open billing portal. Please try again.');
            return;
        }
        window.location.href = data.url;
    }

    const renewalDate = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Pro Plan
                </span>
            </div>
            {renewalDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Renews on {renewalDate}</p>
            )}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
                <button 
                onClick={handleSubscription}
                className="bg-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-600 w-full"
                >
                    Manage Subscription
                </button>
            </div>
        </div>
    )
}