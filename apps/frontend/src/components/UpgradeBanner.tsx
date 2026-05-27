'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UpgradeBanner() {
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/dashboard')
        }, 5000)
        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
                <p className="font-semibold text-green-500">Welcome to Pro!</p>
                <p className="text-green-600 dark:text-green-400 text-sm">
                    You now have access to all Pro features.
                </p>
            </div>
        </div>
    )
}
