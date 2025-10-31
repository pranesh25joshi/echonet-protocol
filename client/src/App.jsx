import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { AuthProvider } from './context/AuthContext'

// Pages
import LandingPage from './pages/LandingPage'
import CreateRoom from './pages/CreateRoom'
import JoinRoom from './pages/JoinRoom'
import ChatRoom from './pages/ChatRoom'
import Dashboard from './pages/Dashboard'
import AccessGranted from './pages/AccessGranted'
import RoomControl from './pages/RoomControl'
import Onboarding from './pages/Onboarding'
import AccessDenied from './pages/AccessDenied'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="/join-room" element={<JoinRoom />} />
            <Route path="/room/:roomKey" element={<ChatRoom />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/access-granted" element={<AccessGranted />} />
            <Route path="/room-control/:roomKey" element={<RoomControl />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/access-denied" element={<AccessDenied />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
