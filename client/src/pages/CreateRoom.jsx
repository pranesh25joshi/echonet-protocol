import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roomAPI } from '../utils/api'

const CreateRoom = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    roomName: '',
    roomType: 'Game',
    timeLimit: '',
    timeLimitUnit: 'min',
    maxParticipants: 10,
    isPublic: false,
    enableXP: false,
  })
  const [generatedKey, setGeneratedKey] = useState(null)
  const [loading, setLoading] = useState(false)

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/onboarding')
    }
  }, [user, authLoading, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleGenerateKey = async () => {
    // Check authentication before creating room
    if (!user) {
      alert('Please login or continue as guest first')
      navigate('/onboarding')
      return
    }

    setLoading(true)
    try {
      const response = await roomAPI.create({
        ...formData,
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : 0,
        creator: user.userId || user.id,
      })
      setGeneratedKey(response.accessKey)
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey)
    alert('Access key copied to clipboard!')
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
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/20 px-6 sm:px-10 py-4">
        <div className="flex items-center gap-3 text-white">
          <span className="material-symbols-outlined text-primary text-2xl">key</span>
          <h2 className="text-white text-xl font-display font-bold tracking-widest">ENP</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Dashboard"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Home"
          >
            <span className="material-symbols-outlined text-base">home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 justify-center items-center py-10 px-4">
        <div className="w-full max-w-4xl">
          {/* Configuration Terminal */}
          <div className="border border-white/50 p-6 sm:p-8 space-y-8">
            <h3 className="text-primary tracking-widest text-xl sm:text-2xl font-display font-bold text-center">
              &gt; ROOM CONFIGURATION TERMINAL
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Name */}
              <div className="flex flex-col border border-white/30 p-4">
                <label className="text-white text-sm font-display font-bold tracking-wider pb-2" htmlFor="roomName">
                  ROOM NAME
                </label>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-0 focus:ring-0 border border-white/50 bg-black focus:border-primary h-12 placeholder:text-white/40 px-3 text-base font-body"
                  id="roomName"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleInputChange}
                  placeholder="Enter designation..."
                  type="text"
                />
                <p className="text-white/50 text-xs mt-2 font-body">Identifier for this session.</p>
              </div>

              {/* Room Type */}
              <div className="flex flex-col border border-white/30 p-4">
                <label className="text-white text-sm font-display font-bold tracking-wider pb-2" htmlFor="roomType">
                  ROOM TYPE
                </label>
                <select
                  className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-0 focus:ring-0 border border-white/50 bg-black focus:border-primary h-12 px-3 text-base font-body"
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                >
                  <option>Game</option>
                  <option>Private</option>
                  <option>Group</option>
                  <option>Broadcast</option>
                  <option>Timed</option>
                </select>
                <p className="text-white/50 text-xs mt-2 font-body">Select operational mode.</p>
              </div>

              {/* Time Limit */}
              <div className="flex flex-col border border-white/30 p-4">
                <label className="text-white text-sm font-display font-bold tracking-wider pb-2" htmlFor="timeLimit">
                  TIME LIMIT (IF ANY)
                </label>
                <div className="flex">
                  <input
                    className="form-input w-2/3 flex-1 resize-none overflow-hidden text-white focus:outline-0 focus:ring-0 border border-white/50 bg-black focus:border-primary h-12 placeholder:text-white/40 px-3 text-base font-body"
                    id="timeLimit"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    placeholder="e.g., 30"
                    type="number"
                  />
                  <select
                    className="form-select w-1/3 flex-1 resize-none overflow-hidden text-white focus:outline-0 focus:ring-0 border border-l-0 border-white/50 bg-black focus:border-primary h-12 px-3 text-base font-body"
                    name="timeLimitUnit"
                    value={formData.timeLimitUnit}
                    onChange={handleInputChange}
                  >
                    <option>min</option>
                    <option>hr</option>
                  </select>
                </div>
                <p className="text-white/50 text-xs mt-2 font-body">Set session duration. 0 for infinite.</p>
              </div>

              {/* Max Participants */}
              <div className="flex flex-col border border-white/30 p-4">
                <label className="text-white text-sm font-display font-bold tracking-wider pb-2" htmlFor="maxParticipants">
                  MAX PARTICIPANTS
                </label>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-0 focus:ring-0 border border-white/50 bg-black focus:border-primary h-12 placeholder:text-white/40 px-3 text-base font-body"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  max="50"
                  min="2"
                  placeholder="2-50"
                  type="number"
                />
                <p className="text-white/50 text-xs mt-2 font-body">Define connection capacity.</p>
              </div>

              {/* Room Visibility */}
              <div className="flex flex-col border border-white/30 p-4 justify-between">
                <label className="text-white text-sm font-display font-bold tracking-wider">ROOM VISIBILITY</label>
                <div className="flex items-center gap-4 mt-2">
                  <span className="font-body text-white/70">Private</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      className="sr-only peer"
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-black border border-white/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-checked:bg-primary peer-checked:border-primary peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                  <span className="font-body text-white/70">Public</span>
                </div>
                <p className="text-white/50 text-xs mt-2 font-body">Public rooms are discoverable.</p>
              </div>

              {/* Enable XP System */}
              <div className="flex flex-col border border-white/30 p-4 justify-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    className="form-checkbox bg-black border-white/50 text-primary h-5 w-5 focus:ring-primary focus:ring-offset-black"
                    type="checkbox"
                    name="enableXP"
                    checked={formData.enableXP}
                    onChange={handleInputChange}
                  />
                  <span className="text-white text-sm font-display font-bold tracking-wider">ENABLE XP SYSTEM</span>
                </label>
                <p className="text-white/50 text-xs mt-2 font-body">Track and award points for participation.</p>
              </div>
            </div>

            {/* Action Buttons */}
            {!generatedKey ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <button
                  onClick={handleGenerateKey}
                  disabled={loading}
                  className="btn-primary w-full sm:w-auto py-3 px-8"
                >
                  {loading ? '[ GENERATING... ]' : '[ GENERATE ACCESS KEY ]'}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="btn-secondary w-full sm:w-auto py-3 px-8"
                >
                  [ CANCEL ]
                </button>
              </div>
            ) : (
              /* Result Module */
              <div className="border border-primary/50 p-6 sm:p-8 space-y-6 text-center">
                <div className="font-body text-primary/80 space-y-1">
                  <p>&gt; Initializing Room...</p>
                  <p>&gt; Generating Key...</p>
                  <p className="text-primary">&gt; Success <span className="text-green-400">✅</span></p>
                </div>
                <div className="py-4">
                  <p className="text-white/70 text-sm font-display tracking-wider">ACCESS KEY:</p>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <p className="text-primary text-2xl sm:text-3xl font-bold font-body tracking-widest terminal-text">
                      {generatedKey}
                    </p>
                    <button
                      onClick={copyToClipboard}
                      className="text-white/80 hover:text-primary transition-colors"
                      aria-label="Copy access key"
                    >
                      <span className="material-symbols-outlined">content_copy</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate(`/room/${generatedKey}`)}
                    className="btn-primary w-full py-3 px-6"
                  >
                    [ ENTER ROOM ]
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedKey(null)
                      navigate('/')
                    }}
                    className="btn-secondary w-full py-3 px-6"
                  >
                    [ CREATE ANOTHER ]
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default CreateRoom
