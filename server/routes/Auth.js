// routes/auth.js
import express from 'express'
import User from '../models/mongoDB/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'

const router = express.Router()

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ msg: 'Email already exists' })

    const user = await User.create({ name, email, password })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' })

    // שליחת טוקן כ-HTTPOnly cookie
    res.cookie('token', token, {
      httpOnly: true, // לא ניתן לגישה מ-JavaScript
      secure: process.env.NODE_ENV === 'production', // רק ב-HTTPS בפרודקשן
      sameSite: 'lax', // הגנה מפני CSRF
      maxAge: 24 * 60 * 60 * 1000 // 24 שעות במילישניות
    })

    res.status(201).json({ user: { id: user._id, name, email } })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ msg: 'Server error' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '1d' })
    
    // שליחת טוקן כ-HTTPOnly cookie
    res.cookie('token', token, {
      httpOnly: true, // לא ניתן לגישה מ-JavaScript
      secure: process.env.NODE_ENV === 'production', // רק ב-HTTPS בפרודקשן
      sameSite: 'lax', // הגנה מפני CSRF
      maxAge: 24 * 60 * 60 * 1000 // 24 שעות במילישניות
    })

    res.json({ user: { id: user._id, name: user.name, email } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ msg: 'Server error' })
  }
})

// Logout route - מנקה את ה-cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  res.json({ msg: 'Logged out successfully' })
})

// Google Login route
router.post('/auth/google', async (req, res) => {
  const { token } = req.body
  
  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    
    const payload = ticket.getPayload()
    if (!payload) {
      return res.status(400).json({ msg: 'Invalid Google token' })
    }

    const { sub: googleId, email, name, picture } = payload

    // Check if user exists
    let user = await User.findOne({ email })
    
    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        // For Google users, we don't need a password
        password: 'google_auth_' + googleId
      })
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleId
      if (picture) user.avatar = picture
      await user.save()
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'fallback_secret_key', 
      { expiresIn: '1d' }
    )
    
    // Set HTTPOnly cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })

    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        avatar: user.avatar 
      } 
    })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(500).json({ msg: 'Google authentication failed' })
  }
})

// Check auth status - בדיקת סטטוס האימות
router.get('/me', async (req, res) => {
  const token = req.cookies.token
  
  if (!token) {
    return res.status(401).json({ msg: 'Not authenticated' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key')
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({ msg: 'User not found' })
    }

    res.json({ user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    console.error('Auth check error:', err)
    res.status(401).json({ msg: 'Token is not valid' })
  }
})

export default router
