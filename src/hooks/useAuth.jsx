import { createContext, useContext, useState, useEffect } from 'react'
import { supabaseApi as api } from '../utils/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize authentication state
  useEffect(() => {
    let mounted = true
    let timeoutId = null

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...')
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('⏰ Auth initialization timeout - proceeding without auth')
            setLoading(false)
            setError('Authentication timeout - please try logging in again')
          }
        }, 10000) // 10 second timeout

        // Check for existing session in localStorage
        const authToken = localStorage.getItem('sb-rdsfpijojxtdyungrvsd-auth-token')
        
        if (authToken) {
          console.log('✅ Found existing auth token, attempting to restore session...')
          
          try {
            // Parse the token to get user info
            const tokenData = JSON.parse(authToken)
            
            if (tokenData.access_token && tokenData.user) {
              console.log('✅ Valid token found, setting user:', tokenData.user.email)
              
              // Create user object from token data
              const userData = {
                id: tokenData.user.id,
                email: tokenData.user.email,
                full_name: tokenData.user.user_metadata?.full_name || tokenData.user.email,
                role: tokenData.user.user_metadata?.role || 'team_member'
              }
              
              if (mounted) {
                setUser(userData)
                setError(null)
                clearTimeout(timeoutId)
                setLoading(false)
                console.log('✅ Authentication restored successfully')
              }
              return
            }
          } catch (parseError) {
            console.log('⚠️ Error parsing auth token:', parseError)
          }
        }

        console.log('ℹ️ No valid session found, user needs to log in')
        
        if (mounted) {
          clearTimeout(timeoutId)
          setLoading(false)
        }

      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) {
          clearTimeout(timeoutId)
          setError('Failed to initialize authentication')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Cleanup function
    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔐 Attempting login for:', email)

      const response = await api.login(email, password)
      
      if (response && response.user) {
        console.log('✅ Login successful:', response.user.email)
        setUser(response.user)
        setError(null)
        return response
      } else {
        throw new Error('Invalid login response')
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      const errorMessage = err.message || 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Logging out...')
      
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear state
      setUser(null)
      setError(null)
      
      console.log('✅ Logout successful')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Still clear local state even if API call fails
      setUser(null)
      setError(null)
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

