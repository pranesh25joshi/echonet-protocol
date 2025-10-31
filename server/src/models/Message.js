import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    roomKey: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ['text', 'system', 'reaction'],
      default: 'text',
    },
    reactions: [
      {
        userId: String,
        emoji: String,
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// TTL index - messages expire after 24 hours (can be adjusted)
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

const Message = mongoose.model('Message', messageSchema)

export default Message
