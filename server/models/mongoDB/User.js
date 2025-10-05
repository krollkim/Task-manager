import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String }, // Google user ID
  avatar: { type: String }, // Profile picture URL
  authProvider: { type: String, default: 'local' } // 'local', 'google', etc.
})

// הצפנת סיסמה לפני שמירה
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

export default mongoose.model('User', UserSchema)