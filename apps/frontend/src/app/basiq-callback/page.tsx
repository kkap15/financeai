'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BasiqCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Connecting your bank...');

    useEffect(() => {
        async function handleCallback() {
            const jobId = searchParams.get('jobId');
            if (!jobId) {
                router.push('/dashboard');
                return;
            }

            setStatus('Syncing your transactions...');

            const institutionName = sessionStorage.getItem('basiq_institution') ?? 'Australian Bank';
            sessionStorage.removeItem('basiq_instruction');

            const res = await fetch('/api/banking/exchange', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    provider: 'Basiq',
                    token: jobId,
                    institutionName
                })
            });

            if (!res.ok) {
                setStatus('Something went wrong. Redirecting...');
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setStatus('Bank connected successfully');
                setTimeout(() => router.push("/dashboard"), 1500);
            }
        }
        handleCallback();
    }, [router, searchParams])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="text-center">
                <div className="animate-spin text-4xl mb-4">⌛️</div>
                <p className="text-white text-lg">{status}</p>
            </div>
        </div>
    )
}