import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './HomePage.css'

/**
 * HOME PAGE COMPONENT
 * 
 * After login, users see this page with:
 * - Centered layout with user profile in top-right
 * - Create Game (teachers only) or Join Game options
 * - Tab-based interface for easy switching
 * - Beautiful gradient design
 * - Real-time game joining
 */

export default function HomePage({ onHostGame, onJoinGame }) {
  // ============ AUTH & STATE ============
  const { userProfile, logout, isTeacher, isStudent } = useAuth()
  const [activeTab, setActiveTab] = useState(isTeacher ? 'create' : 'join')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // ============ CREATE GAME FORM STATE ============
  const [gameTitle, setGameTitle] = useState('')
  const [gameDescription, setGameDescription] = useState('')
  const [gameCategory, setGameCategory] = useState('')

  // ============ JOIN GAME FORM STATE ============
  const [gameCode, setGameCode] = useState('')
  const [playerName, setPlayerName] = useState(userProfile?.display_name || '')

  // ============ HANDLE LOGOUT ============
  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout error:', err)
      setError('Error logging out')
    }
  }

  // ============ CREATE GAME HANDLER ============
  const handleCreateGame = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (!gameTitle.trim()) {
        throw new Error('Please enter a game title')
      }

      if (gameTitle.length < 3) {
        throw new Error('Game title must be at least 3 characters')
      }

      // Insert new game into 'games' table
      const { data, error: dbError } = await supabase
        .from('games')
        .insert([
          {
            title: gameTitle.trim(),
            description: gameDescription.trim(),
            category: gameCategory || 'other',
          },
        ])
        .select()

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(dbError.message || 'Failed to create game')
      }

      if (!data || data.length === 0) {
        throw new Error('Game was not created')
      }

      const newGameId = data[0].id

      setSuccessMessage(`✅ Game "${gameTitle}" created successfully!`)

      // Clear form
      setGameTitle('')
      setGameDescription('')
      setGameCategory('')

      // Small delay so user sees success message
      setTimeout(() => {
        onHostGame(newGameId)
      }, 1000)
    } catch (err) {
      console.error('Create game error:', err)
      setError(err.message || 'Failed to create game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ============ JOIN GAME HANDLER ============
  const handleJoinGame = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (!gameCode.trim()) {
        throw new Error('Please enter a game code')
      }

      if (!playerName.trim()) {
        throw new Error('Please enter your name')
      }

      const trimmedCode = gameCode.trim()

      // Fetch game by ID to verify it exists
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id, title')
        .eq('id', trimmedCode)
        .single()

      if (gameError) {
        console.error('Game lookup error:', gameError)
        throw new Error('Game not found. Please check the code and try again.')
      }

      if (!game) {
        throw new Error('Game not found. Make sure you have the correct code!')
      }

      // Create a new game session for this player
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert([
          {
            game_id: trimmedCode,
            player_name: playerName.trim(),
          },
        ])
        .select()

      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Failed to join game. Please try again.')
      }

      if (!session || session.length === 0) {
        throw new Error('Session was not created')
      }

      const sessionId = session[0].id

      setSuccessMessage(`✅ Joined "${game.title}" successfully!`)

      // Clear form
      setGameCode('')
      setPlayerName('')

      // Small delay so user sees success message
      setTimeout(() => {
        onJoinGame(trimmedCode, playerName.trim(), sessionId)
      }, 1000)
    } catch (err) {
      console.error('Join game error:', err)
      setError(err.message || 'Failed to join game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ============ RENDER ============
  return (
    <div className="home-page">
      {/* USER PROFILE IN TOP RIGHT */}
      <div className="user-profile">
        <div className="user-info">
          <span className="user-role-icon">
            {isTeacher ? '👨‍🏫' : '👨‍🎓'}
          </span>
          <div className="user-details">
            <p className="user-name">{userProfile?.display_name || 'User'}</p>
            <p className="user-role">
              {isTeacher ? 'Teacher' : 'Student'}
            </p>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* CENTERED CONTAINER */}
      <div className="centered-container">
        {/* HEADER */}
        <div className="home-header">
          <h1 className="zoodle-logo">🎮 Zoodle</h1>
          <p className="welcome-text">
            {isTeacher
              ? '👨‍🏫 Welcome back, Teacher! Ready to engage your students?'
              : '👨‍🎓 Welcome! Ready to learn?'}
          </p>
        </div>

        {/* TAB BUTTONS */}
        <div className="tab-buttons">
          {isTeacher && (
            <button
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('create')
                setError(null)
                setSuccessMessage(null)
              }}
            >
              🎮 Create Game
            </button>
          )}

          <button
            className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('join')
              setError(null)
              setSuccessMessage(null)
            }}
          >
            👥 Join Game
          </button>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            {error}
            <button
              className="error-close"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="success-message">
            <span className="success-icon">✨</span>
            {successMessage}
          </div>
        )}

        {/* CREATE GAME FORM - TEACHER ONLY */}
        {isTeacher && activeTab === 'create' && (
          <form onSubmit={handleCreateGame} className="form create-form">
            <h2>🎮 Create New Game</h2>

            <div className="form-group">
              <label htmlFor="gameTitle">Game Title *</label>
              <input
                id="gameTitle"
                type="text"
                placeholder="e.g., Biology 101, Math Quiz"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                required
                disabled={loading}
                className="form-input"
                maxLength="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gameDescription">Description</label>
              <textarea
                id="gameDescription"
                placeholder="Describe what your quiz is about (optional)"
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                disabled={loading}
                className="form-textarea"
                maxLength="500"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gameCategory">Category</label>
              <select
                id="gameCategory"
                value={gameCategory}
                onChange={(e) => setGameCategory(e.target.value)}
                disabled={loading}
                className="form-select"
              >
                <option value="">Choose a category</option>
                <option value="science">🔬 Science</option>
                <option value="history">📚 History</option>
                <option value="math">🔢 Math</option>
                <option value="english">📖 English</option>
                <option value="language">🌍 Language</option>
                <option value="other">💡 Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !gameTitle.trim()}
              className="submit-btn"
            >
              {loading ? 'Creating...' : '🚀 Create Game'}
            </button>
          </form>
        )}

        {/* STUDENT ONLY MESSAGE */}
        {isStudent && activeTab === 'create' && (
          <div className="student-only-message">
            <p>👨‍🎓 Only teachers can create games.</p>
            <p>👇 Join a game to get started!</p>
          </div>
        )}

        {/* JOIN GAME FORM */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinGame} className="form join-form">
            <h2>👥 Join Game</h2>

            <div className="form-group">
              <label htmlFor="playerName">Your Name *</label>
              <input
                id="playerName"
                type="text"
                placeholder="Your full name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={loading}
                className="form-input"
                maxLength="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gameCode">Game Code *</label>
              <input
                id="gameCode"
                type="text"
                placeholder="Paste the code from your teacher"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                disabled={loading}
                className="form-input"
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !gameCode.trim() || !playerName.trim()}
              className="submit-btn"
            >
              {loading ? 'Joining...' : '✨ Join Game'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}