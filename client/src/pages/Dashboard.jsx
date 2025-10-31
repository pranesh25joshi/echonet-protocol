import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roomAPI } from '../utils/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()
  const [activeRooms, setActiveRooms] = useState([])
  const [joinedRooms, setJoinedRooms] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/onboarding')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.id || user?.userId) {
        const userId = user.id || user.userId
        
        // Fetch user's created rooms
        try {
          const createdResponse = await roomAPI.getUserCreatedRooms(userId)
          if (createdResponse.success) {
            setActiveRooms(createdResponse.rooms || [])
          }
        } catch (error) {
          console.error('Failed to load created rooms:', error)
        }

        // Fetch user's joined rooms
        try {
          const joinedResponse = await roomAPI.getUserJoinedRooms(userId)
          if (joinedResponse.success) {
            setJoinedRooms(joinedResponse.rooms || [])
          }
        } catch (error) {
          console.error('Failed to load joined rooms:', error)
        }
      }
      
      // Add activity logs
      setActivityLogs([
        { id: 1, text: 'System initialized successfully.', time: new Date() },
        { id: 2, text: 'Encryption protocols activated.', time: new Date() },
        { id: 3, text: `User ${user?.username} authenticated.`, time: new Date() },
        { id: 4, text: 'Dashboard loaded successfully.', time: new Date() },
        { id: 5, text: 'Awaiting secure connections...', time: new Date() }
      ])
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = () => {
    navigate('/create-room')
  }

  const handleJoinRoom = () => {
    navigate('/join-room')
  }

  const handleOpenChat = (roomKey) => {
    navigate(`/room/${roomKey}`)
  }

  const handleRoomControl = (roomKey) => {
    navigate(`/room-control/${roomKey}`)
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout()
      navigate('/')
    }
  }

  // Show loading while checking authentication or loading data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-mono text-primary animate-pulse">
            {authLoading ? 'Authenticating...' : 'Loading Dashboard...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-background-dark text-white font-sans"
      style={{
        backgroundImage: `
          linear-gradient(rgba(10, 10, 10, 0.95), rgba(10, 10, 10, 0.95)),
          repeating-linear-gradient(0deg, rgba(34, 63, 73, 0.3), rgba(34, 63, 73, 0.3) 1px, transparent 1px, transparent 20px),
          repeating-linear-gradient(90deg, rgba(34, 63, 73, 0.3), rgba(34, 63, 73, 0.3) 1px, transparent 1px, transparent 20px)
        `
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-5">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-primary/30 px-6 py-3 mb-8">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-primary text-2xl">key</span>
            <h2 className="text-primary text-xl font-bold font-display tracking-widest">ENP</h2>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center justify-center h-10 px-4 bg-white/5 border border-white/30 text-white hover:bg-white/10 transition-colors"
              title="Home"
            >
              <span className="material-symbols-outlined">home</span>
            </button>
            <button className="flex items-center justify-center h-10 px-4 bg-white/5 border border-primary/30 text-white text-sm font-bold hover:bg-primary/20 transition-colors">
              <span className="truncate">@{user?.username || 'Guest'}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center h-10 px-4 bg-white/5 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-colors"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Page Heading */}
        <div className="flex flex-wrap justify-between gap-4 py-8">
          <div className="flex flex-col gap-2">
            <p className="text-white text-4xl lg:text-5xl font-black font-display leading-tight tracking-wider">
              WELCOME, {user?.username?.toUpperCase() || 'AGENT'}
            </p>
            <p className="text-primary/70 text-base font-normal">
              Your communication nodes and channels are active.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button 
            onClick={handleCreateRoom}
            className="flex items-center justify-center h-12 px-5 bg-primary text-background-dark text-base font-bold tracking-widest border border-primary hover:shadow-[0_0_15px_#00FFFF] transition-all"
          >
            <span>[+ DEPLOY NEW ROOM]</span>
          </button>
          <button 
            onClick={handleJoinRoom}
            className="flex items-center justify-center h-12 px-5 bg-transparent text-white text-base font-bold tracking-widest border border-primary/50 hover:border-primary hover:shadow-[0_0_10px_#00FFFF] transition-all"
          >
            <span>[&gt; JOIN SECURE ROOM]</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panels */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Active Rooms Panel */}
            <section className="border border-primary/30 bg-[#0F191D]/50">
              <h2 className="text-primary text-xl font-bold font-display leading-tight tracking-widest p-4 border-b border-primary/30">
                [ACTIVE ROOMS]
              </h2>
              <div className="p-4 flex flex-col gap-4">
                {activeRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/40 font-mono">No active rooms. Deploy your first secure channel.</p>
                    <button 
                      onClick={handleCreateRoom}
                      className="mt-4 px-6 py-2 border border-primary/50 text-primary hover:bg-primary/10 transition-colors font-mono"
                    >
                      [CREATE ROOM]
                    </button>
                  </div>
                ) : (
                  activeRooms.map((room) => (
                    <div 
                      key={room.id}
                      className="flex items-center justify-between gap-4 p-4 border border-primary/20 bg-black/20 hover:border-primary/50 transition-all"
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-white text-lg font-bold">{room.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 ${
                            room.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-400' 
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-400'
                          }`}>
                            {room.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-primary/70 text-sm font-mono">Key: {room.accessKey}</p>
                        <p className="text-white/50 text-sm flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">group</span>
                          {room.participants?.length || 0} Members
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRoomControl(room.accessKey)}
                        className="flex items-center justify-center h-10 px-4 bg-transparent text-white text-sm font-bold tracking-wider border border-primary/50 hover:bg-primary hover:text-background-dark transition-colors"
                      >
                        [CONTROL PANEL]
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Joined Rooms Panel */}
            <section className="border border-primary/30 bg-[#0F191D]/50">
              <h2 className="text-primary text-xl font-bold font-display leading-tight tracking-widest p-4 border-b border-primary/30">
                [JOINED ROOMS]
              </h2>
              <div className="p-4 flex flex-col gap-4">
                {joinedRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/40 font-mono">No joined rooms. Connect to a secure channel.</p>
                    <button 
                      onClick={handleJoinRoom}
                      className="mt-4 px-6 py-2 border border-primary/50 text-primary hover:bg-primary/10 transition-colors font-mono"
                    >
                      [JOIN ROOM]
                    </button>
                  </div>
                ) : (
                  joinedRooms.map((room) => (
                    <div 
                      key={room.id}
                      className="flex items-center justify-between gap-4 p-4 border border-primary/20 bg-black/20 hover:border-primary/50 transition-all"
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <p className="text-white text-lg font-bold">/{room.name}</p>
                        <p className="text-white/50 text-sm">Last Message: {room.lastMessage || 'Never'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {room.unreadCount > 0 && (
                          <div className="flex items-center justify-center size-6 bg-primary text-background-dark font-bold text-xs">
                            {room.unreadCount}
                          </div>
                        )}
                        <button 
                          onClick={() => handleOpenChat(room.accessKey)}
                          className="flex items-center justify-center h-10 px-4 bg-primary text-background-dark text-sm font-bold tracking-wider hover:shadow-[0_0_10px_#00FFFF] transition-all"
                        >
                          [OPEN CHAT]
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Panel - Activity Feed */}
          <div className="lg:col-span-2">
            <section className="border border-primary/30 bg-[#0F191D]/50 h-full flex flex-col">
              <h2 className="text-primary text-xl font-bold font-display leading-tight tracking-widest p-4 border-b border-primary/30">
                [ACTIVITY LOGS]
              </h2>
              <div className="p-4 font-mono text-sm text-white/80 space-y-2 flex-grow overflow-y-auto max-h-[470px]">
                {activityLogs.map((log) => (
                  <p key={log.id}>
                    <span className="text-primary/70">&gt;</span> {log.text}
                  </p>
                ))}
                <p className="animate-pulse">
                  <span className="text-primary/70">&gt;</span> Waiting for next event...
                  <span className="inline-block w-2 h-3 bg-primary ml-1"></span>
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-primary/30 py-4 px-6">
          <p className="text-center text-xs text-white/50 tracking-wider">
            All communications are encrypted. Transparency powered by Web3.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default Dashboard
