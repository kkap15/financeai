'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CategoryData {
    category: string;
    total: number;
    count: number;
}

function toTitleCase(str: string) {
    return str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function CategoryChart({ data } : { data : CategoryData[] }) {
    const chartData = data.map(d => ({
        name: toTitleCase(d.category),
        amount: parseFloat(d.total.toFixed(2))
    }));

    const max = Math.max(...data.map(d => d.total), 1);

    return (
        <>
            {/* Mobile: category list with relative bars */}
            <div className="sm:hidden space-y-3">
                {data
                    .slice()
                    .sort((a, b) => b.total - a.total)
                    .map(d => (
                        <div key={d.category}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-800 dark:text-white truncate mr-3">
                                    {toTitleCase(d.category)}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                    ${d.total.toFixed(2)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${(d.total / max) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{d.count} transaction{d.count !== 1 ? 's' : ''}</p>
                        </div>
                    ))}
            </div>

            {/* Desktop: bar chart */}
            <div className="hidden sm:block">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            angle={-35}
                            textAnchor="end"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tickFormatter={(v) => `$${v}`}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value: number) => [`$${value}`, 'Spent']}
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    )
}