import User from '../models/User.js'
import crypto from 'crypto'

// Store active sessions (in production, use Redis)
const activeSessions = new Map()

/**
 * Generate session token
 */
const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create guest user
 */
export const createGuestUser = async (req, res) => {
  try {
    const { username, fingerprint } = req.body

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required',
      })
    }

    // Check if user with this fingerprint already exists
    let user = await User.findOne({ fingerprint })

    if (user) {
      // User returning with same browser fingerprint
      // Update last active
      user.lastActive = new Date()
      await user.save()

      const sessionToken = generateSessionToken()
      activeSessions.set(user.userId, {
        token: sessionToken,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      })

      return res.status(200).json({
        success: true,
        message: 'Welcome back!',
        user: {
          id: user.userId,
          userId: user.userId,
          username: user.username,
          isGuest: user.isGuest,
          totalXP: user.totalXP,
          createdAt: user.createdAt,
        },
        sessionToken,
        isReturningUser: true,
      })
    }

    // Create new guest user
    const userId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    user = await User.create({
      userId,
      username,
      isGuest: true,
      fingerprint,
      lastActive: new Date(),
    })

    const sessionToken = generateSessionToken()
    activeSessions.set(userId, {
      token: sessionToken,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    res.status(201).json({
      success: true,
      message: 'Guest user created successfully',
      user: {
        id: user.userId,
        userId: user.userId,
        username: user.username,
        isGuest: user.isGuest,
        totalXP: user.totalXP,
        createdAt: user.createdAt,
      },
      sessionToken,
      isReturningUser: false,
    })
  } catch (error) {
    console.error('Error creating guest user:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating guest user',
      error: error.message,
    })
  }
}

/**
 * Register permanent user
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, fingerprint } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username, isGuest: false })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken',
      })
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const user = await User.create({
      userId,
      username,
      email,
      password, // Will be hashed by pre-save hook
      isGuest: false,
      fingerprint,
      lastActive: new Date(),
    })

    const sessionToken = generateSessionToken()
    activeSessions.set(userId, {
      token: sessionToken,
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days for registered users
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.userId,
        userId: user.userId,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        totalXP: user.totalXP,
        createdAt: user.createdAt,
      },
      sessionToken,
    })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    })
  }
}

/**
 * Login user with username and password
 */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      })
    }

    // Find user and include password field
    const user = await User.findOne({ username, isGuest: false }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      })
    }

    // Compare password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      })
    }

    // Update last active
    user.lastActive = new Date()
    await user.save()

    // Generate session token
    const sessionToken = generateSessionToken()
    activeSessions.set(user.userId, {
      token: sessionToken,
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.userId,
        userId: user.userId,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        totalXP: user.totalXP,
        roomsCreated: user.roomsCreated,
        roomsJoined: user.roomsJoined,
        createdAt: user.createdAt,
      },
      sessionToken,
    })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    })
  }
}

/**
 * Verify session token
 */
export const verifySession = async (req, res) => {
  try {
    const { userId, sessionToken } = req.body

    if (!userId || !sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'UserId and session token are required',
      })
    }

    // Check if session exists and is valid
    const session = activeSessions.get(userId)
    
    if (!session || session.token !== sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token',
      })
    }

    if (session.expiresAt < Date.now()) {
      activeSessions.delete(userId)
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      })
    }

    // Get user from database
    const user = await User.findOne({ userId })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Update last active
    user.lastActive = new Date()
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Session valid',
      user: {
        id: user.userId,
        userId: user.userId,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        totalXP: user.totalXP,
        roomsCreated: user.roomsCreated,
        roomsJoined: user.roomsJoined,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Error verifying session:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while verifying session',
      error: error.message,
    })
  }
}

/**
 * Logout
 */
export const logout = async (req, res) => {
  try {
    const { userId } = req.body

    if (userId) {
      activeSessions.delete(userId)
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Error logging out:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while logging out',
      error: error.message,
    })
  }
}
