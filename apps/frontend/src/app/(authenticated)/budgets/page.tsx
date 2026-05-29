import BudgetForm from '@/components/BudgetForm';
import { auth0 } from '@/lib/auth0';
import { Budget } from '../../../types/Budget'

async function getBudgets(accessToken: string): Promise<Budget[]> {
    const response = await fetch(`${process.env.API_URL}/api/budget`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    });
    return response.json();
}

function formatCategory(category: string) {
    return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getProgressColor(percentage: number) {
    if (percentage >= 100) return '#f87171'
    if (percentage >= 80) return '#fbbf24'
    return '#6366f1'
}

function getPercentageColor(percentage: number) {
    if (percentage >= 100) return '#f87171'
    if (percentage >= 80) return '#fbbf24'
    return '#6366f1'
}

export default async function BudgetPage() {
    const session = await auth0.getSession();
    const budgets = await getBudgets(session!.tokenSet.accessToken);

    return (
        <>
        <style>{`
            .b-card {
                background: #ffffff;
                border: 1px solid #f3f4f6;
                border-radius: 16px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .b-heading { color: #111827; font-size: 15px; font-weight: 600; margin: 0; line-height: 1.3; }
            .b-label { color: #6b7280; font-size: 12px; margin-top: 2px; }
            .b-hint { color: #9ca3af; font-size: 13px; }
            .b-progress-track { background: #f3f4f6; border-radius: 999px; height: 6px; overflow: hidden; }

            .dark .b-card { background: #1f2937; border-color: rgba(55,65,81,0.5); box-shadow: none; }
            .dark .b-heading { color: #f9fafb; }
            .dark .b-label { color: #6b7280; }
            .dark .b-hint { color: #6b7280; }
            .dark .b-progress-track { background: #374151; }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Header */}
            <div>
                <h1 className="b-heading" style={{ fontFamily: "'DM-Sans', sans-serif", fontSize: '24px', lineHeight:'1.3', paddingBottom: '2px' }}>Budgets</h1>
                <p className="b-hint" style={{ marginTop: '4px', fontSize: '14px' }}>Track your monthly spending limits</p>
            </div>

            {/* Budget List */}
            {budgets.length === 0 ? (
                <div className="b-card" style={{ padding: '48px 24px', textAlign: 'center', borderStyle: 'dashed' }}>
                    <p style={{ fontSize: '32px', marginBottom: '12px' }}>📊</p>
                    <p className="b-heading" style={{ marginBottom: '4px' }}>No budgets yet</p>
                    <p className="b-hint">Create your first budget below</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {budgets.map((budget) => (
                        <div key={budget.category} className="b-card" style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                                <div>
                                    <p className="b-heading" style={{ fontSize: '14px' }}>
                                        {formatCategory(budget.category)}
                                    </p>
                                    <p className="b-label">
                                        ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                                    </p>
                                </div>
                                <span style={{
                                    color: getPercentageColor(budget.percentage),
                                    fontSize: '13px', fontWeight: 600, flexShrink: 0
                                }}>
                                    {budget.percentage.toFixed(1)}%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="b-progress-track">
                                <div style={{
                                    height: '100%',
                                    borderRadius: '999px',
                                    background: getProgressColor(budget.percentage),
                                    width: `${Math.min(budget.percentage, 100)}%`,
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>

                            {/* Over budget warning */}
                            {budget.percentage >= 100 && (
                                <p style={{ color: '#f87171', fontSize: '11px', marginTop: '8px' }}>
                                    ⚠️ Over budget by ${(budget.spent - budget.limit).toFixed(2)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Form */}
            <BudgetForm />
        </div>
        </>
    )
}