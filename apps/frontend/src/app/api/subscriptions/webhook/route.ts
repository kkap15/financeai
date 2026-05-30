import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const stripeSignature = request.headers.get("Stripe-Signature") ?? "";

    const response = await fetch(`${process.env.API_URL}/api/subscriptions/webhook`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Stripe-Signature": stripeSignature,
        },
        body: rawBody,
    });

    if (!response.ok) {
        const error = await response.text();
        return NextResponse.json({ error }, { status: response.status });
    }

    return NextResponse.json({ received: true });
}
