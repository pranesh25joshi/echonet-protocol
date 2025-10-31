import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { roomAPI } from '../utils/api'

const RoomControl = () => {
  const { roomKey } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket } = useSocket()
  
  const [room, setRoom] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [members, setMembers] = useState([])
  const [messageCount, setMessageCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (roomKey) {
      loadRoomData()
    }
  }, [roomKey])

  // Listen for real-time updates via socket
  useEffect(() => {
    if (!socket || !roomKey || !user) return

    // Join the room to listen for events (as observer)
    socket.emit('join-room', {
      roomKey,
      user: {
        userId: user.id || user.userId,
        username: user.username,
      },
    })

    // Listen for user joined
    const handleUserJoined = ({ userId, username }) => {
      setMembers((prev) => {
        // Check if user already exists
        if (prev.some(m => m.userId === userId)) return prev
        return [...prev, { userId, username, joinedAt: new Date() }]
      })
    }

    // Listen for user left
    const handleUserLeft = ({ userId }) => {
      setMembers((prev) => prev.filter(m => m.userId !== userId))
    }

    // Listen for new messages
    const handleNewMessage = () => {
      setMessageCount((prev) => prev + 1)
    }

    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)
    socket.on('receive-message', handleNewMessage)

    return () => {
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
      socket.off('receive-message', handleNewMessage)
      
      // Leave room when component unmounts
      socket.emit('leave-room', {
        roomKey,
        userId: user.id || user.userId,
      })
    }
  }, [socket, roomKey, user])

  const loadRoomData = async () => {
    try {
      setLoading(true)
      const response = await roomAPI.getByKey(roomKey)
      if (response.room) {
        setRoom(response.room)
        setRoomName(response.room.name || response.room.roomName || '')
        setIsPublic(response.room.isPublic || false)
        setMembers(response.room.participants || [])
        setMessageCount(response.room.messageCount || 0)
      }
    } catch (error) {
      console.error('Failed to load room:', error)
      alert('Room not found or access denied')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    try {
      setSaving(true)
      // TODO: Implement room update API
      alert('Room settings updated successfully!')
    } catch (error) {
      console.error('Failed to update room:', error)
      alert('Failed to update room settings')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveMember = (memberId) => {
    if (confirm('Remove this member from the room?')) {
      // TODO: Implement remove member API
      setMembers(members.filter(m => m.userId !== memberId))
    }
  }

  const handleDeleteRoom = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete the room and all messages. Continue?')) {
      return
    }

    try {
      setLoading(true)
      
      // Call API to delete room
      const response = await roomAPI.delete(roomKey, user?.id || user?.userId)
      
      if (response.success) {
        // Emit socket event to notify all users in the room
        if (socket) {
          socket.emit('room-deleted', { roomKey })
        }
        
        alert('✅ Room deleted successfully')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Failed to delete room:', error)
      alert('❌ Failed to delete room. You must be the room creator.')
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleOpenChat = () => {
    navigate(`/room/${roomKey}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-mono text-primary animate-pulse">Loading Control Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-background-dark text-white font-mono"
      style={{
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Scanline Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(0deg, transparent 50%, rgba(255, 255, 255, 0.05) 50%)',
          backgroundSize: '100% 4px',
          animation: 'scan 10s linear infinite'
        }}
      />
      
      <div className="relative mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white pb-4 mb-8">
          <div className="flex items-center gap-3 text-white">
            <span className="material-symbols-outlined text-primary text-2xl">key</span>
            <h2 className="font-display text-2xl font-bold uppercase tracking-widest">ENP</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center border border-white px-4 py-2">
              <span className="material-symbols-outlined text-primary mr-2">key</span>
              <span className="font-mono text-sm tracking-wider">{roomKey}</span>
            </div>
            <button 
              onClick={handleBackToDashboard}
              className="px-4 py-2 border border-white/50 hover:border-primary hover:text-primary transition-colors"
            >
              [BACK]
            </button>
          </div>
        </header>

        {/* Page Title */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="font-display text-4xl font-black uppercase tracking-wider">
            ROOM CONTROL PANEL
          </h1>
          <p className="text-white/80 text-base">
            Modify access levels, view members, and manage chat parameters.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Info Panel */}
          <div className="border border-white flex flex-col gap-6 p-6 lg:col-span-1">
            <h3 className="font-display text-xl font-bold uppercase tracking-widest text-primary">
              1/ ROOM INFO
            </h3>
            
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <p className="text-sm font-medium uppercase tracking-wider text-white/80">
                  Room Name
                </p>
                <input 
                  className="w-full p-3 text-base bg-transparent border border-white text-white focus:outline-none focus:border-primary focus:shadow-[0_0_5px_#00FFFF] transition-all"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                />
              </label>
              
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium uppercase tracking-wider text-white/80">
                  Room Type
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className={!isPublic ? 'text-primary' : 'text-white/50'}>PRIVATE</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-5 w-9 border border-white bg-transparent after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:border after:border-white after:bg-white after:transition-all peer-checked:bg-primary peer-checked:border-primary peer-checked:after:translate-x-full"></div>
                  </label>
                  <span className={isPublic ? 'text-primary' : 'text-white/50'}>PUBLIC</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/50 pt-4 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <p className="text-white/80">Created At</p>
                <p className="text-white">
                  {room?.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-white/80">Members</p>
                <p className="text-white">{members.length.toString().padStart(2, '0')}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-white/80">Messages</p>
                <p className="text-white">{messageCount.toString().padStart(2, '0')}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="w-full p-3 bg-transparent border border-primary text-primary hover:bg-primary hover:text-background-dark transition-all shadow-[0_0_2px_#00FFFF,inset_0_0_2px_#00FFFF] hover:shadow-[0_0_8px_#00FFFF,0_0_16px_#00FFFF] disabled:opacity-50"
              >
                {saving ? 'SAVING...' : '[SAVE CHANGES]'}
              </button>
              <button 
                onClick={handleOpenChat}
                className="w-full p-3 bg-transparent border border-white text-white hover:bg-white hover:text-background-dark transition-all"
              >
                [OPEN CHAT]
              </button>
              <button 
                onClick={handleDeleteRoom}
                className="w-full p-3 bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                [DELETE ROOM]
              </button>
            </div>
          </div>

          {/* Access Control Panel */}
          <div className="border border-white flex flex-col gap-6 p-6 lg:col-span-2">
            <h3 className="font-display text-xl font-bold uppercase tracking-widest text-primary">
              2/ ACCESS CONTROL
            </h3>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b border-white/50 pb-2 text-sm uppercase tracking-wider text-white/80">
              <div className="col-span-5">User</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-4 text-right">Actions</div>
            </div>

            {/* Member List */}
            <div className="flex flex-col divide-y divide-white/20 max-h-96 overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-white/40 text-center py-8">No members yet</p>
              ) : (
                members.map((member, index) => (
                  <div key={member.userId || index} className="grid grid-cols-12 gap-4 items-center py-3">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="size-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-sm font-bold">
                        {member.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-white font-medium">{member.username || 'Unknown'}</p>
                        <p className="text-white/50 text-xs font-mono">{member.userId}</p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <select className="w-full bg-transparent border border-white/30 text-white px-2 py-1 text-sm focus:outline-none focus:border-primary">
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </div>
                    <div className="col-span-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleRemoveMember(member.userId)}
                        className="px-3 py-1 bg-transparent border border-red-500/50 text-red-500 text-sm hover:bg-red-500 hover:text-white transition-all"
                      >
                        [REMOVE]
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Statistics */}
            <div className="border-t border-white/50 pt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{members.length}</p>
                <p className="text-xs text-white/60 uppercase">Total Members</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{room?.maxParticipants || 10}</p>
                <p className="text-xs text-white/60 uppercase">Max Capacity</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{messageCount}</p>
                <p className="text-xs text-white/60 uppercase">Messages Sent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default RoomControl
