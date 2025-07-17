import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

// Create the auth context
const AuthContext = createContext(null)

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state and listen for changes
  useEffect(() => {
    console.log('🔐 AUTH PROVIDER: Initializing Supabase authentication...')
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('🔐 AUTH ERROR: Failed to get session:', error)
          setUser(null)
        } else if (session?.user) {
          console.log('🔐 AUTH SUCCESS: Found existing session for:', session.user.email)
          await setUserFromSupabaseUser(session.user)
        } else {
          console.log('🔐 AUTH INFO: No existing session found')
          setUser(null)
        }
      } catch (error) {
        console.error('🔐 AUTH ERROR: Session initialization failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AUTH STATE CHANGE:', event, session?.user?.email || 'no user')
      
      if (session?.user) {
        await setUserFromSupabaseUser(session.user)
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    // Initialize
    initializeAuth()

    // Cleanup subscription on unmount
    return () => {
      console.log('🔐 AUTH PROVIDER: Cleaning up auth subscription')
      subscription?.unsubscribe()
    }
  }, [])

  // Convert Supabase user to our user format - SIMPLIFIED VERSION
  const setUserFromSupabaseUser = async (supabaseUser) => {
    try {
      console.log('🔐 AUTH: Converting Supabase user to app user format')
      console.log('🔐 AUTH: User ID:', supabaseUser.id)
      console.log('🔐 AUTH: User email:', supabaseUser.email)
      console.log('🔐 AUTH: User metadata:', supabaseUser.user_metadata)
      
      // SIMPLIFIED: Skip database query and use auth data directly
      console.log('🔐 AUTH: Using simplified user data (no database query)')
      
      // Create user object compatible with existing system using only auth data
      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || 
              supabaseUser.email?.split('@')[0] || 
              'User',
        role: supabaseUser.user_metadata?.role || 
              (supabaseUser.email === 'admin@test.com' ? 'admin' : 'user'),
        company: supabaseUser.user_metadata?.company || 'Invictus',
        // Include additional Supabase data
        supabase_user: supabaseUser,
        profile: null // No database profile for now
      }

      console.log('🔐 AUTH: User data prepared (simplified):', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        company: userData.company
      })

      console.log('🔐 AUTH: Setting user state...')
      setUser(userData)
      console.log('🔐 AUTH: User state set successfully')
      
      return userData
    } catch (error) {
      console.error('🔐 AUTH ERROR: Failed to set user from Supabase user:', error)
      setUser(null)
      return null
    }
  }

  // Supabase-based login function (same interface as before)
  const login = async (email, password) => {
    console.log('🔐 AUTH LOGIN: Attempting login with:', { email })
    
    try {
      setLoading(true)

      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) {
        console.error('🔐 AUTH LOGIN ERROR:', error.message)
        throw new Error(error.message || 'Login failed')
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned')
      }

      console.log('🔐 AUTH LOGIN SUCCESS:', data.user.email)
      
      // Convert to our user format
      const userData = await setUserFromSupabaseUser(data.user)
      
      if (!userData) {
        throw new Error('Failed to process user data')
      }

      return { success: true, user: userData }

    } catch (error) {
      console.error('🔐 AUTH LOGIN ERROR:', error)
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Supabase-based logout function
  const logout = async () => {
    console.log('🔐 AUTH LOGOUT: Signing out user...')
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('🔐 AUTH LOGOUT ERROR:', error)
        throw error
      }
      
      console.log('🔐 AUTH LOGOUT SUCCESS: User signed out')
      setUser(null)
      
    } catch (error) {
      console.error('🔐 AUTH LOGOUT ERROR:', error)
      // Force local logout even if Supabase logout fails
      setUser(null)
      throw error
    }
  }

  // Get current session (helper function)
  const getCurrentSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('🔐 AUTH: Failed to get current session:', error)
      return null
    }
  }

  // Refresh user data (helper function) - SIMPLIFIED
  const refreshUser = async () => {
    try {
      console.log('🔐 AUTH: Refreshing user data...')
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (supabaseUser) {
        await setUserFromSupabaseUser(supabaseUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('🔐 AUTH: Failed to refresh user:', error)
      setUser(null)
    }
  }

  // Context value (same interface as before + new helpers)
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    // Additional Supabase-specific helpers
    getCurrentSession,
    refreshUser,
    supabase // Expose supabase client for advanced usage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth (same as before)
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Default export
export default useAuth

