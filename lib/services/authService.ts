import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

/**
 * User document interface matching MongoDB User model
 */
export interface IUser {
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

/**
 * Auth response interface
 */
export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
  }
  token?: string
  error?: string
}

/**
 * Get or create the User model
 * Ensures Mongoose doesn't throw "Cannot overwrite model once compiled" error
 */
function getUserModel() {
  if (mongoose.models.User) {
    return mongoose.models.User
  }

  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String },
    avatar: { type: String },
    authProvider: { type: String, default: 'local' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  })

  return mongoose.model('User', UserSchema)
}

/**
 * Hash a password using bcryptjs
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

/**
 * Compare a plain text password with a hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns Promise<boolean> - Whether passwords match
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

/**
 * Generate JWT token for a user
 * @param userId - User ID to encode in token
 * @returns string - JWT token
 */
export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: '7d',
  })
}

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns object - Decoded token payload or null if invalid
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET not configured')
    }

    const decoded = jwt.verify(token, secret) as { userId: string }
    return decoded
  } catch {
    return null
  }
}

/**
 * Find user by email
 * @param email - User email address
 * @returns Promise<IUser | null> - User document or null if not found
 */
export async function findUserByEmail(email: string): Promise<IUser | null> {
  const User = getUserModel()
  const user = await User.findOne({ email }).lean() as IUser | null
  return user
}

/**
 * Find user by ID
 * @param userId - User ID
 * @returns Promise<IUser | null> - User document or null if not found
 */
export async function findUserById(userId: string): Promise<IUser | null> {
  const User = getUserModel()
  const user = await User.findById(userId).lean() as IUser | null
  return user
}

/**
 * Create a new user
 * @param userData - User data: { name, email, password }
 * @returns Promise<IUser> - Created user document
 */
export async function createUser(userData: {
  name: string
  email: string
  password: string
}): Promise<IUser> {
  // Validate inputs
  if (!userData.name || !userData.email || !userData.password) {
    throw new Error('Name, email, and password are required')
  }

  // Check if user already exists
  const existingUser = await findUserByEmail(userData.email)
  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password)

  // Create user
  const User = getUserModel()
  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    authProvider: 'local',
  })

  // Return user without password
  const userObj = user.toObject() as IUser
  delete (userObj as any).password
  return userObj
}

/**
 * Verify user credentials and return token
 * @param email - User email
 * @param password - Plain text password
 * @returns Promise<AuthResponse> - Authentication result with token
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Find user
    const user = await findUserByEmail(email)
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password)
    if (!passwordMatch) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Generate token
    const token = generateToken(user._id)

    // Return success response
    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed'
    return {
      success: false,
      error: message,
    }
  }
}
