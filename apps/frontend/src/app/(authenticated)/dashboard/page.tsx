import CategoryChart from "@/components/Category/CategoryChart";
import ConnectBankButton from "@/components/ConnectBankButton";
import UpgradeBanner from "@/components/UpgradeBanner";
import { auth0 } from "@/lib/auth0";
import { Transaction } from "../../../types/Transaction"

async function getSummary(accessToken: string) {
    const res = await fetch(`${process.env.API_URL}/api/transactions/summary`, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const text = await res.text();
    if (!res.ok || !text) return null;
    return JSON.parse(text);
}

async function getRecentTransactions(accessToken: string) {
    const url = new URL(`${process.env.API_URL}/api/transactions`)
    url.searchParams.set('page', '1')
    url.searchParams.set('pageSize', '5')
    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    })
    const text = await res.text()
    if (!res.ok || !text) return []
    return JSON.parse(text).transactions
}

const categoryIcons: Record<string, string> = {
    'Food And Drink': '🍔',
    'Transfer': '↔️',
    'Payment': '💳',
    'Travel': '✈️',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Health': '🏥',
    'Loan Payments': '🏦',
    'Other': '📦',
}

function getCategoryIcon(category: string) {
    return categoryIcons[category] ?? '💸'
}

function formatCategory(category: string) {
    return category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ upgraded?: string }>
}) {
    const session = await auth0.getSession();
    const { upgraded } = await searchParams;

    const [summary, recentTransactions] = await Promise.all([
        getSummary(session!.tokenSet.accessToken!),
        getRecentTransactions(session!.tokenSet.accessToken!)
    ]);

    const netFlow = summary ? Math.abs(summary.totalIncome) - summary.totalSpent : 0;

    return (
        <>
        <style>{`
            .dash-card {
                background: #ffffff;
                border: 1px solid #f3f4f6;
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .dash-heading { color: #111827; font-size: 15px; font-weight: 600; margin: 0; }
            .dash-label { color: #9ca3af; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; margin: 0; }
            .dash-hint { color: #9ca3af; font-size: 12px; margin-top: 4px; }
            .dash-value { color: #111827; font-size: 26px; font-weight: 700; margin: 0; font-family: 'Syne', sans-serif; }
            .dash-divider { border-bottom: 1px solid #f3f4f6; }
            .dash-muted { color: #9ca3af; }
            .dash-icon-bg { background: #f3f4f6; }
            .dash-row:hover { background: #f9fafb; }
            .dash-badge { background: #f3f4f6; color: #6b7280; }

            .dark .dash-card {
                background: #1f2937;
                border-color: rgba(55,65,81,0.5);
                box-shadow: none;
            }
            .dark .dash-heading { color: #f9fafb; }
            .dark .dash-label { color: #6b7280; }
            .dark .dash-hint { color: #6b7280; }
            .dark .dash-value { color: #f9fafb; }
            .dark .dash-divider { border-bottom-color: #374151; }
            .dark .dash-muted { color: #6b7280; }
            .dark .dash-icon-bg { background: #374151; }
            .dark .dash-row:hover { background: rgba(55,65,81,0.3); }
            .dark .dash-badge { background: #374151; color: #9ca3af; }

            @media (max-width: 640px) {
                .dash-grid-3 { grid-template-columns: 1fr !important; }
                .dash-hide-mobile { display: none !important; }
                .dash-header { flex-direction: column !important; align-items: flex-start !important; }
                .dash-connect-btn { width: 100% !important; }
            }
            
            @media (min-width: 641px) and (max-width: 900px) {
                .dash-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
            }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {upgraded === 'true' && <UpgradeBanner />}

            {/* Header */}
            <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 className="dash-heading" style={{ fontFamily:"'DM Sans', sans-serif", fontSize: '24px'}}>Dashboard</h1>
                    <p className="dash-hint" style={{ fontSize: '14px' }}>Your financial overview</p>
                </div>
                <ConnectBankButton />
            </div>

            {summary ? (
                <>
                    {/* Stat Cards */}
                    <div className="dash-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>

                        {/* Total Spent */}
                        <div className="dash-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <p className="dash-label">Total Spent</p>
                                <span style={{ fontSize: '18px' }}>💸</span>
                            </div>
                            <p className="dash-value">${summary.totalSpent.toFixed(2)}</p>
                            <p className="dash-hint">All time</p>
                        </div>

                        {/* Total Income */}
                        <div className="dash-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <p className="dash-label">Total Income</p>
                                <span style={{ fontSize: '18px' }}>📈</span>
                            </div>
                            <p className="dash-value" style={{ color: '#10b981' }}>${Math.abs(summary.totalIncome).toFixed(2)}</p>
                            <p className="dash-hint">All time</p>
                        </div>

                        {/* Net Flow */}
                        <div className="dash-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <p className="dash-label">Net Flow</p>
                                <span style={{ fontSize: '18px' }}>⚖️</span>
                            </div>
                            <p className="dash-value" style={{ color: netFlow >= 0 ? '#10b981' : '#f87171' }}>
                                {netFlow >= 0 ? '+' : ''}${Math.abs(netFlow).toFixed(2)}
                            </p>
                            <p className="dash-hint">{summary.byCategory.length} categories</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="dash-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="dash-heading">Spending by Category</h2>
                            <span className="dash-badge" style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px' }}>
                                {summary.byCategory.length} categories
                            </span>
                        </div>
                        <CategoryChart data={summary.byCategory} />
                    </div>
                </>
            ) : (
                <div className="dash-card" style={{ textAlign: 'center', padding: '64px 24px', borderStyle: 'dashed' }}>
                    <p style={{ fontSize: '40px', marginBottom: '12px' }}>🏦</p>
                    <h2 className="dash-heading" style={{ marginBottom: '6px' }}>No transactions yet</h2>
                    <p className="dash-hint" style={{ fontSize: '14px', marginBottom: '24px' }}>Connect your bank account to get started</p>
                    <ConnectBankButton />
                </div>
            )}

            {/* Recent Transactions */}
            <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div className="dash-divider" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
                    <h2 className="dash-heading">Recent Transactions</h2>
                    <a href="/transactions" style={{ color: '#6366f1', fontSize: '13px', textDecoration: 'none' }}>
                        View all →
                    </a>
                </div>

                {recentTransactions.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <p className="dash-hint">No transactions yet</p>
                    </div>
                ) : (
                    recentTransactions.map((t: Transaction, i: number) => (
                        <div
                            key={t.id}
                            className="dash-row"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '14px 24px',
                                borderBottom: i < recentTransactions.length - 1 ? '1px solid' : 'none',
                                borderColor: 'inherit',
                            }}
                        >
                            <div className="dash-icon-bg" style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '16px', flexShrink: 0
                            }}>
                                {getCategoryIcon(formatCategory(t.category))}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="dash-heading" style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {t.description}
                                </p>
                                <p className="dash-hint" style={{ fontSize: '12px', marginTop: '2px' }}>
                                    {formatCategory(t.category)}
                                </p>
                            </div>

                            <p className="dash-muted dash-hide-mobile" style={{ fontSize: '12px', flexShrink: 0 }}>
                                {new Date(t.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                            </p>

                            <p style={{
                                color: t.amount < 0 ? '#10b981' : undefined,
                                fontSize: '14px', fontWeight: 600, flexShrink: 0, margin: 0
                            }} className={t.amount >= 0 ? 'dash-heading' : ''}>
                                {t.amount < 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
        </>
    )
}