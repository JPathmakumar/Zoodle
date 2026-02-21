import { useState } from 'react'
import LoginPage from './LoginPage'
import SignupPage from './SignupPage'

/**
 * AUTH PAGES
 * 
 * Wrapper that shows either login or signup
 * Users can switch between pages
 */

export default function AuthPages() {
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'

  return (
    <>
      {authMode === 'login' ? (
        <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />
      ) : (
        <SignupPage onSwitchToLogin={() => setAuthMode('login')} />
      )}
    </>
  )
}