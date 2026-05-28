import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth0.getSession()
  if (session) redirect('/dashboard')

  return (
    <main style={{ background: '#080C14', minHeight: '100vh', color: '#F0F4FF', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #080C14; --bg2: #0D1320; --bg3: #111827;
          --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
          --text: #F0F4FF; --muted: #7A8AA0;
          --accent: #3B82F6; --accent2: #8B5CF6; --green: #10B981;
        }
        .logo { font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 700; background: linear-gradient(135deg, #3B82F6, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        nav { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 3rem; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: rgba(8,12,20,0.85); backdrop-filter: blur(12px); z-index: 100; }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a { color: var(--muted); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .nav-links a:hover { color: var(--text); }
        .nav-cta { background: var(--accent); color: white !important; padding: 0.5rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; }
        .hero { text-align: center; padding: 7rem 2rem 5rem; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 500px; background: radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 40%, transparent 70%); pointer-events: none; }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: #93C5FD; font-size: 0.8rem; font-weight: 500; padding: 0.35rem 0.9rem; border-radius: 100px; margin-bottom: 1.75rem; }
        .badge-dot { width: 6px; height: 6px; background: #3B82F6; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        h1 { font-family: 'Syne', sans-serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 1.5rem; max-width: 800px; margin-left: auto; margin-right: auto; }
        h1 span { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-sub { color: var(--muted); font-size: 1.125rem; max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.7; }
        .hero-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 0.75rem 2rem; border-radius: 10px; font-size: 0.95rem; font-weight: 500; text-decoration: none; transition: opacity 0.2s, transform 0.2s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary { background: transparent; color: var(--text); padding: 0.75rem 2rem; border-radius: 10px; font-size: 0.95rem; text-decoration: none; border: 1px solid var(--border2); transition: border-color 0.2s, background 0.2s; }
        .btn-secondary:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.04); }
        .stats { display: flex; justify-content: center; gap: 3rem; padding: 2rem 2rem 4rem; flex-wrap: wrap; }
        .stat-num { font-family: 'Syne', sans-serif; font-size: 1.75rem; font-weight: 700; background: linear-gradient(135deg, #3B82F6, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stat-label { font-size: 0.8rem; color: var(--muted); margin-top: 2px; text-align: center; }
        .section { padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }
        .section-label { text-align: center; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.75rem; }
        .section-title { font-family: 'Syne', sans-serif; font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 700; text-align: center; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
        .section-sub { text-align: center; color: var(--muted); font-size: 1rem; max-width: 500px; margin: 0 auto 3.5rem; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .feature-card { background: var(--bg2); padding: 2rem; transition: background 0.2s; }
        .feature-card:hover { background: var(--bg3); }
        .feature-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 1rem; }
        .icon-blue { background: rgba(59,130,246,0.12); } .icon-purple { background: rgba(139,92,246,0.12); } .icon-green { background: rgba(16,185,129,0.12); } .icon-pink { background: rgba(236,72,153,0.12); } .icon-amber { background: rgba(245,158,11,0.12); } .icon-teal { background: rgba(20,184,166,0.12); }
        .feature-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; }
        .feature-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.6; }
        .pricing-section { padding: 5rem 2rem; max-width: 900px; margin: 0 auto; }
        .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 3.5rem; }
        @media (max-width: 640px) {
          .pricing-grid { grid-template-columns: 1fr; }
          nav { padding: 1rem 1.5rem; }
          .nav-links a:not(.nav-cta) { display: none; }
          .stats { gap: 1.5rem; }
          footer { padding: 2rem 1.5rem; }
        }
        .pricing-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; position: relative; }
        .pricing-card.featured { border-color: rgba(59,130,246,0.4); background: linear-gradient(180deg, rgba(59,130,246,0.05) 0%, var(--bg2) 100%); }
        .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; font-size: 0.7rem; font-weight: 600; padding: 0.3rem 0.9rem; border-radius: 100px; letter-spacing: 0.05em; white-space: nowrap; }
        .plan-name { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 600; color: var(--muted); margin-bottom: 0.75rem; }
        .plan-price { font-family: 'Syne', sans-serif; font-size: 2.5rem; font-weight: 800; margin-bottom: 0.25rem; letter-spacing: -0.03em; }
        .plan-period { font-size: 0.8rem; color: var(--muted); margin-bottom: 1.5rem; }
        .plan-divider { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
        .plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.75rem; }
        .plan-features li { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: var(--muted); }
        .plan-features li.included { color: var(--text); }
        .check { color: var(--green); } .cross { color: #4B5563; }
        .plan-btn { display: block; text-align: center; padding: 0.75rem; border-radius: 10px; font-size: 0.9rem; font-weight: 500; text-decoration: none; transition: all 0.2s; }
        .plan-btn-free { border: 1px solid var(--border2); color: var(--text); }
        .plan-btn-free:hover { background: rgba(255,255,255,0.05); }
        .plan-btn-pro { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; }
        .plan-btn-pro:hover { opacity: 0.9; }
        footer { border-top: 1px solid var(--border); padding: 2rem 3rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .footer-text { font-size: 0.8rem; color: var(--muted); }
        .footer-text a { color: var(--muted); }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="logo">FinanceAI</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="https://github.com/kkap15/financeai" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="/auth/login" className="nav-cta">Get started</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="badge">
          <div className="badge-dot"></div>
          Now live in production
        </div>
        <h1>Your finances,<br /><span>understood by AI</span></h1>
        <p className="hero-sub">Connect your bank, get AI-powered insights, chat with an agentic assistant that knows your spending — all in one place.</p>
        <div className="hero-actions">
          <a href="/auth/login" className="btn-primary">Get started free →</a>
          <a href="https://github.com/kkap15/financeai" target="_blank" rel="noopener noreferrer" className="btn-secondary">View on GitHub</a>
        </div>
      </section>

      {/* STATS */}
      <div className="stats">
        {[
          { num: '6', label: 'AI Finance Tools' },
          { num: 'pgvector', label: 'Semantic Search' },
          { num: 'Real-time', label: 'Streaming Insights' },
          { num: 'Plaid', label: 'Bank Integration' },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="section" id="features">
        <p className="section-label">Features</p>
        <h2 className="section-title">Everything your finances need</h2>
        <p className="section-sub">Built with Next.js, .NET 10, and Azure OpenAI — deployed to production on Vercel and Azure.</p>
        <div className="features-grid">
          {[
            { icon: '🏦', cls: 'icon-blue', title: 'Bank Integration', desc: 'Connect your real bank account via Plaid. Transactions sync automatically with category enrichment and merchant names.' },
            { icon: '🤖', cls: 'icon-purple', title: 'Agentic Finance Chat', desc: 'Chat with an AI assistant powered by Semantic Kernel. It can query your spending, compare months, and manage budgets autonomously.' },
            { icon: '✨', cls: 'icon-green', title: 'AI Spending Insights', desc: 'Get personalised analysis of your last 30 days streamed token-by-token. Actionable recommendations, not generic advice.' },
            { icon: '🔍', cls: 'icon-teal', title: 'Semantic Search', desc: 'Search transactions in plain English. Powered by pgvector and Azure OpenAI embeddings — finds what you mean, not just what you type.' },
            { icon: '📊', cls: 'icon-amber', title: 'Budget Tracking', desc: 'Set monthly budgets per category. Progress bars update in real time as your transactions sync from your bank.' },
            { icon: '🔒', cls: 'icon-pink', title: 'Secure by Default', desc: 'Auth0 authentication, JWT-secured API, PKCE flow, and inactivity logout with multi-tab sync via BroadcastChannel.' },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <p className="section-label">Pricing</p>
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p className="section-sub">Start free. Upgrade when you need the AI features.</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="plan-name">Free</div>
            <div className="plan-price">$0</div>
            <div className="plan-period">forever</div>
            <hr className="plan-divider" />
            <ul className="plan-features">
              <li className="included"><span className="check">✓</span> Bank account connection</li>
              <li className="included"><span className="check">✓</span> Transaction sync</li>
              <li className="included"><span className="check">✓</span> Spending dashboard</li>
              <li className="included"><span className="check">✓</span> Budget tracking</li>
              <li><span className="cross">✕</span> AI spending insights</li>
              <li><span className="cross">✕</span> Agentic finance chat</li>
              <li><span className="cross">✕</span> Semantic search</li>
            </ul>
            <a href="/auth/login" className="plan-btn plan-btn-free">Get started free</a>
          </div>
          <div className="pricing-card featured">
            <div className="popular-badge">MOST POPULAR</div>
            <div className="plan-name">Pro</div>
            <div className="plan-price">$10</div>
            <div className="plan-period">per month, cancel anytime</div>
            <hr className="plan-divider" />
            <ul className="plan-features">
              <li className="included"><span className="check">✓</span> Everything in Free</li>
              <li className="included"><span className="check">✓</span> AI spending insights</li>
              <li className="included"><span className="check">✓</span> Agentic finance chat</li>
              <li className="included"><span className="check">✓</span> Semantic transaction search</li>
              <li className="included"><span className="check">✓</span> Priority support</li>
            </ul>
            <a href="/auth/login" className="plan-btn plan-btn-pro">Upgrade to Pro →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="logo">FinanceAI</div>
        <div className="footer-text">
          Built by Kanishka Kapoor ·{' '}
          <a href="https://github.com/kkap15/financeai" target="_blank" rel="noopener noreferrer">
            github.com/kkap15/financeai
          </a>
        </div>
      </footer>
    </main>
  )
}