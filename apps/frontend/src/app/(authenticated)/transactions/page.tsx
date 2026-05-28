import TransactionSearch from "@/components/TransactionSearch";
import { auth0 } from "@/lib/auth0";
import { Transaction } from '../../../types/Transaction'

async function getSubscription(accessToken: string) {
    const result = await fetch(`${process.env.API_URL}/api/user/subscription`, {
        headers: {Authorization: `Bearer ${accessToken}`},
        cache: 'no-store'
    });

    if (!result.ok) return null;

    return result.json();
}

async function getTransactions(accessToken: string, page: number) {
    const url = new URL(`${process.env.API_URL}/api/transactions`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('pageSize', '20');
    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            cache: 'no-store'
        }
    })

    const text = await response.text()

    if (!response.ok || !text) {
        return { transactions: [], total: 0, totalPages: 0 };
    }

    return JSON.parse(text);
}

export default async function TransactionsPage({
    searchParams,
} : {
    searchParams: Promise<{ page?: string }>
}) {
    const session = await auth0.getSession();
    const { page: pageParam } = await searchParams;
    const page = parseInt(pageParam ?? '1');
    const { transactions, total, totalPages } = await getTransactions(session!.tokenSet.accessToken!, page);
    const subscription = await getSubscription(session.tokenSet.accessToken!);
    const isPro = subscription?.tier === 'Pro';

    return (
        <main className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">Transactions</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{total} total transactions</p>

            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">

                {isPro ? (
                    <TransactionSearch />
                ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
                        <p className="text-gray-400 mb-3">Semantic search is a Pro feature.</p>
                        <a href="/settings" className="text-blue-400 hover:underline font-medium">
                            Upgrade to Pro
                        </a>
                    </div>
                )}
            

                {/* Mobile card list */}
                <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {transactions.map((t: Transaction) => (
                        <div key={t.id} className="flex items-center justify-between px-4 py-3">
                            <div className="min-w-0 flex-1 mr-3">
                                <p className="font-medium dark:text-white truncate">{t.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {t.category.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(t.date).toLocaleDateString('en-AU')}
                                    </span>
                                </div>
                            </div>
                            <p className={`font-medium whitespace-nowrap ${t.amount < 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                                {t.amount < 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <table className="hidden sm:table w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
                            <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                            <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {transactions.map((t: Transaction) => (
                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="p-4 font-medium dark:text-white">{t.description}</td>
                                <td className="p-4">
                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                        {t.category.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                                    {new Date(t.date).toLocaleDateString('en-AU')}
                                </td>
                                <td className={`p-4 text-right font-medium whitespace-nowrap ${
                                    t.amount < 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                                }`}>
                                    {t.amount < 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-6">
                <a href={`/transactions?page=${page - 1}`}
                className={`px-4 py-2 rounded-lg border dark:border-gray-600 dark:text-gray-300 ${
                    page <= 1
                        ? 'opacity-50 pointer-events-none'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                >
                    ← Previous
                </a>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                    <a href={`/transactions?page=${page + 1}`}
                    className={`px-4 py-2 rounded-lg border dark:border-gray-600 dark:text-gray-300 ${
                        page >= totalPages
                            ? 'opacity-50 pointer-events-none'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    >
                        Next →
                    </a>
                </span>
            </div>
        </main>
    )
}
