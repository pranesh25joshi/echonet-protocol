import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LandingPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout()
      alert('Logged out successfully!')
    }
  }

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8">
      {/* Top NavBar */}
      <header className="w-full max-w-7xl mx-auto border-b border-white/20">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3 text-white">
            <span className="material-symbols-outlined text-primary text-2xl">key</span>
            <a className="font-mono text-lg font-bold tracking-widest" href="#">
              ENP
            </a>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-1.5 rounded">
                  <span className="material-symbols-outlined text-primary text-sm">
                    {user.isGuest ? 'person_outline' : 'account_circle'}
                  </span>
                  <span className="text-white text-sm font-mono">
                    {user.username}
                  </span>
                  {!user.isGuest && (
                    <span className="text-primary text-xs font-mono bg-primary/10 px-1.5 py-0.5 rounded">
                      REG
                    </span>
                  )}
                </div>

                {/* Dashboard Button */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:block border border-white/30 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 text-xs font-mono tracking-wider transition-all rounded"
                >
                  DASHBOARD
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 text-xs font-mono tracking-wider transition-all rounded flex items-center gap-1"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span className="hidden sm:inline">LOGOUT</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/onboarding')}
                className="border border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-1.5 text-xs font-mono tracking-wider transition-all rounded"
              >
                LOGIN / REGISTER
              </button>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 w-full max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center gap-6 py-16">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-wider uppercase">
                ECHO NET PROTOCOL
              </h1>
              {/* <span className="text-primary text-5xl md:text-7xl lg:text-8xl font-display font-bold blinking-cursor">
                _
              </span> */}
            </div>
            <h2 className="text-white/80 text-sm md:text-base font-mono tracking-[0.2em] uppercase">
              THE KEY-BASED REAL-TIME COMMUNICATION NETWORK
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-8">
            <button
              onClick={() => navigate('/create-room')}
              className="btn-primary font-mono text-sm tracking-widest py-3 px-6"
            >
              <span className="truncate">[ CREATE ROOM ]</span>
            </button>
            <button
              onClick={() => navigate('/join-room')}
              className="btn-secondary font-mono text-sm tracking-widest py-3 px-6"
            >
              <span className="truncate">[ JOIN ROOM ]</span>
            </button>
          </div>
        </div>

        {/* Information Band */}
        <div className="w-full py-6">
          <div className="flex items-center justify-center gap-3 text-white/60 font-mono text-xs sm:text-sm tracking-wider">
            <span className="text-primary">&gt;_</span>
            <h4>Spin up a room. Share the key. Connect instantly — no accounts, no friction.</h4>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto pt-8">
        <div className="border-t border-white/20 text-center py-4">
          <p className="text-white/50 text-xs font-mono tracking-widest">
            © 2025 ECHONET PROTOCOL | BUILT FOR BUILDERS
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
