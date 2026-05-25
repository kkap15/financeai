'use client'

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react"
import { PlaidLinkOnSuccess, PlaidLinkOnSuccessMetadata, usePlaidLink } from "react-plaid-link";


export default function ConnectBankButton() {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    async function fetchLinkToken() {
        setLoading(true);
        const res = await fetch('/api/plaid/link-token', {method: 'POST'});
        const data = await res.json();
        if (!res.ok) {
            const text = await res.text();
            console.error('.NET API Error', text);
        }
        setLinkToken(data.linkToken);
        setLoading(false);
    }
    
    const handleSuccess = useCallback<PlaidLinkOnSuccess>(
        async(publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
            const institutionName = metadata.institution?.name ?? 'Unknown Bank';
            console.log(institutionName);
            await fetch('/api/plaid/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ publicToken, institutionName })
            });
            
            router.refresh()
        },
        [router]
    )
    
    const { open, ready } = usePlaidLink({
        token: linkToken ?? '',
        onSuccess: handleSuccess
    });
    
    useEffect(() => {
        if (linkToken && ready) {
            open();
        }
    }, [linkToken, ready, open]);
    
    
    return(
        <button
        onClick={fetchLinkToken}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
            {loading ? 'Loading...' : '+ Connect Bank Account'}
        </button>
    )
}