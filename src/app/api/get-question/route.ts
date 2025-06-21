// src/app/api/get-questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get session to verify user authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Extract user ID from session
    const userId = session.user.id

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID not found' },
        { status: 400 }
      )
    }

    // Get URL search params for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')

    // Build where clause
    const where: Prisma.QuestionWhereInput = {
      user_id: userId
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Fetch questions with pagination
    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        select: {
          id: true,
          title: true,
          category: true,
          difficulty: true,
          tags: true,
          source_link: true,
          created_at: true,
          updated_at: true,
          // Don't include content and solution for list view to reduce payload
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.question.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      questions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })

  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
  // Remove finally block - no need to disconnect with singleton
}