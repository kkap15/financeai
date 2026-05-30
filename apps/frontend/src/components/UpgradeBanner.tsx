'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UpgradeBanner() {
    const router = useRouter()

    useEffect(() => {
        let attempts = 0
        const maxAttempts = 12

        const poll = setInterval(async () => {
            attempts++
            try {
                const res = await fetch('/api/user/subscription')
                if (res.ok) {
                    const data = await res.json()
                    if (data.tier === 'Pro') {
                        clearInterval(poll)
                        router.refresh()
                        router.replace('/dashboard')
                        return
                    }
                }
            } catch {}

            if (attempts >= maxAttempts) {
                clearInterval(poll)
                router.replace('/dashboard')
            }
        }, 2500)

        return () => clearInterval(poll)
    }, [router])

    return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
                <p className="font-semibold text-green-500">Welcome to Pro!</p>
                <p className="text-green-600 dark:text-green-400 text-sm">
                    Activating your subscription…
                </p>
            </div>
        </div>
    )
}
