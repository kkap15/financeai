import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import ProGate from '@/components/ProGate'
import ChatClient from './ChatClient'

async function getSubscription(accessToken: string) {
    const res = await fetch(`${process.env.API_URL}/api/user/subscription`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    })
    if (!res.ok) return null
    return res.json()
}

export default async function ChatPage() {
    const session = await auth0.getSession()
    if (!session) redirect('/auth/login')

    const subscription = await getSubscription(session.tokenSet.accessToken!)
    const isPro = subscription?.tier === 'Pro'

    if (!isPro) return <ProGate />

    return <ChatClient />
}