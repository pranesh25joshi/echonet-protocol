import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      // Only required for registered users (not guests)
      required: function() {
        return !this.isGuest
      },
      select: false, // Don't return password in queries by default
    },
    isGuest: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      sparse: true, // Allow null for guests
    },
    walletAddress: {
      type: String,
      sparse: true, // For Web3 users
    },
    fingerprint: {
      type: String,
      index: true, // For identifying returning users
    },
    totalXP: {
      type: Number,
      default: 0,
    },
    roomsCreated: {
      type: Number,
      default: 0,
    },
    roomsJoined: {
      type: Number,
      default: 0,
    },
    achievements: [
      {
        name: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving (only for registered users with password)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false
  }
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
