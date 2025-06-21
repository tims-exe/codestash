// src/app/home/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/authOptions'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface Question {
  id: string
  title: string
  category: string
  difficulty: string
  tags: string[]
  source_link: string | null
  created_at: Date
  updated_at: Date
}

interface CategoryGroup {
  category: string
  questions: Question[]
  count: number
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/login')
  }

  // Extract user ID from session
  const userId = session.user.id

  if (!userId) {
    redirect('/login')
  }

  // Fetch user's questions directly in the server component
  let questions: Question[] = []
  let error = null

  try {
    const raw = await prisma.question.findMany({
      where: {
        user_id: userId
      },
      select: {
        id: true,
        title: true,
        category: true,
        difficulty: true,
        tags: true,
        source_link: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    questions = raw.map(q => ({
      ...q,
      difficulty: q.difficulty ?? 'Unknown',
    }))

  } catch (err) {
    console.error('Error fetching questions:', err)
    error = 'Failed to load questions'
  }
  // Removed finally block - no need to disconnect with singleton

  const CATEGORIES = [
    'strings',
    'arrays',
    'sets',
    'hashmaps',
    'two pointer',
    'stacks',
    'linked list',
    'search',
    'sliding window',
    'trees',
    'heap',
    'graphs',
    'dynamic programming'
  ]

  const CATEGORY_COLORS = {
    'strings': 'text-red-400/70',
    'arrays': 'text-blue-400/70',
    'sets': 'text-green-400/70',
    'hashmaps': 'text-yellow-200/70',
    'two pointer': 'text-orange-400/70',
    'stacks': 'text-purple-400/70',
    'linked list': 'text-pink-400/70',
    'search': 'text-cyan-400/70',
    'sliding window': 'text-lime-400/70',
    'trees': 'text-teal-400/70',
    'heap': 'text-amber-400/70',
    'graphs': 'text-fuchsia-400/70',
    'dynamic programming': 'text-indigo-400/70'
  }

  // Group questions by category
  const categoryMap = new Map<string, Question[]>()

  questions.forEach(question => {
    if (!categoryMap.has(question.category)) {
      categoryMap.set(question.category, [])
    }
    categoryMap.get(question.category)!.push(question)
  })

  // Create category groups in the predefined order
  const categoryGroups: CategoryGroup[] = CATEGORIES
    .filter(category => categoryMap.has(category))
    .map(category => ({
      category,
      questions: categoryMap.get(category)!,
      count: categoryMap.get(category)!.length
    }))

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'text-gray-400'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full bg-background border-b border-neutral-800 px-4 sm:px-6 lg:px-8 py-4 text-">
        <div className="max-w-8xl">
          <Navbar userName={session.user?.name || ''} />
        </div>
      </nav>
      
      <main className="flex flex-col flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col flex-1 w-full h-full max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {questions.length === 0 ? (
            <div className="flex flex-1 justify-center items-center">
              <div className="bg-neutral-900 rounded-lg p-8 max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">No problems yet</h3>
                <p className="text-gray-400 mb-4">Start building your problem collection by adding your first LeetCode problem.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  My Problems
                </h1>
                <p className="text-gray-400">
                  {questions.length} problem{questions.length === 1 ? '' : 's'} across {categoryGroups.length} categor{categoryGroups.length === 1 ? 'y' : 'ies'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryGroups.map((group, index) => {
                  const isLastOdd = categoryGroups.length % 2 === 1 && index === categoryGroups.length - 1
                  
                  return (
                    <div 
                      key={group.category} 
                      className={`bg-neutral-900 rounded-lg p-6 border border-neutral-700 hover:border-neutral-500 transition-all duration-200 hover:shadow-lg ${
                        isLastOdd ? 'md:col-span-2' : ''
                      }`}
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-xl font-bold capitalize ${getCategoryColor(group.category)}`}>
                          {group.category}
                        </h2>
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-neutral-800 text-gray-300">
                          {group.count} problem{group.count === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* Questions List */}
                      <div className="space-y-2">
                        {group.questions.map((question) => (
                          <div key={question.id} className="text-gray-300 hover:text-white transition-colors">
                            <Link 
                              href={`/question/${question.id}`}
                              className="hover:underline block py-1 cursor-pointer"
                            >
                              {question.title}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
        
        {/* Plus Button */}
        <Link 
          href="/new"
          className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200 z-10"
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