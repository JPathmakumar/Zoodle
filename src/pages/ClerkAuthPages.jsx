import { SignIn } from '@clerk/clerk-react'
import './ClerkAuthPages.css'

/**
 * SIGN IN PAGE
 * Beautiful Clerk login page
 */
export function SignInPage() {
  return (
    <div className="clerk-auth-page">
      <div className="clerk-auth-container">
        <div className="clerk-header">
          <h1 className="clerk-logo">🎮 Zoodle</h1>
          <p className="clerk-subtitle">Welcome Back!</p>
          <p className="clerk-description">Log in to your account</p>
        </div>

        <SignIn 
          redirectUrl="/"
          routing="hash"
        />
      </div>
    </div>
  )
}

/**
 * DEFAULT EXPORT
 */
export default SignInPage