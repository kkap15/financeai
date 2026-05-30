import FreePanel from "@/components/FreePanel";
import ProPanel from "@/components/ProPanel";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const session = await auth0.getSession();
    if (!session) redirect('/auth/login');
    const accessToken = session.tokenSet.accessToken!

    const response = await fetch(`${process.env.API_URL}/api/user/subscription`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    })

    const subscription = await response.json();

    return (
        <>
        <style>{`
            .set-heading { color: #111827; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.5; }
            .set-hint { color: #9ca3af; font-size: 14px; margin-top: 4px; }
            .set-card { background: #ffffff; border: 1px solid #f3f4f6; border-radius: 16px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); max-width: 560px; }
            .set-subheading { color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 24px; }
            .dark .set-heading { color: #f9fafb; }
            .dark .set-hint { color: #6b7280; }
            .dark .set-card { background: #1f2937; border-color: rgba(55,65,81,0.5); box-shadow: none; }
            .dark .set-subheading { color: #f9fafb; }
        `}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <h1 className="set-heading">Settings</h1>
                <p className="set-hint">Manage your account and subscription</p>
            </div>

            <div className="set-card">
                <h2 className="set-subheading">Subscription</h2>
                {subscription.tier === 'Free'
                    ? <FreePanel />
                    : <ProPanel currentPeriodEnd={subscription.currentPeriodEnd} />
                }
            </div>
        </div>
        </>
    )
}