import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Onboarding = () => {
  const navigate = useNavigate()
  const { createGuestUser, registerUser, loginUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState(null) // 'guest', 'register', or 'login'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleGuestMode = async () => {
    try {
      setLoading(true)
      setMode('guest')
      await createGuestUser()
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Failed to create guest user:', error)
      setLoading(false)
    }
  }

  const handleRegisterMode = () => {
    setMode('register')
  }

  const handleLoginMode = () => {
    setMode('login')
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!username.trim()) {
      alert('Please enter a username')
      return
    }
    if (!password) {
      alert('Please enter a password')
      return
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      await registerUser(username.trim(), password, email.trim() || undefined)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Failed to register:', error)
      alert(error.response?.data?.error || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      alert('Please enter your username')
      return
    }
    if (!password) {
      alert('Please enter your password')
      return
    }

    try {
      setLoading(true)
      await loginUser(username.trim(), password)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      console.error('Failed to login:', error)
      alert(error.response?.data?.error || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  const handleBack = () => {
    setMode(null)
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setEmail('')
    setShowPassword(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-mono text-primary animate-pulse">
            {mode === 'guest' ? 'Initializing Guest Session...' : mode === 'login' ? 'Authenticating...' : 'Creating Identity...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-dark text-white font-display flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary text-3xl">key</span>
          <h2 className="text-primary text-2xl font-bold font-display tracking-widest">ENP</h2>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 font-mono">
            <span className="text-primary">&gt;</span> IDENTIFY YOURSELF
          </h1>
          <p className="text-white/60 text-base">
            You may proceed as a guest or register for extended controls.
          </p>
        </div>

        {/* Mode Selection or Registration Form */}
        {!mode ? (
          <div className="flex flex-col gap-4 px-4">
            {/* Guest Mode Button */}
            <button
              onClick={handleGuestMode}
              className="flex flex-col items-start justify-center p-6 border border-white/20 bg-white/5 hover:border-primary/70 hover:bg-primary/5 transition-all text-left rounded group"
            >
              <span className="text-white text-lg font-bold tracking-wide mb-2 group-hover:text-primary transition-colors">
                [GUEST MODE]
              </span>
              <span className="text-white/50 text-sm">
                Temporary access, no saved history.
              </span>
              <div className="mt-4 flex items-center gap-2 text-primary/70 text-sm font-mono">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                <span>Quick access, anonymous identity</span>
              </div>
            </button>

            {/* Register Account Button */}
            <button
              onClick={handleRegisterMode}
              className="flex flex-col items-start justify-center p-6 border border-white/20 bg-white/5 hover:border-primary/70 hover:bg-primary/5 transition-all text-left rounded group"
            >
              <span className="text-white text-lg font-bold tracking-wide mb-2 group-hover:text-primary transition-colors">
                [REGISTER ACCOUNT]
              </span>
              <span className="text-white/50 text-sm">
                Persistent identity, saved rooms, custom username.
              </span>
              <div className="mt-4 flex items-center gap-2 text-primary/70 text-sm font-mono">
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Choose your callsign</span>
              </div>
            </button>

            {/* Login Button */}
            <button
              onClick={handleLoginMode}
              className="flex flex-col items-start justify-center p-6 border border-white/20 bg-white/5 hover:border-primary/70 hover:bg-primary/5 transition-all text-left rounded group"
            >
              <span className="text-white text-lg font-bold tracking-wide mb-2 group-hover:text-primary transition-colors">
                [LOGIN]
              </span>
              <span className="text-white/50 text-sm">
                Access your existing account.
              </span>
              <div className="mt-4 flex items-center gap-2 text-primary/70 text-sm font-mono">
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Return to your identity</span>
              </div>
            </button>
          </div>
        ) : mode === 'register' ? (
          <div className="px-4">
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="border border-primary/30 bg-white/5 p-8 rounded">
                <h2 className="text-xl font-bold text-primary mb-6 font-mono">
                  [CREATE YOUR IDENTITY]
                </h2>
                
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 uppercase tracking-wider">
                      Choose Username *
                    </label>
                    <div className="flex items-center gap-2 border border-white/30 bg-transparent p-3 focus-within:border-primary focus-within:shadow-[0_0_10px_#00FFFF] transition-all">
                      <span className="text-primary font-mono">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="agent_name"
                        className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none font-mono"
                        maxLength={20}
                        autoFocus
                        required
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2 font-mono">
                      * Alphanumeric and underscores only, 3-20 characters
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 uppercase tracking-wider">
                      Email (Optional)
                    </label>
                    <div className="flex items-center gap-2 border border-white/30 bg-transparent p-3 focus-within:border-primary focus-within:shadow-[0_0_10px_#00FFFF] transition-all">
                      <span className="material-symbols-outlined text-primary text-sm">mail</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="agent@echonet.protocol"
                        className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none font-mono"
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2 font-mono">
                      * For account recovery (optional)
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 uppercase tracking-wider">
                      Password *
                    </label>
                    <div className="flex items-center gap-2 border border-white/30 bg-transparent p-3 focus-within:border-primary focus-within:shadow-[0_0_10px_#00FFFF] transition-all">
                      <span className="material-symbols-outlined text-primary text-sm">lock</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/50 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    <p className="text-white/40 text-xs mt-2 font-mono">
                      * Minimum 6 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 uppercase tracking-wider">
                      Confirm Password *
                    </label>
                    <div className="flex items-center gap-2 border border-white/30 bg-transparent p-3 focus-within:border-primary focus-within:shadow-[0_0_10px_#00FFFF] transition-all">
                      <span className="material-symbols-outlined text-primary text-sm">lock</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex items-start gap-3 text-sm text-white/60">
                      <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                      <p>
                        Your username will be visible to other users in chat rooms. 
                        Password secures your account for future access.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="submit"
                    disabled={!username.trim() || !password || password.length < 6}
                    className="flex-1 py-3 bg-primary text-background-dark font-bold tracking-wider hover:shadow-[0_0_15px_#00FFFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    [CONFIRM IDENTITY]
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-white/50 text-white hover:bg-white/10 transition-all"
                  >
                    [BACK]
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : mode === 'login' ? (
          <div className="px-4">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="border border-primary/30 bg-white/5 p-8 rounded">
                <h2 className="text-xl font-bold text-primary mb-6 font-mono">
                  [AUTHENTICATE IDENTITY]
                </h2>
                
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 uppercase tracking-wider">
                      Username
                    </label>
                    <div className="flex items-center gap-2 border border-white/30 bg-transparent p-3 focus-within:border-primary focus-within:shadow-[0_0_10px_#00FFFF] transition-all">
                      <span className="text-primary font-mono">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="agent_name"
                        className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none font-mono"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="flex items-center gap-2 border border-white/30 bg-transparent p-3 focus-within:border-primary focus-within:shadow-[0_0_10px_#00FFFF] transition-all">
                      <span className="material-symbols-outlined text-primary text-sm">lock</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/50 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <div className="flex items-start gap-3 text-sm text-white/60">
                      <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
                      <p>
                        Your credentials are verified securely. Sessions are encrypted end-to-end.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="submit"
                    disabled={!username.trim() || !password}
                    className="flex-1 py-3 bg-primary text-background-dark font-bold tracking-wider hover:shadow-[0_0_15px_#00FFFF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    [LOGIN]
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-white/50 text-white hover:bg-white/10 transition-all"
                  >
                    [BACK]
                  </button>
                </div>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setPassword('')
                      setConfirmPassword('')
                    }}
                    className="text-primary/70 hover:text-primary text-sm font-mono transition-colors"
                  >
                    Don't have an account? [REGISTER]
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : null}

        {/* Footer Note */}
        <p className="text-white/30 text-xs text-center mt-12 font-mono">
          No login required for basic access. All communications are encrypted.
        </p>

        {/* Back to Landing */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-primary/70 hover:text-primary text-sm font-mono transition-colors"
          >
            ← Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
