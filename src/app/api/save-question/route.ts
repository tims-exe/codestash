// src/app/api/save-question/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      content, 
      category, 
      solution, 
      sourceLink, 
      difficulty, 
      tags,
      userId 
    } = await request.json()

    // Validate required fields
    if (!title || !content || !category || !solution || !userId) {
      return NextResponse.json(
        { 
          message: 'Missing required fields: title, content, category, solution, and userId are required' 
        },
        { status: 400 }
      )
    }

    // Validate userId format (should be a valid UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
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

    // Create the question
    const question = await prisma.question.create({
      data: {
        title,
        content,
        category,
        solution,
        source_link: sourceLink || null,
        difficulty: difficulty || null,
        tags: tags || [],
        user_id: userId
      }
    })

    return NextResponse.json(
      { 
        message: 'Question saved successfully',
        question: {
          id: question.id,
          title: question.title,
          category: question.category,
          difficulty: question.difficulty,
          created_at: question.created_at
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Save question error:', error)
    
    // Handle Prisma specific errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { message: 'Invalid user reference' },
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