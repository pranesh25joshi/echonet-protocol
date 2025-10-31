import express from 'express'
import {
  createRoom,
  getRoomByKey,
  getRoomMessages,
  deleteRoom,
  getUserCreatedRooms,
  getUserJoinedRooms,
  extendRoomTimer,
} from '../controllers/roomController.js'

const router = express.Router()

// Create a new room
router.post('/', createRoom)

// Get room by access key
router.get('/:key', getRoomByKey)

// Get messages for a room
router.get('/:key/messages', getRoomMessages)

// Delete/deactivate room
router.delete('/:key', deleteRoom)

// Extend room timer
router.patch('/:key/extend-timer', extendRoomTimer)

// Get user's created rooms
router.get('/user/:userId/created', getUserCreatedRooms)

// Get user's joined rooms
router.get('/user/:userId/joined', getUserJoinedRooms)

export default router
