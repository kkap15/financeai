'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BudgetForm() {
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([])
    const router = useRouter();

    async function handleSubmit() {
        if (!category || !limit) return;
        
        setLoading(true);

        await fetch('/api/budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({category, limit: parseFloat(limit)})
        });

        setLoading(false);
        setCategory('');
        setLimit('');
        router.refresh();
    }

    useEffect(() => {
        fetch('/api/transactions/categories')
            .then(r => r.json())
            .then(setCategories);
    }, [])

    return (
        <div className="bg-white rounded-xl shadow p-6 dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Set a Budget</h2>
    
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-white">Category</label>
                    <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="dark:bg-gray-800 dark:text-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a category</option>
                        {categories.map(c => (
                            <option key={c} value={c}>
                                {c.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-white">Monthly Limit ($)</label>
                    <input 
                    type="number"
                    value={limit}
                    onChange={e => setLimit(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder:bg-gray-700"
                    placeholder="e.g. 100"
                    />
                </div>


                <button
                onClick={handleSubmit}
                disabled={loading || !category || !limit}
                className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50"
                >
                    { loading ? 'Saving...' : 'Save Budget' }
                </button>
            </div>
        </div>
    )
}