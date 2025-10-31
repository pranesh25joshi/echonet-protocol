import { useNavigate } from 'react-router-dom'

const AccessDenied = () => {
  const navigate = useNavigate()

  return (
    <div className="relative flex h-screen min-h-[700px] w-full flex-col overflow-hidden bg-background-dark">
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="text-center space-y-6 max-w-2xl">
          {/* Error Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <span className="material-symbols-outlined text-[120px] text-red-500 animate-pulse">lock</span>
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-red-500 text-4xl md:text-6xl font-display font-bold tracking-wider uppercase mb-4">
            ACCESS BLOCKED
          </h1>
          
          <div className="font-mono text-red-400/80 space-y-2 text-sm md:text-base">
            <p className="animate-pulse">&gt; ERROR: INVALID KEY</p>
            <p>&gt; AUTHENTICATION FAILED</p>
            <p>&gt; ACCESS DENIED TO SECURE CHANNEL</p>
          </div>

          <p className="text-white/60 text-lg mt-8">
            The key you entered is invalid, expired, or has been revoked.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button
              onClick={() => navigate('/join-room')}
              className="btn-primary py-3 px-8"
            >
              [ TRY AGAIN ]
            </button>
            <button
              onClick={() => navigate('/create-room')}
              className="btn-secondary py-3 px-8"
            >
              [ CREATE NEW ROOM ]
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary py-3 px-8"
            >
              [ GO HOME ]
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
