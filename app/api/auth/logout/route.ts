import { NextRequest, NextResponse } from 'next/server'

interface LogoutResponse {
  success: boolean
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<LogoutResponse>> {
  try {
    // Verify the request has valid content (optional)
    // In a typical logout, we just need to clear the cookie

    // Create response
    const response = NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    )

    // Clear the auth token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Delete immediately
      path: '/',
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

