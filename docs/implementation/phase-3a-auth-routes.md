# Phase 3a: Authentication API Routes Implementation

**Date:** 2026-05-31
**Status:** COMPLETE
**Branch:** feature/nextjs-migration

## Overview

Implemented full authentication API routes for Next.js that connect to MongoDB with proper password hashing, JWT token generation, and secure cookie management.

## Files Created

### 1. `lib/services/authService.ts` (NEW)
Core authentication service with reusable functions for password hashing, token generation, and user operations.

**Exported Functions:**

- `hashPassword(password: string): Promise<string>`
  - Uses bcryptjs with salt rounds of 10
  - Securely hashes passwords before storage

- `comparePassword(password: string, hash: string): Promise<boolean>`
  - Compares plain text password against stored hash
  - Used for login verification

- `generateToken(userId: string): string`
  - Creates JWT token with 7-day expiry
  - Encodes userId in payload
  - Uses JWT_SECRET from environment

- `verifyToken(token: string): { userId: string } | null`
  - Validates JWT signature and expiry
  - Returns decoded payload on success
  - Returns null on failure

- `findUserByEmail(email: string): Promise<IUser | null>`
  - Queries MongoDB for user by email
  - Returns user document or null

- `findUserById(userId: string): Promise<IUser | null>`
  - Queries MongoDB for user by ID
  - Returns user document or null

- `createUser(userData: { name, email, password }): Promise<IUser>`
  - Validates inputs (non-empty, unique email)
  - Hashes password automatically
  - Creates user in MongoDB
  - Throws error if email exists

- `authenticateUser(email: string, password: string): Promise<AuthResponse>`
  - Finds user by email
  - Verifies password
  - Generates token on success
  - Returns structured response

**Interfaces:**

```typescript
interface IUser {
  _id: string
  name: string
  email: string
  password: string
  googleId?: string
  avatar?: string
  authProvider: string
  createdAt?: Date
  updatedAt?: Date
}

interface AuthResponse {
  success: boolean
  user?: { id: string; email: string; name: string }
  token?: string
  error?: string
}
```

**Key Features:**

- Dynamic User model loading to prevent "model already compiled" errors
- Lean queries for performance (`.lean()`)
- Password never returned in responses
- Comprehensive error handling
- Input validation at service layer

## Files Updated

### 1. `app/api/auth/login/route.ts` (IMPLEMENTED)

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**

- 400: Missing email or password
- 400: Invalid email format
- 401: Invalid credentials (email not found or password mismatch)
- 500: Server error

**Implementation Details:**

1. Validates required fields (email, password)
2. Trims and lowercases email
3. Validates email format with regex
4. Calls `authenticateUser()` service
5. Sets HTTP-only secure cookie with token (7-day maxAge)
6. Returns user data and token in JSON response

**Cookie Configuration:**
- `httpOnly: true` — prevents JavaScript access
- `secure: true` (production only) — only sent over HTTPS
- `sameSite: 'lax'` — CSRF protection
- `maxAge: 7 * 24 * 60 * 60` — 7 days
- `path: '/'` — accessible site-wide

### 2. `app/api/auth/register/route.ts` (IMPLEMENTED)

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "new-user-id",
      "email": "john@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**

- 400: Missing required fields (name, email, password)
- 400: Invalid email format
- 400: Name less than 2 characters
- 400: Password less than 6 characters
- 400: Email already registered
- 500: Server error

**Implementation Details:**

1. Validates all required fields present
2. Trims email (lowercases) and name
3. Validates email format
4. Validates name length (≥2 chars)
5. Validates password length (≥6 chars)
6. Calls `createUser()` service
7. Handles duplicate email errors gracefully
8. Sets HTTP-only secure cookie with token
9. Returns 201 (Created) status

**Validation Rules:**

- Email: Must be valid email format
- Name: At least 2 characters (trimmed)
- Password: At least 6 characters (no max limit enforced)

### 3. `app/api/auth/logout/route.ts` (IMPLEMENTED)

**Endpoint:** `POST /api/auth/logout`

**Request Body:** None required

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Logout failed"
}
```

**Implementation Details:**

1. Creates response with success status
2. Clears auth-token cookie by setting `maxAge: 0`
3. Returns 200 status
4. Cookie deletion is immediate across all paths

**Cookie Clearing:**
- Same domain and path as login/register
- `maxAge: 0` triggers immediate deletion
- Browser removes cookie automatically

### 4. `lib/auth.ts` (UPDATED)

Updated authentication utilities to work with the new JWT-based system.

**New Implementations:**

- `validateToken(token: string)` — Validates JWT and returns session
- `getSession(request?)` — Extracts token from Authorization header
- `extractUserId(headers: Headers)` — Extracts user ID from headers
- Token verification uses `verifyToken()` from authService

## Database Schema

Uses existing `User` model from `server/models/mongoDB/User.js`:

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String },
  avatar: { type: String },
  authProvider: { type: String, default: 'local' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**Indexes:**
- `email`: Unique index (enforces no duplicate emails)

## Dependencies Installed

- `bcryptjs@^2.4.3` — Password hashing
- `jsonwebtoken@^9.1.2` — JWT token generation and verification
- `@types/jsonwebtoken@^9.0.8` — TypeScript types for JWT

## Configuration Required

### Environment Variables

```env
# In .env.local

# MongoDB connection (already configured)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/taskmanager

# JWT secret (already configured, change in production)
JWT_SECRET=your-super-secret-key

# Node environment (automatically set by Next.js)
NODE_ENV=development  # or 'production'
```

**Important:** Change `JWT_SECRET` in production to a strong random value.

## Security Considerations

### ✅ Implemented

1. **Password Security:**
   - Bcryptjs hashing with salt rounds of 10
   - Passwords never logged or returned in responses
   - Constant-time comparison for verification

2. **Token Security:**
   - JWT tokens with 7-day expiry
   - HTTP-only cookies prevent XSS access
   - Secure flag in production (HTTPS only)
   - Lax SameSite to prevent CSRF

3. **Input Validation:**
   - Email format validation (regex)
   - Required field validation
   - Length validation (name ≥2, password ≥6)
   - Trim and lowercase email to prevent duplicates

4. **MongoDB Security:**
   - Unique index on email prevents duplicates
   - Lean queries for performance
   - Connection caching with proper error handling

5. **Error Handling:**
   - Generic error messages (don't leak "email not found")
   - Detailed server-side logging capability
   - No sensitive data in responses

### ⚠️ To Implement (Future)

1. Rate limiting on login/register endpoints
2. Email verification for new accounts
3. Token refresh mechanism
4. Password reset flow
5. Account lockout after N failed attempts
6. Two-factor authentication (2FA)
7. OAuth2 integration (Google, GitHub, etc.)
8. Audit logging for auth events

## Testing Checklist

### Manual Testing

- [ ] Register new user with valid data → 201, token set in cookie
- [ ] Register with duplicate email → 400 error
- [ ] Register with invalid email → 400 error
- [ ] Register with short password → 400 error
- [ ] Login with valid credentials → 200, token set in cookie
- [ ] Login with wrong password → 401 error
- [ ] Login with non-existent email → 401 error
- [ ] Logout → 200, cookie cleared
- [ ] Verify cookie is HTTP-only (inspect browser dev tools)
- [ ] Verify token works for authenticated endpoints

### API Testing (curl/Postman)

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Integration Testing

```typescript
// Example test structure for Vitest/Jest
describe('Auth API Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should create user and return token', async () => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      })
      
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe('test@example.com')
      expect(data.data.token).toBeDefined()
    })
  })
})
```

## API Response Format

All auth endpoints follow the standard response format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

**Success (HTTP 200/201):**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error (HTTP 400/401/500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Next Steps (Phase 3b+)

1. **Implement Protected Routes:**
   - Add `withAuth()` middleware to protected endpoints
   - Use `extractUserId()` to get current user

2. **Add Other Auth Endpoints:**
   - Password reset
   - Email verification
   - Profile update
   - OAuth/Google login

3. **Implement Rate Limiting:**
   - Limit login attempts per IP
   - Limit registration attempts per IP
   - Use Redis or in-memory cache

4. **Add Session Management:**
   - Token refresh endpoint
   - Token blacklist/revocation
   - Session tracking

5. **Frontend Integration:**
   - Connect login/register pages to API
   - Store token in local storage or state
   - Handle auth errors gracefully
   - Redirect unauthenticated users

## Summary

**What was implemented:**

✅ Three complete authentication API routes (login, register, logout)  
✅ Secure password hashing with bcryptjs (salt rounds 10)  
✅ JWT token generation and verification (7-day expiry)  
✅ HTTP-only secure cookies (production-ready)  
✅ Comprehensive input validation  
✅ MongoDB integration with User model  
✅ Error handling with generic messages  
✅ TypeScript types for all interfaces  
✅ Service layer abstraction (`lib/services/authService.ts`)  
✅ All dependencies installed and configured  

**Routes Ready to Use:**

- `POST /api/auth/register` — Create new user
- `POST /api/auth/login` — Authenticate user
- `POST /api/auth/logout` — Clear session

**Security Features:**

- Bcryptjs password hashing
- JWT tokens with expiry
- HTTP-only cookies
- Email validation
- Duplicate email prevention
- Generic error messages
- Connection pooling/caching

**Build Status:**

✅ TypeScript types correct  
✅ Dependencies installed  
✅ Environment variables configured  
✅ Ready for component integration  

**Recommended Next Action:**

Implement protected endpoints (tasks, notes, meetings) using the `withAuth()` middleware and `extractUserId()` utility to verify JWT tokens in request headers.
