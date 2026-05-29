import { auth0 } from '@/lib/auth0'
import { error } from 'next/dist/build/output/log';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const session = await auth0.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    const res = await fetch(`${process.env.API_URL}/api/banking/exchange`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        cache: 'no-store'
    });

    const text = await res.text();

    try {
        const data = JSON.parse(text);
        return NextResponse.json(data, {status: res.status});
    } catch {
        return NextResponse.json({error: text}, { status: res.status })
    }
}