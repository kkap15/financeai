import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth0.getSession();
    
    if (!session) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }
    
    const body = await request.json();
    const response = await fetch(`${process.env.API_URL}/api/plaid/exchange-token`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    
    const data = await response.text();
    
    return NextResponse.json(data);
}