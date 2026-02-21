import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

/**
 * SIGNUP PAGE
 * 
 * New users create account and choose role:
 * - Student: Takes quizzes
 * - Teacher: Creates and hosts quizzes
 */

export default function SignupPage({ onSwitchToLogin }) {
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState(null) // 'student' or 'teacher'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!role) {
      setError('Please select a role')
      return
    }

    setLoading(true)

    try {
      await signup(email, password, displayName, role)
      // Navigation happens automatically when user is set
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container signup">
        <div className="auth-header">
          <h1 className="auth-logo">🎮 Zoodle</h1>
          <p className="auth-title">Join the Fun!</p>
          <p className="auth-subtitle">Create your Zoodle account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* ROLE SELECTION */}
        {!role ? (
          <div className="role-selector">
            <p className="role-title">What's your role?</p>

            <button
              type="button"
              className="role-btn student"
              onClick={() => setRole('student')}
            >
              <div className="role-icon">👨‍🎓</div>
              <div className="role-name">Student</div>
              <div className="role-desc">Take quizzes & earn points</div>
            </button>

            <button
              type="button"
              className="role-btn teacher"
              onClick={() => setRole('teacher')}
            >
              <div className="role-icon">👨‍🏫</div>
              <div className="role-name">Teacher</div>
              <div className="role-desc">Create & host quizzes</div>
            </button>
          </div>
        ) : (
          <>
            {/* SIGNUP FORM */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="role-indicator">
                Role:{' '}
                <strong>{role === 'student' ? '👨‍🎓 Student' : '👨‍🏫 Teacher'}</strong>
                <button
                  type="button"
                  className="change-role-btn"
                  onClick={() => setRole(null)}
                >
                  Change
                </button>
              </div>

              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>

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
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={onSwitchToLogin}
                >
                  Log in
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}