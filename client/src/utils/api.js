import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Room API calls
export const roomAPI = {
  create: async (roomData) => {
    const response = await api.post('/rooms', roomData)
    return response.data
  },

  getByKey: async (key) => {
    const response = await api.get(`/rooms/${key}`)
    return response.data
  },

  getMessages: async (key, limit = 50) => {
    const response = await api.get(`/rooms/${key}/messages`, {
      params: { limit },
    })
    return response.data
  },

  delete: async (key, userId) => {
    const response = await api.delete(`/rooms/${key}`, {
      data: { userId }, // Send userId in request body
    })
    return response.data
  },

  getUserCreatedRooms: async (userId) => {
    const response = await api.get(`/rooms/user/${userId}/created`)
    return response.data
  },

  getUserJoinedRooms: async (userId) => {
    const response = await api.get(`/rooms/user/${userId}/joined`)
    return response.data
  },

  extendTimer: async (key, additionalMinutes, userId) => {
    const response = await api.patch(`/rooms/${key}/extend-timer`, {
      additionalMinutes,
      userId,
    })
    return response.data
  },
}

// Health check
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    console.error('Server health check failed:', error)
    return { success: false }
  }
}

export default api
