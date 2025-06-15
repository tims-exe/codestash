// src/app/question/[id]/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/authOptions'
import { PrismaClient } from '@prisma/client'
import QuestionViewer from '@/components/QuestionViewer'

const prisma = new PrismaClient()

interface PageProps {
  params: {
    id: string
  }
}

export default async function QuestionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/login')
  }

  const userId = session.user.id

  if (!userId) {
    redirect('/login')
  }

  let question = null
  let error = null

  try {
    question = await prisma.question.findFirst({
      where: {
        id: params.id,
        user_id: userId
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        solution: true,
        source_link: true,
        difficulty: true,
        tags: true,
        created_at: true,
        updated_at: true,
      }
    })

    if (!question) {
      error = 'Question not found or you do not have permission to view it'
    }

  } catch (err) {
    console.error('Error fetching question:', err)
    error = 'Failed to load question'
  } finally {
    await prisma.$disconnect()
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-neutral-900 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-white mb-2">Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <a 
            href="/home" 
            className="inline-block bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
        <QuestionViewer question={question} userId={userId} />
    </div>
  )
}