import Navbar from "@/components/Navbar";
import { auth0 } from "@/lib/auth0"
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout ({
    children,
} : {
    children: React.ReactNode
}) {
    const session = await auth0.getSession();
    
    if (!session) redirect('/auth/login');
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-8 py-8">
                {children}
            </div>
        </div>
    )
}