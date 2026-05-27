import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth0.getSession();
    if (!session) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }
    
    const response = await fetch('http://localhost:5154/api/transactions/categories', {
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`
        }
    });
    
    const data = await response.json();
    return NextResponse.json(data);
}