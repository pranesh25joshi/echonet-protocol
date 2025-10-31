import Room from '../models/Room.js'
import Message from '../models/Message.js'
import { generateRoomKey } from '../utils/keyGenerator.js'

/**
 * Create a new room
 */
export const createRoom = async (req, res) => {
  try {
    const {
      roomName,
      roomType = 'Group',
      maxParticipants = 10,
      isPublic = false,
      enableXP = false,
      timeLimit = 0,
      creator,
    } = req.body

    // Validate required fields
    if (!roomName || !creator) {
      return res.status(400).json({
        success: false,
        message: 'Room name and creator are required',
      })
    }

    // Generate unique access key
    let accessKey
    let keyExists = true

    while (keyExists) {
      accessKey = generateRoomKey()
      const existingRoom = await Room.findOne({ accessKey })
      if (!existingRoom) keyExists = false
    }

    // Create room
    const room = await Room.create({
      accessKey,
      roomName,
      roomType,
      maxParticipants,
      isPublic,
      enableXP,
      timeLimit,
      creator,
    })

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      accessKey: room.accessKey,
      room: {
        id: room._id,
        roomName: room.roomName,
        roomType: room.roomType,
        maxParticipants: room.maxParticipants,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
      },
    })
  } catch (error) {
    console.error('Error creating room:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating room',
      error: error.message,
    })
  }
}

/**
 * Get room by access key
 */
export const getRoomByKey = async (req, res) => {
  try {
    const { key } = req.params

    const room = await Room.findOne({ accessKey: key, isActive: true })

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or expired',
      })
    }

    // Check if room has expired
    if (room.expiresAt && room.expiresAt < new Date()) {
      room.isActive = false
      await room.save()

      return res.status(410).json({
        success: false,
        message: 'Room has expired',
      })
    }

    // Get message count for this room
    const messageCount = await Message.countDocuments({ roomKey: key })

    res.status(200).json({
      success: true,
      room: {
        id: room._id,
        accessKey: room.accessKey,
        name: room.roomName,
        roomName: room.roomName,
        roomType: room.roomType,
        maxParticipants: room.maxParticipants,
        currentParticipants: room.participants.length,
        participants: room.participants,
        isPublic: room.isPublic,
        enableXP: room.enableXP,
        expiresAt: room.expiresAt,
        createdAt: room.createdAt,
        creator: room.creator,
        messageCount: messageCount,
        timeLimit: room.timeLimit,
      },
    })
  } catch (error) {
    console.error('Error fetching room:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching room',
      error: error.message,
    })
  }
}

/**
 * Get messages for a room
 */
export const getRoomMessages = async (req, res) => {
  try {
    const { key } = req.params
    const { limit = 50 } = req.query

    const room = await Room.findOne({ accessKey: key, isActive: true })

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      })
    }

    const messages = await Message.find({ roomKey: key })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages',
      error: error.message,
    })
  }
}

/**
 * Delete/Deactivate room
 */
export const deleteRoom = async (req, res) => {
  try {
    const { key } = req.params
    const { userId } = req.body // Creator's userId for verification

    const room = await Room.findOne({ accessKey: key })

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      })
    }

    // Verify that the requester is the room creator
    if (userId && room.creator !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the room creator can delete this room',
      })
    }

    // Delete all messages associated with this room
    await Message.deleteMany({ roomKey: key })

    // Delete the room itself
    await Room.deleteOne({ accessKey: key })

    res.status(200).json({
      success: true,
      message: 'Room and all associated messages deleted successfully',
      roomKey: key,
    })
  } catch (error) {
    console.error('Error deleting room:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while deleting room',
      error: error.message,
    })
  }
}

/**
 * Get rooms created by user
 */
export const getUserCreatedRooms = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      })
    }

    const rooms = await Room.find({ 
      creator: userId, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .select('accessKey roomName roomType participants isPublic createdAt expiresAt')

    // Enhance with message counts
    const enhancedRooms = await Promise.all(
      rooms.map(async (room) => {
        const messageCount = await Message.countDocuments({ roomKey: room.accessKey })
        return {
          id: room._id,
          name: room.roomName,
          accessKey: room.accessKey,
          type: room.roomType,
          status: room.isPublic ? 'public' : 'private',
          participants: room.participants,
          messageCount,
          createdAt: room.createdAt,
          expiresAt: room.expiresAt,
        }
      })
    )

    res.status(200).json({
      success: true,
      rooms: enhancedRooms,
    })
  } catch (error) {
    console.error('Error fetching user created rooms:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms',
      error: error.message,
    })
  }
}

/**
 * Get rooms joined by user
 */
export const getUserJoinedRooms = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      })
    }

    const rooms = await Room.find({
      'participants.userId': userId,
      creator: { $ne: userId }, // Exclude rooms created by user
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .select('accessKey roomName roomType participants updatedAt')

    // Enhance with last message info
    const enhancedRooms = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Message.findOne({ roomKey: room.accessKey })
          .sort({ createdAt: -1 })
          .select('createdAt')
        
        const unreadCount = 0 // TODO: Implement unread message tracking

        return {
          id: room._id,
          name: room.roomName,
          accessKey: room.accessKey,
          type: room.roomType,
          lastMessage: lastMessage 
            ? getTimeAgo(lastMessage.createdAt)
            : 'Never',
          unreadCount,
          updatedAt: room.updatedAt,
        }
      })
    )

    res.status(200).json({
      success: true,
      rooms: enhancedRooms,
    })
  } catch (error) {
    console.error('Error fetching user joined rooms:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rooms',
      error: error.message,
    })
  }
}

/**
 * Helper function to get time ago
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval}${unit.charAt(0)} ago`
    }
  }
  
  return 'Just now'
}

/**
 * Extend room timer
 */
export const extendRoomTimer = async (req, res) => {
  try {
    const { key } = req.params
    const { additionalMinutes, userId } = req.body

    if (!additionalMinutes || additionalMinutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time extension value',
      })
    }

    const room = await Room.findOne({ accessKey: key, isActive: true })

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      })
    }

    // Check if user is the room creator
    if (room.creator !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the room creator can extend the timer',
      })
    }

    // Extend the expiry time
    if (room.expiresAt) {
      const currentExpiry = new Date(room.expiresAt)
      const newExpiry = new Date(currentExpiry.getTime() + additionalMinutes * 60 * 1000)
      room.expiresAt = newExpiry
      room.timeLimit = room.timeLimit + additionalMinutes
    } else {
      // If no expiry was set, set one
      room.timeLimit = additionalMinutes
      room.expiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000)
    }

    await room.save()

    res.status(200).json({
      success: true,
      message: `Room timer extended by ${additionalMinutes} minutes`,
      expiresAt: room.expiresAt,
      timeLimit: room.timeLimit,
    })
  } catch (error) {
    console.error('Error extending room timer:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while extending timer',
      error: error.message,
    })
  }
}
