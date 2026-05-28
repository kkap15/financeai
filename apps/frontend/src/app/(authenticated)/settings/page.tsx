import FreePanel from "@/components/FreePanel";
import ProPanel from "@/components/ProPanel";
import { auth0 } from "@/lib/auth0";

export default async function SettingsPage() {
    const session = await auth0.getSession();
    const accessToken = session!.tokenSet.accessToken!

    const response = await fetch(`${process.env.API_URL}/api/user/subscription`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store'
    })
    
    const subscription = await response.json();
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account and subscription</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 max-w-2xl">
                <h2 className="text-xl font-semibold mb-6 dark:text-white">Subscription</h2>
                { subscription.tier === 'Free' ? <FreePanel /> : <ProPanel currentPeriodEnd={subscription.currentPeriodEnd} /> }
            </div>
        </div>
    )
}