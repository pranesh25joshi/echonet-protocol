import Room from '../models/Room.js'
import Message from '../models/Message.js'

/**
 * Initialize Socket.io event handlers
 */
export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`)

    // Join a room
    socket.on('join-room', async ({ roomKey, user }) => {
      try {
        const room = await Room.findOne({ accessKey: roomKey, isActive: true })

        if (!room) {
          socket.emit('error', { message: 'Room not found or expired' })
          return
        }

        // Check if room is full
        if (room.participants.length >= room.maxParticipants) {
          socket.emit('error', { message: 'Room is full' })
          return
        }

        // Add user to room participants if not already present
        const existingParticipant = room.participants.find(
          (p) => p.userId === user.userId
        )

        let isNewUser = false
        if (!existingParticipant) {
          room.participants.push({
            userId: user.userId,
            username: user.username,
            joinedAt: new Date(),
            xp: 0,
          })
          await room.save()
          isNewUser = true
        }

        // Join socket room
        socket.join(roomKey)
        socket.data.roomKey = roomKey
        socket.data.user = user

        // Load recent messages
        const recentMessages = await Message.find({ roomKey })
          .sort({ createdAt: 1 })
          .limit(50)
          .lean()

        // Notify others ONLY if this is a new user
        if (isNewUser) {
          socket.to(roomKey).emit('user-joined', {
            userId: user.userId,
            username: user.username,
            timestamp: new Date(),
          })
          console.log(`📢 Broadcasting: ${user.username} joined room ${roomKey}`)
        } else {
          console.log(`🔄 User ${user.username} reconnected to room ${roomKey}`)
        }

        // Send current participants and messages to the new user
        socket.emit('room-joined', {
          roomKey,
          participants: room.participants,
          messages: recentMessages,
          roomInfo: {
            roomName: room.roomName,
            roomType: room.roomType,
            enableXP: room.enableXP,
          },
        })

        console.log(`✅ User ${user.username} joined room ${roomKey}`)
      } catch (error) {
        console.error('Error joining room:', error)
        socket.emit('error', { message: 'Failed to join room' })
      }
    })

    // Send message
    socket.on('send-message', async ({ roomKey, userId, username, content }) => {
      try {
        // Save message to database
        const message = await Message.create({
          roomKey,
          userId,
          username,
          content,
          messageType: 'text',
        })

        // Broadcast message to room
        io.to(roomKey).emit('receive-message', {
          id: message._id,
          userId,
          username,
          content,
          timestamp: message.createdAt,
        })

        // Award XP if enabled
        const room = await Room.findOne({ accessKey: roomKey })
        if (room && room.enableXP) {
          const participant = room.participants.find((p) => p.userId === userId)
          if (participant) {
            participant.xp += 1
            await room.save()
          }
        }
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Typing indicator
    socket.on('typing', ({ roomKey, username, isTyping }) => {
      socket.to(roomKey).emit('user-typing', { username, isTyping })
    })

    // Leave room
    socket.on('leave-room', async ({ roomKey, userId }) => {
      try {
        socket.leave(roomKey)
        
        // Check if user has other active connections in this room
        const socketsInRoom = await io.in(roomKey).fetchSockets()
        const userStillConnected = socketsInRoom.some(
          s => s.data.user?.userId === userId
        )

        // Only remove from DB if user has no other connections
        if (!userStillConnected) {
          const room = await Room.findOne({ accessKey: roomKey })

          if (room) {
            room.participants = room.participants.filter((p) => p.userId !== userId)
            await room.save()

            socket.to(roomKey).emit('user-left', {
              userId,
              timestamp: new Date(),
            })

            console.log(`👋 User ${userId} fully left room ${roomKey}`)
          }
        } else {
          console.log(`🔄 User ${userId} has other connections, not removing from room`)
        }
      } catch (error) {
        console.error('Error leaving room:', error)
      }
    })

    // Timer extended event (broadcast to all room participants)
    socket.on('timer-extended', ({ roomKey, expiresAt, additionalMinutes }) => {
      io.to(roomKey).emit('timer-updated', {
        expiresAt,
        additionalMinutes,
        message: `Room timer extended by ${additionalMinutes} minutes`,
      })
      console.log(`⏰ Room ${roomKey} timer extended by ${additionalMinutes} minutes`)
    })

    // Room deleted event (notify all users in the room)
    socket.on('room-deleted', ({ roomKey }) => {
      console.log(`🗑️ Room ${roomKey} deleted, notifying all users`)
      
      // Broadcast to all users in the room (including sender)
      io.to(roomKey).emit('room-deleted-notification', {
        roomKey,
        message: 'This room has been deleted by the creator',
      })
    })

    // Disconnect
    socket.on('disconnect', async () => {
      const { roomKey, user } = socket.data

      if (roomKey && user) {
        console.log(`👋 User ${user.username} disconnected from room ${roomKey}`)
        
        // Use a small delay to handle reconnections (e.g., page refresh)
        // This prevents flickering in the user list
        setTimeout(async () => {
          try {
            // Check if user has any other active connections in this room
            const socketsInRoom = await io.in(roomKey).fetchSockets()
            const userStillConnected = socketsInRoom.some(
              s => s.data.user?.userId === user.userId
            )

            // Only remove from DB and notify if user has no active connections
            if (!userStillConnected) {
              const room = await Room.findOne({ accessKey: roomKey })

              if (room) {
                room.participants = room.participants.filter(
                  (p) => p.userId !== user.userId
                )
                await room.save()

                io.to(roomKey).emit('user-left', {
                  userId: user.userId,
                  username: user.username,
                  timestamp: new Date(),
                })
                
                console.log(`✅ User ${user.username} fully left room ${roomKey}`)
              }
            } else {
              console.log(`🔄 User ${user.username} still has active connection, not removing`)
            }
          } catch (error) {
            console.error('Error on disconnect:', error)
          }
        }, 1000) // 1 second grace period for reconnections
      }

      console.log(`🔌 User disconnected: ${socket.id}`)
    })
  })
}
