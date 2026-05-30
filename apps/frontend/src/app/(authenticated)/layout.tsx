import InactivityWrapper from "@/components/InactivityWrapper";
import Navbar from "@/components/Navbar";
import { auth0 } from "@/lib/auth0"
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';


async function getSubscription(accessToken:string) {
    const res = await fetch(`${process.env.API_URL}/api/user/subscription`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    });

    if (!res.ok) return null;

    return res.json();
}

export default async function AuthenticatedLayout ({
    children,
} : {
    children: React.ReactNode
}) {
    const session = await auth0.getSession();
    const userName = session?.user?.name;
    
    if (!session) redirect('/auth/login');

    await fetch(`${process.env.API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${session.tokenSet.accessToken}`},
        cache: 'no-store'
    });
    
    const subscription = await getSubscription(session.tokenSet.accessToken!);
    const isPro = subscription?.tier === 'Pro'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar 
            isPro={isPro}
            userName={userName}
            />
            <InactivityWrapper>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-10 py-6 sm:py-8">
                    {children}
                </div>
            </InactivityWrapper>
        </div>
    )
}