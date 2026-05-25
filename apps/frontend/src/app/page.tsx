import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth0.getSession()
  
  if (session) redirect('/dashboard')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">FinanceAI</h1>
        <p className="text-gray-500 mb-8">
          AI-powered personal finance dashboard
        </p>
        
        <a href="/auth/login"
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Login
        </a>
      </div>
    </main>
  )
}