import BudgetForm from '@/components/BudgetForm';
import { auth0 } from '@/lib/auth0';
import {Budget} from '../../../types/Budget'

async function getBudgets(accessToken: string): Promise<Budget[]> {
    const response = await fetch(`${process.env.API_URL}/api/budget`, {
    headers: {Authorization: `Bearer ${accessToken}`},
        cache: 'no-store'
    });

    var data = await response.json();

    return data;
}

export default async function BudgetPage() {
    const session = await auth0.getSession();
    const budgets = await getBudgets(session!.tokenSet.accessToken);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold dark:text-gray-300">Budgets</h1>
                    <p className="text-gray-500 dark:text-gray-500">Track your monthly spending limits</p>
                </div>
            </div>

            {budgets.length === 0 ? (
                <div className="dark:bg-gray-800 bg-white rounded-xl shadow p-12 text-center mb-8">
                    <p className="text-gray-500 dark:text-white">No budgets set yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Create your first budget below
                    </p>
                </div>
            ) : (
                <ul className="space-y-4 mb-8">
                    {budgets.map((budget) => (
                        <li key={budget.category} className="bg-white rounded-xl shadow p-6 dark:bg-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {budget.category.replace(/_/g, ' ')}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-white">
                                    ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                                </span>
                                <span className={`text-sm font-semibold ${
                                    budget.percentage >= 100 ? 'text-red-500' :
                                    budget.percentage >= 80 ? 'text-yellow-500' :
                                    'text-blue-500'
                                }`}>
                                    {budget.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                className={`h-2 rounded-full ${
                                    budget.percentage >= 100 ? 'bg-red-500' :
                                    budget.percentage >= 80 ? 'bg-yellow-500' :
                                    'bg-blue-500'}`}
                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }} 
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <BudgetForm />
        </div>
    )
}