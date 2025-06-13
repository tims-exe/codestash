// src/app/new/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/authOptions'
import Navbar from '@/components/Navbar'
import ProblemExtractor from '@/components/ProblemExtractor'

export default async function NewProblem() {
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
      
      <main className="flex-1 flex justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-full w-full flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Add New Problem</h1>
            <ProblemExtractor />
        </div>
        </main>

    </div>
  )
}