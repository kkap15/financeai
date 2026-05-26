'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"

const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions'},
    { href: '/insights', label: 'AI Insights' },
    { href: '/budgets', label: 'Budgets' },
    { href: '/chat', label: 'AI Chat' }
]

export default function Navbar() {
    const pathName = usePathname();

    return(
        <nav className="bg-white border-b border-gray-200">
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
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {link.label}
                        </Link>
                        ))}
                    </div>

                    {/* Logout */}

                    <a href="/logout"
                        className="text-sm text-gray-500 hover:text-gray-900"
                    >
                        Logout
                    </a>
                </div>
            </div>
        </nav>
    )
}
