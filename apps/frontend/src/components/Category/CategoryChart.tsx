'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CategoryData {
    category: string;
    total: number;
    count: number;
}

export default function CategoryChart({ data } : { data : CategoryData[] }) {
    const chartData = data.map(d => ({
        name: d.category.replace(/_/g, ' '),
        amount: parseFloat(d.total.toFixed(2))
    }));
    
    return(
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top:5, right: 20, left: 20, bottom:60 }}>
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
                    formatter={(value) => [`$${value}`, 'Spent']}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                    labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[ 4, 4, 0, 0 ]} />
            </BarChart>
        </ResponsiveContainer>
    )
}