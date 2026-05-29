import { Suspense } from "react";
import BasiqCallbackInner from "./BasiqCallbackInner";

export const dynamic = 'force-dynamic';

export default function BasiqCallbackPage() {
    return (
        <Suspense fallback = {
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-4">⌛️</div>
                    <p className="text-white text-lg">Connecting your bank...</p>
                </div>
            </div>
        }>
            <BasiqCallbackInner />
        </Suspense>
    )
}