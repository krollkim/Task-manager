import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { authenticateUser } from '@/lib/services/authService'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
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

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    // Connect to database
    await dbConnect()

    // Parse request body
    const body: LoginRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Trim and lowercase email
    const email = body.email.trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Authenticate user
    const authResult = await authenticateUser(email, body.password)

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      )
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: authResult.user!,
          token: authResult.token!,
        },
      },
      { status: 200 }
    )

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', authResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
