import { NextResponse } from "next/server";

export async function GET() {
    return new NextResponse(
        `<html>
            <body>
                <script>
                    localStorage.removeItem('financeai_last_activity');
                    window.location.href = '/auth/logout';
                </script>
            </body>
        </html>`,
        {
            headers: { 'Content-Type': 'text/html' }
        }
    )
}