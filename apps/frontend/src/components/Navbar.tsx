'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "./ThemeProvider"

const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions'},
    { href: '/insights', label: 'AI Insights' },
    { href: '/budgets', label: 'Budgets' },
    { href: '/chat', label: 'AI Chat' },
    { href: '/settings', label: 'Settings' }
]

export default function Navbar({
    isPro,
    userName
} : {
    isPro: boolean
    userName?: string
}) {
    const pathName = usePathname();
    const { theme, toggle } = useTheme();

    return(
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                        FinanceAI
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {navLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pathName === link.href
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                            }`}
                        >
                            {link.label}
                        </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {isPro && (
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs fonr-bold px-3 py-1 rounded-full">
                                PRO
                            </span>
                        )}
                    </div>

                    <div className="text-right dark:text-gray-300">
                        {userName && (
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-300">{userName}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggle}
                            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            aria-label="Toggle dark mode"
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <a href="/logout"
                            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    )
}
