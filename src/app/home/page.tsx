// src/app/home/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/authOptions'
import Navbar from '@/components/Navbar'

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
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl text-center">
          <div className="bg-neutral-900 p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              Hello, {session.user?.name}!
            </h2>
          </div>
        </div>
      </main>
    </div>
  )
}