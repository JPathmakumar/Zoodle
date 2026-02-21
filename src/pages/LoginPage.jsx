import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

/**
 * LOGIN PAGE
 * 
 * Allows existing users to log in with email and password
 * Shows error messages if login fails
 */

export default function LoginPage({ onSwitchToSignup }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      // Navigation happens automatically when user is set
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container login">
        <div className="auth-header">
          <h1 className="auth-logo">🎮 Zoodle</h1>
          <p className="auth-title">Welcome Back!</p>
          <p className="auth-subtitle">Log in to your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="auth-switch-btn"
              onClick={onSwitchToSignup}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}