import TransactionSearch from "@/components/TransactionSearch";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Transaction } from '../../../types/Transaction'

async function getSubscription(accessToken: string) {
    const result = await fetch(`${process.env.API_URL}/api/user/subscription`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    });
    if (!result.ok) return null;
    return result.json();
}

async function getTransactions(accessToken: string, page: number) {
    const url = new URL(`${process.env.API_URL}/api/transactions`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('pageSize', '20');
    const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    })
    const text = await response.text()
    if (!response.ok || !text) return { transactions: [], total: 0, totalPages: 0 };
    return JSON.parse(text);
}

function formatCategory(category: string) {
    return category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const session = await auth0.getSession();
    if (!session) redirect('/auth/login');
    const { page: pageParam } = await searchParams;
    const page = parseInt(pageParam ?? '1');
    const { transactions, total, totalPages } = await getTransactions(session.tokenSet.accessToken!, page);
    const subscription = await getSubscription(session.tokenSet.accessToken!);
    const isPro = subscription?.tier === 'Pro';

    return (
        <>
        <style>{`
            .tx-card {
                background: #ffffff;
                border: 1px solid #f3f4f6;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .tx-heading { color: #111827; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.5; }
            .tx-hint { color: #9ca3af; font-size: 14px; margin-top: 4px; }
            .tx-th { background: #f9fafb; border-bottom: 1px solid #f3f4f6; }
            .tx-th th { color: #6b7280; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em; padding: 12px 20px; text-align: left; }
            .tx-row { border-bottom: 1px solid #f3f4f6; transition: background 0.15s; }
            .tx-row:last-child { border-bottom: none; }
            .tx-row:hover { background: #f9fafb; }
            .tx-cell { padding: 14px 20px; color: #111827; font-size: 14px; }
            .tx-cell-muted { color: #9ca3af; font-size: 13px; }
            .tx-badge { background: #eef2ff; color: #6366f1; font-size: 11px; padding: 3px 10px; border-radius: 999px; white-space: nowrap; font-weight: 500; }
            .tx-divider { border-bottom: 1px solid #f3f4f6; }
            .tx-mobile-row { padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
            .tx-mobile-row:not(:last-child) { border-bottom: 1px solid #f3f4f6; }
            .tx-page-btn {
                padding: 8px 16px;
                border-radius: 10px;
                border: 1px solid #e5e7eb;
                background: #ffffff;
                color: #374151;
                font-size: 13px;
                font-weight: 500;
                text-decoration: none;
                transition: background 0.15s;
            }
            .tx-page-btn:hover { background: #f9fafb; }
            .tx-page-btn.disabled { opacity: 0.4; pointer-events: none; }
            .tx-locked { background: #f9fafb; border-bottom: 1px solid #f3f4f6; padding: 20px; text-align: center; }
            .tx-locked-text { color: #6b7280; font-size: 14px; margin-bottom: 8px; }

            .dark .tx-card { background: #1f2937; border-color: rgba(55,65,81,0.5); box-shadow: none; }
            .dark .tx-heading { color: #f9fafb; }
            .dark .tx-hint { color: #6b7280; }
            .dark .tx-th { background: #111827; border-bottom-color: #374151; }
            .dark .tx-th th { color: #6b7280; }
            .dark .tx-row { border-bottom-color: #374151; }
            .dark .tx-row:hover { background: rgba(55,65,81,0.3); }
            .dark .tx-cell { color: #f9fafb; }
            .dark .tx-cell-muted { color: #6b7280; }
            .dark .tx-badge { background: rgba(99,102,241,0.15); color: #818cf8; }
            .dark .tx-divider { border-bottom-color: #374151; }
            .dark .tx-mobile-row:not(:last-child) { border-bottom-color: #374151; }
            .dark .tx-page-btn { background: #1f2937; border-color: #374151; color: #d1d5db; }
            .dark .tx-page-btn:hover { background: #374151; }
            .dark .tx-locked { background: #111827; border-bottom-color: #374151; }
            .dark .tx-locked-text { color: #6b7280; }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Header */}
            <div>
                <h1 className="tx-heading">Transactions</h1>
                <p className="tx-hint">{total} total transactions</p>
            </div>

            {/* Main Card */}
            <div className="tx-card">

                {/* Search */}
                {isPro ? (
                    <TransactionSearch />
                ) : (
                    <div className="tx-locked">
                        <p className="tx-locked-text">Semantic search is a Pro feature</p>
                        <a href="/settings" style={{ color: '#6366f1', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
                            Upgrade to Pro →
                        </a>
                    </div>
                )}

                {/* Mobile list */}
                <div className="sm:hidden">
                    {transactions.map((t: Transaction) => (
                        <div key={t.id} className="tx-mobile-row">
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p className="tx-cell" style={{ padding: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {t.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                    <span className="tx-badge">{formatCategory(t.category)}</span>
                                    <span className="tx-cell-muted" style={{ fontSize: '11px' }}>
                                        {new Date(t.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            </div>
                            <p style={{
                                color: t.amount < 0 ? '#10b981' : undefined,
                                fontSize: '14px', fontWeight: 600, flexShrink: 0
                            }} className={t.amount >= 0 ? 'tx-cell' : ''}>
                                {t.amount < 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <table className="hidden sm:table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead className="tx-th">
                        <tr>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t: Transaction) => (
                            <tr key={t.id} className="tx-row">
                                <td className="tx-cell" style={{ fontWeight: 500 }}>{t.description}</td>
                                <td className="tx-cell">
                                    <span className="tx-badge">{formatCategory(t.category)}</span>
                                </td>
                                <td className="tx-cell tx-cell-muted">
                                    {new Date(t.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="tx-cell" style={{
                                    textAlign: 'right', fontWeight: 600,
                                    color: t.amount < 0 ? '#10b981' : undefined
                                }}>
                                    {t.amount < 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={`/transactions?page=${page - 1}`}
                    className={`tx-page-btn ${page <= 1 ? 'disabled' : ''}`}>
                    ← Previous
                </a>
                <span className="tx-hint" style={{ fontSize: '13px' }}>
                    Page {page} of {totalPages}
                </span>
                <a href={`/transactions?page=${page + 1}`}
                    className={`tx-page-btn ${page >= totalPages ? 'disabled' : ''}`}>
                    Next →
                </a>
            </div>
        </div>
        </>
    )
}