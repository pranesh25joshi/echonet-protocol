import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { roomAPI } from '../utils/api'

const ChatRoom = () => {
  const { roomKey } = useParams()
  const navigate = useNavigate()
  const { socket, connected } = useSocket()
  const { user, createGuestUser, loading: authLoading } = useAuth()
  
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [participants, setParticipants] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [typingUsers, setTypingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [showNukeAnimation, setShowNukeAnimation] = useState(false)
  const [nukePhase, setNukePhase] = useState(0) // 0: warning, 1: countdown, 2: explosion, 3: fade
  
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Check if user is authenticated, redirect to onboarding if not
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/onboarding')
    }
  }, [user, authLoading, navigate])

  // Calculate time remaining
  useEffect(() => {
    if (!room?.expiresAt) return

    const calculateTimeRemaining = () => {
      const now = new Date()
      const expiresAt = new Date(room.expiresAt)
      const diff = expiresAt - now

      if (diff <= 0) {
        setTimeRemaining('EXPIRED')
        // Trigger TV shutdown sequence
        setShowNukeAnimation(true)
        setNukePhase(0) // Glitch effect
        
        // Simple sequence: 3 seconds glitch → TV shutdown → redirect
        setTimeout(() => setNukePhase(1), 3000)  // TV closing effect
        setTimeout(() => navigate('/dashboard'), 3500) // Navigate after TV closes
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      // Start glitch effect when 3 seconds remaining
      if (diff <= 3000 && !showNukeAnimation) {
        setShowNukeAnimation(true)
        setNukePhase(0)
      }

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${seconds}s`)
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [room, navigate])

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load room data
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const response = await roomAPI.getByKey(roomKey)
        if (response.success) {
          setRoom(response.room)
          
          // Load messages
          const messagesResponse = await roomAPI.getMessages(roomKey)
          if (messagesResponse.success) {
            setMessages(messagesResponse.messages)
          }
        } else {
          navigate('/access-denied')
        }
      } catch (error) {
        console.error('Error loading room:', error)
        navigate('/access-denied')
      } finally {
        setLoading(false)
      }
    }

    loadRoom()
  }, [roomKey, navigate])

  // Join room via socket
  useEffect(() => {
    if (!socket || !connected || !room || !user) return

    console.log('🔌 Joining room via socket:', roomKey)

    socket.emit('join-room', {
      roomKey,
      user: {
        userId: user.id || user.userId,
        username: user.username,
      },
    })

    // Cleanup on unmount
    return () => {
      console.log('👋 Leaving room:', roomKey)
      if (user) {
        socket.emit('leave-room', {
          roomKey,
          userId: user.id || user.userId,
        })
      }
    }
  }, [socket, connected, room, roomKey, user])

  // Set up socket listeners (separate from join/leave logic)
  useEffect(() => {
    if (!socket) return

    console.log('👂 Setting up socket listeners')

    // Listen for room joined confirmation
    const handleRoomJoined = ({ participants: roomParticipants, messages: roomMessages }) => {
      console.log('🏠 Room joined, participants:', roomParticipants?.length, 'messages:', roomMessages?.length)
      
      // Replace participants list entirely with server's authoritative list
      setParticipants(roomParticipants || [])
      
      // Set messages from socket if available (includes all existing messages)
      if (roomMessages && roomMessages.length > 0) {
        setMessages(roomMessages)
        setTimeout(scrollToBottom, 100)
      }
    }

    // Listen for new messages
    const handleReceiveMessage = (message) => {
      console.log('📨 Received message:', message)
      
      setMessages((prev) => {
        // Check if this message already exists (avoid duplicates from optimistic updates)
        // Check by content, userId, and timestamp (within 2 seconds)
        const isDuplicate = prev.some(m => 
          m.userId === message.userId && 
          m.content === message.content &&
          Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) < 2000
        )
        
        if (isDuplicate) {
          console.log('🔄 Replacing optimistic message with server message')
          // Replace temp message with real one (has database ID)
          return prev.map(m => 
            (m.userId === message.userId && 
             m.content === message.content &&
             Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) < 2000)
            ? message 
            : m
          )
        }
        
        console.log('✅ Adding new message from other user')
        // Not a duplicate, add it
        return [...prev, message]
      })
      scrollToBottom()
    }

    // Listen for user joined
    const handleUserJoined = ({ userId, username }) => {
      console.log('👤 User joined:', username, userId)
      
      // Check if user already exists before adding (prevent duplicates)
      setParticipants((prev) => {
        const exists = prev.some(p => p.userId === userId)
        if (exists) {
          console.log('⚠️ User already in participants list, skipping')
          return prev
        }
        console.log('✅ Adding new participant')
        return [...prev, { userId, username }]
      })
      
      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          messageType: 'system',
          content: `${username} joined the room`,
          timestamp: new Date(),
        },
      ])
    }

    // Listen for user left
    const handleUserLeft = ({ userId }) => {
      console.log('👋 User left:', userId)
      setParticipants((prev) => prev.filter((p) => p.userId !== userId))
    }

    // Listen for typing
    const handleUserTyping = ({ username, isTyping }) => {
      if (isTyping) {
        setTypingUsers((prev) => [...new Set([...prev, username])])
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== username))
      }
    }

    // Listen for timer updates
    const handleTimerUpdated = ({ expiresAt, additionalMinutes, message }) => {
      console.log('⏰ Timer updated:', message)
      setRoom((prev) => ({
        ...prev,
        expiresAt: expiresAt,
      }))
      
      // Show system message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          messageType: 'system',
          content: `⏰ ${message}`,
          timestamp: new Date(),
        },
      ])
    }

    // Listen for room deletion
    const handleRoomDeleted = ({ message }) => {
      console.log('🗑️ Room deleted:', message)
      
      // Show alert to user
      alert('⚠️ This room has been deleted by the creator. You will be redirected to the dashboard.')
      
      // Redirect to dashboard
      navigate('/dashboard')
    }

    // Attach all listeners
    socket.on('room-joined', handleRoomJoined)
    socket.on('receive-message', handleReceiveMessage)
    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)
    socket.on('user-typing', handleUserTyping)
    socket.on('timer-updated', handleTimerUpdated)
    socket.on('room-deleted-notification', handleRoomDeleted)

    // Cleanup all listeners
    return () => {
      console.log('🧹 Cleaning up socket listeners')
      socket.off('room-joined', handleRoomJoined)
      socket.off('receive-message', handleReceiveMessage)
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
      socket.off('user-typing', handleUserTyping)
      socket.off('timer-updated', handleTimerUpdated)
      socket.off('room-deleted-notification', handleRoomDeleted)
    }
  }, [socket, navigate])

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !socket || !user) return

    const messageContent = messageInput.trim()
    const tempId = `temp_${Date.now()}_${Math.random()}`
    
    // Optimistically add message to local state immediately
    const optimisticMessage = {
      id: tempId,
      userId: user.id || user.userId,
      username: user.username,
      content: messageContent,
      timestamp: new Date(),
      messageType: 'text',
    }
    
    console.log('📤 Sending message (optimistic):', optimisticMessage)
    setMessages((prev) => [...prev, optimisticMessage])
    setMessageInput('')
    
    // Emit to server for persistence and broadcasting to others
    socket.emit('send-message', {
      roomKey,
      userId: user.id || user.userId,
      username: user.username,
      content: messageContent,
    })
    
    // Stop typing indicator
    socket.emit('typing', { roomKey, username: user.username, isTyping: false })
  }

  // Handle typing
  const handleTyping = (e) => {
    setMessageInput(e.target.value)

    if (!socket || !user) return

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Emit typing start
    socket.emit('typing', { roomKey, username: user.username, isTyping: true })

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { roomKey, username: user.username, isTyping: false })
    }, 1000)
  }

  // Copy room key
  const copyRoomKey = () => {
    navigator.clipboard.writeText(roomKey)
    alert('Room key copied to clipboard!')
  }

  // Navigate to room control
  const goToRoomControl = () => {
    navigate(`/room-control/${roomKey}`)
  }

  // Extend room timer (admin only)
  const handleExtendTimer = async () => {
    const minutes = prompt('Enter additional minutes to extend the room timer:', '30')
    if (!minutes || isNaN(minutes) || parseInt(minutes) <= 0) {
      return
    }

    try {
      const response = await roomAPI.extendTimer(roomKey, parseInt(minutes), user?.id || user?.userId)
      if (response.success) {
        // Update room state with new expiry
        setRoom(prev => ({
          ...prev,
          expiresAt: response.expiresAt,
          timeLimit: response.timeLimit
        }))
        
        // Emit socket event to notify all participants
        if (socket) {
          socket.emit('timer-extended', {
            roomKey,
            expiresAt: response.expiresAt,
            additionalMinutes: parseInt(minutes)
          })
        }
        
        alert(`✅ Timer extended by ${minutes} minutes!`)
      }
    } catch (error) {
      console.error('Failed to extend timer:', error)
      alert('❌ Failed to extend timer. Only the room creator can extend the timer.')
    }
  }

  // Check if current user is the room creator
  const isRoomCreator = room?.creator === (user?.id || user?.userId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="text-center">
          <div className="text-primary text-xl font-mono animate-pulse">
            &gt; INITIALIZING SECURE CHANNEL...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-dark text-white">
      {/* Top Bar */}
      <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-white/20 px-3 sm:px-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 overflow-hidden">
          <span className="material-symbols-outlined text-primary text-xl hidden sm:inline flex-shrink-0">key</span>
          <h2 className="text-sm sm:text-lg font-bold tracking-wider truncate">{room?.roomName || roomKey}</h2>
          <button
            onClick={copyRoomKey}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white flex-shrink-0"
            title="Copy room key"
          >
            <span className="material-symbols-outlined text-base">content_copy</span>
          </button>
        </div>

        {/* Timer Display - Separate group */}
        {timeRemaining && (
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded border font-mono text-xs sm:text-sm whitespace-nowrap ${
              timeRemaining === 'EXPIRED' 
                ? 'bg-red-500/20 border-red-500 text-red-400' 
                : timeRemaining.includes('s') && !timeRemaining.includes('m')
                ? 'bg-orange-500/20 border-orange-500 text-orange-400 animate-pulse'
                : 'bg-primary/20 border-primary/50 text-primary'
            }`}>
              <span className="material-symbols-outlined text-sm sm:text-base">schedule</span>
              <span className="hidden sm:inline">{timeRemaining === 'EXPIRED' ? 'ROOM EXPIRED' : timeRemaining}</span>
              <span className="sm:hidden">{timeRemaining === 'EXPIRED' ? 'EXP' : timeRemaining}</span>
            </div>
            {/* Extend Timer Button - Only for admin and when not expired */}
            {isRoomCreator && timeRemaining !== 'EXPIRED' && (
              <button
                onClick={handleExtendTimer}
                className="flex items-center justify-center h-8 w-8 bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 transition-all rounded flex-shrink-0"
                title="Extend timer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
              </button>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Room Control Button - Only for room creator */}
          {isRoomCreator && (
            <button
              onClick={goToRoomControl}
              className="flex items-center gap-2 h-8 sm:h-9 px-2 sm:px-4 bg-primary/10 border border-primary/50 text-primary font-bold text-xs sm:text-sm tracking-wider hover:bg-primary/20 hover:border-primary transition-all"
              title="Room Control Panel"
            >
              <span className="material-symbols-outlined text-base">settings</span>
              <span className="hidden md:inline">[CONTROL]</span>
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white flex-shrink-0"
            title="Back to dashboard"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white flex-shrink-0"
            title="Leave room"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-60px)] flex-1">
        {/* Left Sidebar - Participants (Hidden on mobile, visible on tablet+) */}
        <aside className="hidden lg:flex w-[280px] flex-shrink-0 flex-col border-r border-white/20">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="material-symbols-outlined text-lg text-primary">tag</span>
                  <p className="text-base font-medium">{roomKey}</p>
                </div>
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="material-symbols-outlined text-lg text-primary">lock</span>
                  <p className="text-base font-medium">
                    Room Status: <span className="text-white/80">{room?.isPublic ? 'Public' : 'Private'}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="px-3 text-sm font-bold uppercase tracking-widest text-white/50">
                  Online Users ({participants.length})
                </h3>
                <div className="flex flex-col gap-1">
                  {participants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                    >
                      <div className="relative flex h-8 w-8 items-center justify-center">
                        <div className="bg-gradient-to-br from-primary to-secondary aspect-square bg-cover rounded-full size-8 flex items-center justify-center text-xs font-bold">
                          {participant.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background-dark bg-primary shadow-[0_0_5px_#00FFFF]"></div>
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{participant.username}</p>
                          {participant.userId === room?.creator && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-400/50 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current User Info */}
            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
              <div className="bg-gradient-to-br from-primary to-secondary aspect-square bg-cover rounded-full size-10 flex items-center justify-center text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-medium leading-normal">{user?.username}</h1>
                <p className="text-sm font-normal leading-normal text-white/60">Mission Control</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Chat Window */}
        <main className="flex flex-1 flex-col">
          {/* Messages */}
          <div className="flex flex-1 flex-col overflow-y-auto p-3 sm:p-6">
            {/* Messages List */}
            {messages.map((message) => {
              const isOwnMessage = message.userId === (user?.id || user?.userId)
              const isSystemMessage = message.messageType === 'system'
              const isAdmin = message.userId === room?.creator

              if (isSystemMessage) {
                return (
                  <div key={message.id} className="flex justify-center p-2">
                    <p className="text-white/40 text-xs font-mono italic">
                      {message.content}
                    </p>
                  </div>
                )
              }

              return isOwnMessage ? (
                // Own Message (Right)
                <div key={message.id} className="flex items-end gap-2 sm:gap-3 p-2 sm:p-4 justify-end">
                  <div className="flex flex-1 flex-col gap-1 items-end">
                    <div className="flex items-center gap-2">
                      <p className="text-white/60 text-[11px] sm:text-[13px] font-normal leading-normal text-right">
                        You
                      </p>
                      {isAdmin && (
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-400/50 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm sm:text-base font-normal leading-normal flex max-w-[280px] sm:max-w-[360px] rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-primary/20 text-white break-words whitespace-pre-wrap overflow-wrap-anywhere">
                        {message.content}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-white/40 font-mono">
                        {formatTime(message.createdAt || message.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-primary to-secondary aspect-square bg-cover rounded-full w-8 sm:w-10 h-8 sm:h-10 shrink-0 flex items-center justify-center text-xs font-bold">
                    {message.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                // Other's Message (Left)
                <div key={message.id} className="flex items-end gap-2 sm:gap-3 p-2 sm:p-4">
                  <div className="bg-gradient-to-br from-primary to-secondary aspect-square bg-cover rounded-full w-8 sm:w-10 h-8 sm:h-10 shrink-0 flex items-center justify-center text-xs font-bold">
                    {message.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 items-start">
                    <div className="flex items-center gap-2">
                      <p className="text-white/60 text-[11px] sm:text-[13px] font-normal leading-normal">
                        {message.username}
                      </p>
                      {isAdmin && (
                        <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-400/50 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm sm:text-base font-normal leading-normal flex max-w-[280px] sm:max-w-[360px] rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-[#223649] text-white break-words whitespace-pre-wrap overflow-wrap-anywhere">
                        {message.content}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-white/40 font-mono">
                        {formatTime(message.createdAt || message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-end gap-2 sm:gap-3 p-2 sm:p-4">
                <div className="bg-gradient-to-br from-primary to-secondary aspect-square bg-cover rounded-full w-8 sm:w-10 h-8 sm:h-10 shrink-0 flex items-center justify-center text-xs font-bold">
                  {typingUsers[0].charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-1 flex-col gap-1 items-start">
                  <p className="text-white/60 text-[11px] sm:text-[13px] font-normal leading-normal max-w-[280px] sm:max-w-[360px]">
                    {typingUsers[0]} is typing...
                  </p>
                  <div className="flex max-w-[280px] sm:max-w-[360px] rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-[#223649] text-white">
                    <div className="typing-indicator flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-white/80"></span>
                      <span className="h-2 w-2 rounded-full bg-white/80"></span>
                      <span className="h-2 w-2 rounded-full bg-white/80"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-scroll reference */}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Bar */}
          <div className="flex-shrink-0 p-3 sm:p-6 pt-2 sm:pt-4">
            <form onSubmit={handleSendMessage}>
              <div className="flex items-center gap-2 sm:gap-4 rounded-lg border border-white/20 bg-background-dark p-1 focus-within:border-primary focus-within:shadow-[0_0_10px_theme(colors.primary)] transition-all">
                <span className="pl-2 sm:pl-3 font-mono text-primary text-sm sm:text-base">&gt;</span>
                <input
                  className="flex-1 border-none bg-transparent py-2 sm:py-3 text-sm sm:text-base text-white placeholder-white/40 focus:ring-0 focus:outline-none"
                  placeholder="Type your message here..."
                  type="text"
                  value={messageInput}
                  onChange={handleTyping}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="flex h-8 sm:h-10 cursor-pointer items-center justify-center rounded-md bg-primary/80 px-3 sm:px-4 text-xs sm:text-sm font-bold text-background-dark transition-colors hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">[ENTER]</span>
                  <span className="sm:hidden material-symbols-outlined text-base">send</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Screen Glitch & TV Shutdown Effect */}
      {showNukeAnimation && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Phase 0: Screen Glitch Effect (3 seconds) */}
          {nukePhase === 0 && (
            <>
              {/* Glitch Overlay on Chat Screen */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'rgba(0, 255, 255, 0.1)',
                animation: 'screen-shake 0.1s infinite, color-glitch 0.15s infinite',
                mixBlendMode: 'screen'
              }}></div>

              {/* Scanlines */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
                animation: 'scanlines 0.08s linear infinite'
              }}></div>

              {/* Random Pixel Blocks */}
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    width: `${50 + Math.random() * 100}px`,
                    height: `${20 + Math.random() * 40}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    background: `rgba(0, 255, 255, ${0.2 + Math.random() * 0.3})`,
                    animation: `glitch-block ${0.1 + Math.random() * 0.2}s infinite`,
                    animationDelay: `${Math.random() * 0.3}s`,
                    mixBlendMode: 'screen'
                  }}
                ></div>
              ))}

              {/* RGB Split Effect */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(90deg, rgba(255,0,0,0.1) 0%, rgba(0,255,0,0.1) 50%, rgba(0,0,255,0.1) 100%)',
                animation: 'rgb-split 0.2s infinite',
                mixBlendMode: 'screen'
              }}></div>
            </>
          )}

          {/* Phase 1: Old TV Shutdown Effect */}
          {nukePhase === 1 && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              {/* TV Screen Collapse */}
              <div className="absolute inset-0 bg-white" style={{
                animation: 'tv-shutdown 0.5s ease-in forwards'
              }}></div>

              {/* Center White Line (old TV effect) */}
              <div className="absolute left-0 right-0 h-1 bg-white" style={{
                top: '50%',
                animation: 'tv-line-fade 0.5s ease-in forwards',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
              }}></div>
            </div>
          )}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-3px, 2px); }
          20% { transform: translate(3px, -2px); }
          30% { transform: translate(-2px, -3px); }
          40% { transform: translate(2px, 3px); }
          50% { transform: translate(-3px, -2px); }
          60% { transform: translate(3px, 2px); }
          70% { transform: translate(-2px, 3px); }
          80% { transform: translate(2px, -3px); }
          90% { transform: translate(-3px, 3px); }
        }

        @keyframes color-glitch {
          0% { filter: hue-rotate(0deg) brightness(1); }
          20% { filter: hue-rotate(90deg) brightness(1.2); }
          40% { filter: hue-rotate(180deg) brightness(0.8); }
          60% { filter: hue-rotate(270deg) brightness(1.3); }
          80% { filter: hue-rotate(360deg) brightness(0.9); }
          100% { filter: hue-rotate(0deg) brightness(1); }
        }

        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }

        @keyframes glitch-block {
          0%, 100% { opacity: 0; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(${Math.random() > 0.5 ? '' : '-'}${5 + Math.random() * 10}px); }
        }

        @keyframes rgb-split {
          0%, 100% { transform: translateX(0); opacity: 0.3; }
          25% { transform: translateX(-3px); opacity: 0.5; }
          50% { transform: translateX(3px); opacity: 0.7; }
          75% { transform: translateX(-2px); opacity: 0.4; }
        }

        @keyframes tv-shutdown {
          0% {
            clip-path: inset(0% 0% 0% 0%);
            opacity: 1;
            filter: brightness(1.5);
          }
          50% {
            clip-path: inset(0% 0% 0% 0%);
            opacity: 0.8;
            filter: brightness(2);
          }
          80% {
            clip-path: inset(40% 0% 40% 0%);
            opacity: 0.5;
            filter: brightness(3);
          }
          95% {
            clip-path: inset(49.5% 0% 49.5% 0%);
            opacity: 0.2;
            filter: brightness(5);
          }
          100% {
            clip-path: inset(50% 0% 50% 0%);
            opacity: 0;
            filter: brightness(10);
          }
        }

        @keyframes tv-line-fade {
          0% {
            width: 100%;
            opacity: 1;
          }
          70% {
            width: 100%;
            opacity: 0.8;
          }
          100% {
            width: 0%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default ChatRoom
