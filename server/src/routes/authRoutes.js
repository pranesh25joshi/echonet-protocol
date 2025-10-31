import express from 'express'
import {
  createGuestUser,
  registerUser,
  loginUser,
  verifySession,
  logout,
} from '../controllers/authController.js'

const router = express.Router()

// Create guest user
router.post('/create-guest', createGuestUser)

// Register permanent user
router.post('/register', registerUser)

// Login with username/password
router.post('/login', loginUser)

// Verify session token
router.post('/verify-session', verifySession)

// Logout
router.post('/logout', logout)

export default router
