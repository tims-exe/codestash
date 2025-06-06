import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { message: 'Username must be between 3 and 50 characters' },
        { status: 400 }
      )
    }

    const result = await createUser(username, password)

    if (result.success) {
      return NextResponse.json(
        { message: 'User created successfully' },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: `Internal server error : ${error}` },
      { status: 500 }
    )
  }
}