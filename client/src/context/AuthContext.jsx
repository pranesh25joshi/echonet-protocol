import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Generate browser fingerprint for anonymous identity
const generateFingerprint = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('Browser fingerprint', 2, 2)
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasFingerprint: canvas.toDataURL(),
  }
  
  // Create hash from fingerprint
  const fingerprintString = JSON.stringify(fingerprint)
  let hash = 0
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return `fp_${Math.abs(hash).toString(36)}_${Date.now()}`
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Check localStorage for existing user
      const storedUser = localStorage.getItem('echonet_user')
      const sessionToken = localStorage.getItem('echonet_session_token')
      
      if (storedUser && sessionToken) {
        const userData = JSON.parse(storedUser)
        
        // Verify session with backend
        try {
          const response = await axios.post(`${API_URL}/auth/verify-session`, {
            userId: userData.id || userData.userId,
            sessionToken,
          })
          
          if (response.data.success) {
            setUser(response.data.user)
            setLoading(false)
            return
          }
        } catch (error) {
          console.log('Session expired, will create new user')
        }
      }
      
      // No valid session, user needs to authenticate
      setUser(null)
      setLoading(false)
      
    } catch (error) {
      console.error('Error initializing auth:', error)
      setLoading(false)
    }
  }

  const createGuestUser = async (username = null) => {
    try {
      const fingerprint = generateFingerprint()
      const guestUsername = username || `Guest_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      // Create user in database
      const response = await axios.post(`${API_URL}/auth/create-guest`, {
        username: guestUsername,
        fingerprint,
      })
      
      if (response.data.success) {
        const userData = response.data.user
        const sessionToken = response.data.sessionToken
        
        setUser(userData)
        localStorage.setItem('echonet_user', JSON.stringify(userData))
        localStorage.setItem('echonet_session_token', sessionToken)
        localStorage.setItem('echonet_fingerprint', fingerprint)
        
        return userData
      }
    } catch (error) {
      console.error('Error creating guest user:', error)
      
      // Fallback to local-only user
      const fallbackUser = {
        id: `local_${Date.now()}`,
        userId: `local_${Date.now()}`,
        username: username || `Guest_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        isGuest: true,
        createdAt: new Date().toISOString(),
      }
      setUser(fallbackUser)
      localStorage.setItem('echonet_user', JSON.stringify(fallbackUser))
      return fallbackUser
    }
  }

  const registerUser = async (username, password, email = null) => {
    try {
      const fingerprint = localStorage.getItem('echonet_fingerprint') || generateFingerprint()
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        password,
        email,
        fingerprint,
      })
      
      if (response.data.success) {
        const userData = response.data.user
        const sessionToken = response.data.sessionToken
        
        setUser(userData)
        localStorage.setItem('echonet_user', JSON.stringify(userData))
        localStorage.setItem('echonet_session_token', sessionToken)
        
        return userData
      }
    } catch (error) {
      console.error('Error registering user:', error)
      throw error
    }
  }

  const loginUser = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      })
      
      if (response.data.success) {
        const userData = response.data.user
        const sessionToken = response.data.sessionToken
        
        setUser(userData)
        localStorage.setItem('echonet_user', JSON.stringify(userData))
        localStorage.setItem('echonet_session_token', sessionToken)
        
        return userData
      }
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('echonet_user')
    localStorage.removeItem('echonet_session_token')
    // Keep fingerprint for potential re-identification
  }

  const value = {
    user,
    setUser,
    createGuestUser,
    registerUser,
    loginUser,
    logout,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
