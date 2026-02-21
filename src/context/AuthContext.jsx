import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const checkUser = async () => {
      try {
        // Get session (fast)
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        if (session?.user) {
          setUser(session.user)
          
          // Load profile in background - don't wait!
          loadProfileInBackground(session.user.id)
        }

        // Stop loading immediately
        setLoading(false)
      } catch (err) {
        console.error('Session error:', err)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && isMounted) {
          setUser(session.user)
          loadProfileInBackground(session.user.id)
        } else if (isMounted) {
          setUser(null)
          setUserProfile(null)
        }
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Load profile in background without blocking
  const loadProfileInBackground = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUserProfile(profile)
      }
    } catch (err) {
      console.error('Profile load error:', err)
    }
  }

  const signup = async (email, password, displayName, role) => {
    setError(null)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 500))

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: authData.user.id,
              email,
              display_name: displayName,
              role,
            },
          ])
          .select()
          .single()

        if (profileError) throw profileError

        setUser(authData.user)
        setUserProfile(profile)
        return { user: authData.user, profile }
      }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const login = async (email, password) => {
    setError(null)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      setUser(authData.user)
      loadProfileInBackground(authData.user.id)

      return { user: authData.user }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    setError(null)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signup,
    login,
    logout,
    isTeacher: userProfile?.role === 'teacher',
    isStudent: userProfile?.role === 'student',
    isAdmin: userProfile?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
