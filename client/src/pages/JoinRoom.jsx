import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roomAPI } from '../utils/api'

const JoinRoom = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [roomKey, setRoomKey] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/onboarding')
    }
  }, [user, authLoading, navigate])

  const handleJoinRoom = async (e) => {
    e.preventDefault()
    if (!roomKey.trim()) {
      alert('Please enter a room key')
      return
    }

    // Check authentication before joining
    if (!user) {
      alert('Please login or continue as guest first')
      navigate('/onboarding')
      return
    }

    setLoading(true)
    try {
      const response = await roomAPI.getByKey(roomKey)
      if (response.success) {
        navigate(`/room/${roomKey}`)
      } else {
        alert(response.message || 'Room not found')
        navigate('/access-denied')
      }
    } catch (error) {
      console.error('Error joining room:', error)
      const errorMessage = error.response?.data?.message || 'Room not found or expired'
      alert(errorMessage)
      navigate('/access-denied')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-mono text-primary animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
      {/* Key Hologram Background */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[20rem] text-primary opacity-50 z-0 animate-rotate-glow select-none">
        <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>key</span>
      </div>

      <div className="relative z-10 flex h-full grow flex-col">
        <div className="px-4 flex flex-1 justify-center items-center py-5">
          <div className="layout-content-container flex flex-col max-w-lg w-full flex-1 gap-6">
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 rounded-xl border border-white/10 bg-black/30 p-6 backdrop-blur-lg sm:p-8 @[480px]:gap-8 items-center justify-center card-glow"
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-bold leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-bold @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Enter the Realm 🔑
                    </h1>
                    <h2 className="text-gray-400 text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Only those with the key may pass.
                    </h2>
                  </div>

                  <form onSubmit={handleJoinRoom} className="flex flex-col w-full max-w-sm gap-6">
                    <div className="relative w-full">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="material-symbols-outlined text-cyan-300/50">key</span>
                      </div>
                      <input
                        className="form-input h-14 w-full rounded-lg border border-white/20 bg-black/40 pl-12 pr-4 text-white placeholder:text-gray-500 transition-shadow duration-300 focus:border-cyan-400/50 focus:outline-none focus:ring-0 focus:ring-offset-0 input-glow"
                        placeholder="Enter Room Key"
                        type="text"
                        value={roomKey}
                        onChange={(e) => setRoomKey(e.target.value.toUpperCase())}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-14 w-full transform cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="truncate">{loading ? 'Verifying...' : 'Join Room'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <p className="px-4 pb-3 pt-1 text-center text-sm font-normal leading-normal text-gray-500 transition-colors hover:text-white">
              <a href="/create-room" className="cursor-pointer">
                Don't have a key? Create one instead.
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinRoom
