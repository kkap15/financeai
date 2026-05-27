import { auth0 } from "@/lib/auth0";

export async function GET() {
    const session = await auth0.getSession()
    
    if (!session) {
        return new Response('Unauthorized', {status: 401});
    }
    
    const response = await fetch(`${process.env.API_URL}/api/ai/insights/stream`, {
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`
        }
    });
    
    return new Response(response.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}