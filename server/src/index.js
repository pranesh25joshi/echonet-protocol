import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import roomRoutes from './routes/roomRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { initializeSocket } from './services/socketService.js'

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()
const httpServer = createServer(app)

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/rooms', roomRoutes)
app.use('/api/auth', authRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EchoNet Protocol Server is running',
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Initialize Socket.io handlers
initializeSocket(io)

// Start server
const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌐 ECHONET PROTOCOL SERVER                          ║
║                                                       ║
║   🚀 Server running on port ${PORT}                     ║
║   📡 Socket.io enabled                                ║
║   🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}
║   💾 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Local'}                              ║
║                                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
