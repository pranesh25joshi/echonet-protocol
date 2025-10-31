import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema(
  {
    accessKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      enum: ['Game', 'Private', 'Group', 'Broadcast', 'Timed'],
      default: 'Group',
    },
    maxParticipants: {
      type: Number,
      default: 10,
      min: 2,
      max: 50,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    enableXP: {
      type: Boolean,
      default: false,
    },
    timeLimit: {
      type: Number, // in minutes, 0 = infinite
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    creator: {
      type: String,
      required: true,
    },
    participants: [
      {
        userId: String,
        username: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        xp: {
          type: Number,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      allowGuests: {
        type: Boolean,
        default: true,
      },
      allowMediaUpload: {
        type: Boolean,
        default: false,
      },
      moderationEnabled: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
)

// Index for expiry
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Auto-set expiresAt based on timeLimit
roomSchema.pre('save', function (next) {
  if (this.timeLimit > 0 && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + this.timeLimit * 60 * 1000)
  }
  next()
})

// Delete all messages when room is deleted
roomSchema.pre('remove', async function (next) {
  try {
    const Message = mongoose.model('Message')
    await Message.deleteMany({ roomKey: this.accessKey })
    next()
  } catch (error) {
    next(error)
  }
})

const Room = mongoose.model('Room', roomSchema)

export default Room
