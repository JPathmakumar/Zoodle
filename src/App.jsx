import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import AuthPages from './pages/AuthPages'
import AvatarSetup from './pages/AvatarSetup'
import HomePage from './pages/HomePage'
import GameHostPage from './pages/GameHostPage'
import GamePlayerPage from './pages/GamePlayerPage'
import './App.css'

/**
 * MAIN APP
 * 
 * Flow:
 * 1. Not logged in → Show Auth (Login/Signup)
 * 2. Logged in but no avatar → Show Avatar Setup
 * 3. Logged in with avatar → Show HomePage or Games
 */

function AppContent() {
  const { user, userProfile, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [gameId, setGameId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [playerName, setPlayerName] = useState(null)
  const [avatarSelected, setAvatarSelected] = useState(userProfile?.avatar ? true : false)

  // Loading
  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Zoodle...</p>
        </div>
      </div>
    )
  }

  // Not logged in - show auth
  if (!user) {
    return <AuthPages />
  }

  // Logged in but no avatar - show avatar setup
  if (!avatarSelected && !userProfile?.avatar) {
    return (
      <AvatarSetup 
        onComplete={() => setAvatarSelected(true)}
      />
    )
  }

  // Navigation functions
  const navigateToHost = (id) => {
    setGameId(id)
    setCurrentPage('host')
  }

  const navigateToPlayer = (id, name, sId) => {
    setGameId(id)
    setPlayerName(name)
    setSessionId(sId)
    setCurrentPage('player')
  }

  const backToHome = () => {
    setCurrentPage('home')
    setGameId(null)
    setSessionId(null)
    setPlayerName(null)
  }

  // Logged in with avatar - show app
  return (
    <div className="app">
      {currentPage === 'home' && (
        <HomePage onHostGame={navigateToHost} onJoinGame={navigateToPlayer} />
      )}
      {currentPage === 'host' && gameId && (
        <GameHostPage gameId={gameId} onBack={backToHome} />
      )}
      {currentPage === 'player' && gameId && sessionId && (
        <GamePlayerPage
          gameId={gameId}
          sessionId={sessionId}
          playerName={playerName}
          onBack={backToHome}
        />
      )}
    </div>
  )
}

/**
 * ROOT APP
 */
export default function App() {
  return <AppContent />
}
