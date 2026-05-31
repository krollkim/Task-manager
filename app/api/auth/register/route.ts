import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { createUser, generateToken } from '@/lib/services/authService'

interface RegisterRequest {
  name: string
  email: string
  password: string
}

interface RegisterResponse {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      name: string
    }
    token: string
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body: RegisterRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Trim fields
    const email = body.email.trim().toLowerCase()
    const name = body.name.trim()
    const password = body.password

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate name (at least 2 characters)
    if (name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser({
      name,
      email,
      password,
    })

    // Generate token
    const token = generateToken(user._id)

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      },
      { status: 201 }
    )

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'

    // Handle duplicate email error (MongoDB unique constraint)
    if (message.includes('duplicate') || message.includes('already exists')) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
