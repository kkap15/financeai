import Link from "next/link";

export default function ProGate() {
    return (
        <>
        <style>{`
            .pg-wrap {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 60vh;
                padding: 24px;
            }
            .pg-card {
                background: #ffffff;
                border: 1px solid #f3f4f6;
                border-radius: 20px;
                padding: 48px 40px;
                text-align: center;
                max-width: 420px;
                width: 100%;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            }
            .pg-title { color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 8px; }
            .pg-desc { color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
            .pg-btn {
                display: inline-block;
                background: linear-gradient(135deg, #6366f1, #a855f7);
                color: white;
                font-size: 14px;
                font-weight: 600;
                padding: 12px 32px;
                border-radius: 999px;
                text-decoration: none;
                transition: opacity 0.15s;
            }
            .pg-btn:hover { opacity: 0.9; }

            .dark .pg-card { background: #1f2937; border-color: rgba(55,65,81,0.5); box-shadow: none; }
            .dark .pg-title { color: #f9fafb; }
            .dark .pg-desc { color: #6b7280; }

            @media (max-width: 640px) {
                .pg-card { padding: 36px 24px; }
                .pg-btn { width: 100%; text-align: center; }
            }
        `}</style>

        <div className="pg-wrap">
            <div className="pg-card">
                <div style={{ fontSize: '44px', marginBottom: '16px' }}>🔒</div>
                <h2 className="pg-title">Pro Feature</h2>
                <p className="pg-desc">
                    Upgrade to Pro to unlock AI Insights, Agentic Chat, and Semantic Search.
                </p>
                <Link href="/settings" className="pg-btn">
                    Upgrade to Pro
                </Link>
            </div>
        </div>
        </>
    )
}