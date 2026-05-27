import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth0.getSession();
    if (!session) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }
    
    const response = await fetch(`${process.env.API_URL}/api/budget`, {
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`,
        },
        cache: 'no-store'
    });
    
    if (!response.ok) {
        const text = await response.json();
        return NextResponse.json({error: text }, {status: response.status})
    }

    const data = await response.json();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const session = await auth0.getSession()
    
    if (!session) {
        return new Response('Unauthorized', {status: 401});
    }

    const body = await request.json();
    const response = await fetch(`${process.env.API_URL}/api/budget`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });


    return new Response(response.body, {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        }
    });
}