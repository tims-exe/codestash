// src/app/new/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/authOptions'
import ProblemExtractor from '@/components/ProblemExtractor'

export default async function NewProblem() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/login')
  }

  const userId = session.user.id
  if (!userId) {
    // Handle case where user ID is not available
    console.error('User ID not found in session')
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-black">
      <ProblemExtractor userId={userId} />
    </div>
  )
}