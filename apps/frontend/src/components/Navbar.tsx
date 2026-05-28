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
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pt-[env(safe-area-inset-top)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">

                {/* Top bar */}
                <div className="flex items-center justify-between h-16">
                    <Link href="/dashboard" className="text-xl font-bold text-blue-600 shrink-0">
                        FinanceAI
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    pathName === link.href
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop right */}
                    <div className="hidden md:flex items-center gap-3">
                        {isPro && (
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                PRO
                            </span>
                        )}
                        {userName && (
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-300">{userName}</p>
                        )}
                        <button onClick={toggle} aria-label="Toggle dark mode"
                            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <a href="/logout" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            Logout
                        </a>
                    </div>

                    {/* Mobile right */}
                    <div className="flex md:hidden items-center gap-3">
                        {isPro && (
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                PRO
                            </span>
                        )}
                        <button onClick={toggle} aria-label="Toggle dark mode"
                            className="text-gray-500 dark:text-gray-400">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <button onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu"
                            className="text-gray-600 dark:text-gray-300 p-1">
                            {menuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 space-y-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                pathName === link.href
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        {userName && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{userName}</p>
                        )}
                        <a href="/logout" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400">
                            Logout
                        </a>
                    </div>
                </div>
            )}
        </nav>
    )
}
