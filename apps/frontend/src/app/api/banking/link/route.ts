import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    const provider = req.nextUrl.searchParams.get('provider') ?? "Plaid";

    const response = await fetch(`${process.env.API_URL}/api/banking/link?provider=${provider}`, {
        headers: {Authorization: `Bearer ${session.tokenSet.accessToken}`},
        cache: 'no-store'
    });

    const data = await response.json();
    
    return NextResponse.json(data);
} 