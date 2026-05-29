'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useTheme } from "./ThemeProvider"

const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/insights', label: 'AI Insights' },
    { href: '/budgets', label: 'Budgets' },
    { href: '/chat', label: 'AI Chat' },
    { href: '/settings', label: 'Settings' },
]

export default function Navbar({ isPro, userName }: { isPro: boolean; userName?: string }) {
    const pathName = usePathname()
    const { theme, toggle } = useTheme()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <>
        <style>{`
            .nav-root {
                background: #ffffff;
                border-bottom: 1px solid #f3f4f6;
                padding-top: env(safe-area-inset-top);
                position: sticky;
                top: 0;
                z-index: 50;
            }
            .nav-logo {
                font-size: 1.1rem;
                font-weight: 700;
                color: #6366f1;
                text-decoration: none;
                letter-spacing: -0.02em;
                font-family: 'DM Sans', sans-serif;
                flex-shrink: 0;
            }
            .nav-link {
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                text-decoration: none;
                color: #6b7280;
                transition: color 0.15s, background 0.15s;
                white-space: nowrap;
            }
            .nav-link:hover { color: #111827; background: #f9fafb; }
            .nav-link.active { color: #6366f1; background: #eef2ff; }
            .nav-pro {
                background: linear-gradient(135deg, #6366f1, #a855f7);
                color: white;
                font-size: 11px;
                font-weight: 700;
                padding: 3px 10px;
                border-radius: 999px;
                letter-spacing: 0.04em;
            }
            .nav-username { font-size: 13px; font-weight: 500; color: #374151; }
            .nav-action {
                font-size: 13px;
                color: #9ca3af;
                text-decoration: none;
                background: none;
                border: none;
                cursor: pointer;
                transition: color 0.15s;
                font-family: 'DM Sans', sans-serif;
                padding: 0;
            }
            .nav-action:hover { color: #374151; }
            .nav-mobile-menu {
                border-top: 1px solid #f3f4f6;
                background: #ffffff;
                padding: 12px 16px;
            }
            .nav-mobile-link {
                display: block;
                padding: 10px 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                text-decoration: none;
                color: #6b7280;
                transition: color 0.15s, background 0.15s;
            }
            .nav-mobile-link:hover { color: #111827; background: #f9fafb; }
            .nav-mobile-link.active { color: #6366f1; background: #eef2ff; }
            .nav-mobile-footer {
                margin-top: 8px;
                padding-top: 12px;
                border-top: 1px solid #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .dark .nav-root { background: #111827; border-bottom-color: #1f2937; }
            .dark .nav-logo { color: #818cf8; }
            .dark .nav-link { color: #9ca3af; }
            .dark .nav-link:hover { color: #f9fafb; background: #1f2937; }
            .dark .nav-link.active { color: #818cf8; background: rgba(99,102,241,0.15); }
            .dark .nav-username { color: #d1d5db; }
            .dark .nav-action { color: #6b7280; }
            .dark .nav-action:hover { color: #d1d5db; }
            .dark .nav-mobile-menu { background: #111827; border-top-color: #1f2937; }
            .dark .nav-mobile-link { color: #9ca3af; }
            .dark .nav-mobile-link:hover { color: #f9fafb; background: #1f2937; }
            .dark .nav-mobile-link.active { color: #818cf8; background: rgba(99,102,241,0.15); }
            .dark .nav-mobile-footer { border-top-color: #1f2937; }
        `}</style>

        <nav className="nav-root">
            <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 max(1rem, env(safe-area-inset-left)) 0 max(1rem, env(safe-area-inset-right))' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

                    {/* Logo */}
                    <Link href="/dashboard" className="nav-logo">FinanceAI</Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2px' }}>
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${pathName === link.href ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop right */}
                    <div className="hidden md:flex" style={{ alignItems: 'center', gap: '12px' }}>
                        {isPro && <span className="nav-pro">PRO</span>}
                        {userName && <p className="nav-username">{userName}</p>}
                        <button onClick={toggle} className="nav-action" aria-label="Toggle theme">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <a href="/auth/logout" className="nav-action">Logout</a>
                    </div>

                    {/* Mobile right */}
                    <div className="flex md:hidden" style={{ alignItems: 'center', gap: '10px' }}>
                        {isPro && <span className="nav-pro">PRO</span>}
                        <button onClick={toggle} className="nav-action" aria-label="Toggle theme">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label="Toggle menu"
                            className="nav-action"
                            style={{ padding: '4px' }}
                        >
                            {menuOpen ? (
                                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden nav-mobile-menu">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`nav-mobile-link ${pathName === link.href ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="nav-mobile-footer">
                        {userName && <p className="nav-username" style={{ fontSize: '13px' }}>{userName}</p>}
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={toggle} className="nav-action" aria-label="Toggle theme">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            <a href="/auth/logout" className="nav-action">Logout</a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
        </>
    )
}