'use client'

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react"
import { PlaidLinkOnSuccess, PlaidLinkOnSuccessMetadata, usePlaidLink } from "react-plaid-link";

type Provider = 'Plaid' | 'Basiq'

export default function ConnectBankButton() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<Provider | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const router = useRouter();

  async function connectPlaid() {
    setLoading('Plaid');
    setShowOptions(false);

    const response = await fetch('/api/banking/link?provider=Plaid');
    if (!response.ok) {
      console.error('Failed to get Plaid link token');
      setLoading(null);
      return;
    }

    const data = await response.json();
    setLinkToken(data.linkToken);
    setLoading(null);
  }

  const handlePlaidSuccess = useCallback<PlaidLinkOnSuccess>(
    async(publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      const institutionName = metadata.institution?.name ?? 'Unknown Bank';
      await fetch('/api/banking/exchange', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          provider: 'Plaid',
          token: publicToken,
          institutionName
        })
      });
      router.refresh();
    },
    [router]
  )

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: handlePlaidSuccess
  });

  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  async function connectBasiq() {
    setLoading('Basiq');
    setShowOptions(false);

    const res = await fetch('/api/banking/link?provider=Basiq');
    if (!res.ok) {
      console.error('Failed to get Basiq consent URL');
      setLoading(null);
      return;
    }

    const data = await res.json();
    sessionStorage.setItem('basiq_user_id', data.basiqUserId);

    window.location.href = data.consentUrl;
  }
  
    return(
      <div className="relative">
        <button
        onClick={() => setShowOptions(prev => !prev)}
        disabled={!!loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? `Connecting ${loading}...` : `+ Connect Bank Account`}
        </button>
          
        {showOptions && (
          <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-10 min-w-64">
            <button
              onClick={connectBasiq}
              className="w-full text-left px-5 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
              >
                <span className="text-xl">🇦🇺</span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium text-sm">Australian Bank</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">CommBank, ANZ, Westpac, NAB and more</p>
                  </div>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700" />
                <button
                  onClick={connectPlaid}
                  className="w-full text-left px-5 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3"
                >
                  <span className="text-xl">🌎</span>
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium text-sm">International Bank</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">US, UK, Canada and more via Plaid</p>
                    </div>
                </button>
              </div>
            )}
        </div>
      )
}