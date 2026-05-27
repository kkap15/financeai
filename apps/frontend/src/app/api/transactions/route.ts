import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth0.getSession();
    
    if(!session) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401 });
    }
    
    const {searchParams} = new URL(request.url);
    const page = searchParams.get('page') ?? '1';
    const category = searchParams.get('category') ?? '';
    
    const url = new URL(`${process.env.API_URL}/api/transactions`);
    url.searchParams.set('page', page);
    if (category) url.searchParams.set('category', category);
    
    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`
        }
    });
    
    const data = await response.json();
    return NextResponse.json(data);
}