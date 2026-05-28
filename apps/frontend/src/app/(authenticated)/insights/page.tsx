'use client'

import ProGate from "@/components/ProGate";
import { auth0 } from "@/lib/auth0";
import { useState } from "react"
import ReactMarkdown from "react-markdown";

async function getSubscription(accessToken: string) {
    const result = await fetch(`${process.env.API_URL}/api/user/subscription`, {
        headers: {Authorization: `Bearer ${accessToken}`},
        cache: 'no-store'
    });

    if (!result.ok) return null;

    return result.json();
}

export default async function InsightsPage() {
    const session = await auth0.getSession();
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const subscription = await getSubscription(session.tokenSet.accessToken!);
    const isPro = subscription?.tier === 'Pro';

    if (!isPro) return <ProGate />
    
    async function getInsights() {
        setLoading(true);
        setInsight('');
        setDone(false);

        const response = await fetch('/api/ai/insights');
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done: streamDone, value } = await reader.read();
            if (streamDone) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        setDone(true);
                        break;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        setInsight(prev => prev + parsed.text)
                    } catch {

                    }
                }
            }
        }

        setLoading(false);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">AI Insights</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Personalized analysis of your spending
                    </p>
                </div>
            <button
            onClick={getInsights}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? (
                    <>
                        <span className="animate-spin">⟳</span>
                        Analyzing...
                    </>
                ) : (
                    '✨ Get AI Insights'
                )}
            </button>
        </div>

        {insight ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
                <div className="prose prose-blue dark:prose-invert max-w-none">
                    <ReactMarkdown>{insight}</ReactMarkdown>
                    {loading && (
                        <span className="animate-pulse text-blue-500">▊</span>
                    )}
                </div>
                {done && (
                    <div className="mt-6 pt-6 border-t dark:border-gray-700 flex justify-end">
                        <button
                        onClick={getInsights}
                        className="text-blue-500 text-sm hover:underline"
                        >
                            Regenerate insights →
                        </button>
                    </div>
                )}
            </div>
        ) : (
            !loading && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
                    <p className="text-4xl mb-4">✨</p>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                        Get personalised AI insights
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                        We'll analyse your last 30 days of spending and give you
                        actionable recommendations
                    </p>
                </div>
            )
        )}
        </div>
    )
}
