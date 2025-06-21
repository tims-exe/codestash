// src/app/api/update-question/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ message: 'User ID not found' }, { status: 401 })
    }

    const { questionId, title, content, category, difficulty, solution, sourceLink } = await request.json()

    if (!questionId) {
      return NextResponse.json({ message: 'Question ID is required' }, { status: 400 })
    }

    if (!title?.trim()) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 })
    }

    if (!content?.trim()) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 })
    }

    if (!solution?.trim()) {
      return NextResponse.json({ message: 'Solution is required' }, { status: 400 })
    }

    // Verify that the question belongs to the user
    const existingQuestion = await prisma.question.findFirst({
      where: {
        id: questionId,
        user_id: userId
      }
    })

    if (!existingQuestion) {
      return NextResponse.json({ message: 'Question not found or access denied' }, { status: 404 })
    }

    // Update the question
    const updatedQuestion = await prisma.question.update({
      where: {
        id: questionId
      },
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category,
        difficulty: difficulty,
        solution: solution.trim(),
        source_link: sourceLink?.trim() || null,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Question updated successfully',
      question: updatedQuestion 
    })

  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
  // Remove finally block - no need to disconnect with singleton
}