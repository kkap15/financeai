import CategoryChart from "@/components/Category/CategoryChart";
import ConnectBankButton from "@/components/ConnectBankButton";
import { auth0 } from "@/lib/auth0";
import { Transaction } from "@org/shared-types"

async function getSummary(accessToken: string) {
    const res = await fetch('http://localhost:5154/api/transactions/summary', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const text = await res.text();
    if (!res.ok || !text) return null;

    return JSON.parse(text);
}

async function getRecentTransactions(accessToken:string) {
    const url = new URL('http://localhost:5154/api/transactions')
    url.searchParams.set('page', '1')
    url.searchParams.set('pageSize', '5')

    const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    })

    const text = await res.text()
    if (!res.ok || !text) return []

    return JSON.parse(text).transactions
}

export default async function DashboardPage({
  searchParams,
} : {
  searchParams: Promise<{upgraded?: string}>
}) {
    const session = await auth0.getSession();
    const { upgraded } = await searchParams;

    const [summary, recentTransactions] = await Promise.all([
        getSummary(session!.tokenSet.accessToken!),
        getRecentTransactions(session!.tokenSet.accessToken!)
    ]);

    return(
        <div>
          {upgraded === 'true' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-500">Welcome to Pro!</p>
              <p className="text-green-600 dark:text-green-400 text-sm">
                You now have access to all Pro features.
              </p>
            </div>
          </div>
          )}
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
                  <p className="text-gray-500 dark:text-gray-400">Your spending this month</p>
              </div>
              <ConnectBankButton />
          </div>

          {summary ? (
              <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Spent</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              ${summary.totalSpent.toFixed(2)}
                          </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Total Income</p>
                          <p className="text-3xl font-bold text-green-600">
                              ${Math.abs(summary.totalIncome).toFixed(2)}
                          </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Categories</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {summary.byCategory.length}
                          </p>
                      </div>
                  </div>

              {/* Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
                      <h2 className="text-xl font-semibold mb-6 dark:text-white">Spending by Category</h2>
                      <CategoryChart data={summary.byCategory} />
                  </div>
              </>
    ) : (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center mb-8">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No transactions yet</p>
        <ConnectBankButton />
      </div>
    )}

    {/* Recent Transactions */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold dark:text-white">Recent Transactions</h2>
        <a href="/transactions" className="text-blue-500 text-sm hover:underline">
          View all →
        </a>
      </div>
      <table className="w-full">
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentTransactions.map((t: Transaction) => (
            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-4 font-medium dark:text-white">{t.description}</td>
              <td className="p-4">
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
                  {t.category.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                {new Date(t.date).toLocaleDateString('en-AU')}
              </td>
              <td className={`p-4 text-right font-medium ${
                t.amount < 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'
              }`}>
                {t.amount < 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  )
}
