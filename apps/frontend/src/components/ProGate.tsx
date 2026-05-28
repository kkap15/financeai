import Link from "next/link";

export default function ProGate() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-10 text-center max-w-md w-full">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-2xl font-bold text-white mb-2">Pro Feature</h2>
                <p className="text-gray-400 mb-6">
                    Upgrade to Pro to unlock AI Insights, Agentic Chat, and Semantic Search.
                </p>
                <Link 
                href="/settings"
                className="bg-linear-to-r from-blue-500 to-purple-500 text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition inline-block"
                >
                    Upgrade to Pro
                </Link>   
            </div>
        </div>
    )
}