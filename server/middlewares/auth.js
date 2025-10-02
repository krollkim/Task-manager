import jwt from 'jsonwebtoken'

export default function (req, res, next) {
  // קריאת הטוקן מה-cookie במקום מה-header
  const token = req.cookies.token
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authentication denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key')
    req.user = decoded
    next()
  } catch (e) {
    console.error('Token verification error:', e)
    res.status(401).json({ msg: 'Token is not valid' })
  }
}