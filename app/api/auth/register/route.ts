import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // TODO: Implement actual registration logic
    // 1. Check if user already exists
    // 2. Hash password with bcrypt
    // 3. Create user in MongoDB
    // 4. Generate JWT token
    // 5. Set secure HTTP-only cookie
    // 6. Return user data and token

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: 'stub-user-id',
            email: body.email,
            name: body.name,
          },
          token: 'stub-jwt-token',
        },
        message: 'Registration successful (stub)',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Registration failed',
      },
      { status: 500 }
    );
  }
}
