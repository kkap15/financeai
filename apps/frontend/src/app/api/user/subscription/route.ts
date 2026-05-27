import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth0.getSession()
    
    if (!session) {
        return NextResponse.json({error: 'Unauthorized'}, { status: 401 })
    }
    
    const response = await fetch('http://localhost:5154/api/user/subscription', {
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`
        },
    })
    
    if (!response.ok) {
        const text = await response.text();
        console.error('.NET API Error', text);
        return NextResponse.json(
            {error: 'API error', detail: text},
            {status: response.status }
        )
    }
    const data = await response.json();

    return NextResponse.json(data)
}