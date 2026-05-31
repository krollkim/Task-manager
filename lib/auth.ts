/**
 * Authentication utilities for Next.js
 */

import { verifyToken } from './services/authService'

export interface AuthSession {
  user?: {
    id: string
    email: string
    name?: string
  }
}

/**
 * Validate JWT token from request headers
 */
export async function validateToken(token: string): Promise<AuthSession | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }
    return {
      user: {
        id: decoded.userId,
        email: '', // Email not stored in token
        name: '', // Name not stored in token
      },
    }
  } catch (error) {
    return null
  }
}

/**
 * Extract session from request cookies or headers
 */
export async function getSession(request?: any): Promise<AuthSession | null> {
  // Try to get token from Authorization header (Bearer token)
  if (request?.headers) {
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      return validateToken(token)
    }
  }

  // Fallback: Try to get from cookies (handled by browser automatically)
  return null
}

/**
 * Extract user ID from request headers or session
 * Checks Authorization Bearer header first, then falls back to auth-token cookie.
 */
export function extractUserId(headers: Headers): string | null {
  try {
    // Try Authorization header first (Bearer token)
    const authHeader = headers.get('authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const decoded = verifyToken(token)
      if (decoded) {
        return decoded.userId
      }
    }

    // Fallback: parse auth-token from Cookie header (set by login route as HTTP-only cookie)
    const cookieHeader = headers.get('cookie')
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)auth-token=([^;]+)/)
      if (match) {
        const token = decodeURIComponent(match[1])
        const decoded = verifyToken(token)
        if (decoded) {
          return decoded.userId
        }
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Create auth error response
 */
export function createAuthError(message: string = 'Unauthorized') {
  return {
    success: false,
    error: message,
  }
}
