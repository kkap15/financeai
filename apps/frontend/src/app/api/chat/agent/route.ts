import { auth0 } from "@/lib/auth0";

export async function POST(request: Request) {
    const session = await auth0.getSession()
    
    if (!session) {
        return new Response('Unauthorized', {status: 401});
    }

    const body = await request.json();
    const response = await fetch('http://localhost:5154/api/chat/agent', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${session.tokenSet.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });


    return new Response(response.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}