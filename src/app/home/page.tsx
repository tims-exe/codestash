// src/app/home/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/authOptions'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full bg-background border-b border-neutral-800 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <Navbar />
        </div>
      </nav>
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <div className="w-full max-w-xs text-center">
          <div className="bg-neutral-900 p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Hello, {session.user?.name}!
            </h2>
          </div>
        </div>
        
        {/* Plus Button */}
        <Link 
          href="/new"
          className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-black"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </Link>
      </main>
    </div>
  )
}