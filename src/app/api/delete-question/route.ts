import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionId, userId } = body

    // Validate required fields
    if (!questionId || !userId) {
      return NextResponse.json(
        { message: 'Missing required fields: questionId and userId are required' },
        { status: 400 }
      )
    }

    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(questionId)) {
      return NextResponse.json(
        { message: 'Invalid questionId format' },
        { status: 400 }
      )
    }

    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { message: 'Invalid userId format' },
        { status: 400 }
      )
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userExists) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if the question exists and belongs to the user
    const existingQuestion = await prisma.question.findUnique({
      where: { 
        id: questionId,
      }
    })

    if (!existingQuestion) {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      )
    }

    // Verify the question belongs to the user
    if (existingQuestion.user_id !== userId) {
      return NextResponse.json(
        { message: 'Unauthorized: Question does not belong to user' },
        { status: 403 }
      )
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: questionId }
    })

    return NextResponse.json(
      { message: 'Question deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete question error:', error)
    
    // Handle Prisma specific errors
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { message: 'Question not found' },
          { status: 404 }
        )
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { message: 'Cannot delete question due to database constraints' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}