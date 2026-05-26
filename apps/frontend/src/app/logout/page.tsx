'use client'

import { useEffect } from "react";

export default function LogoutPage() {
    useEffect(() => {
        localStorage.removeItem('financeai_last_activity');

        window.location.href = '/auth/logout';
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-gray-500">Logging out...</p>
        </div>
    )
}