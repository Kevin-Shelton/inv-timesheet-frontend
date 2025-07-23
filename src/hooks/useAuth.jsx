import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient.js'

// Create the auth context
const AuthContext = createContext(null)

// RBAC Permission definitions
const PERMISSIONS = {
  VIEW_PAY_RATES: ['admin', 'executive'],
  VIEW_BILL_RATES: ['admin', 'executive'],
  MANAGE_USERS: ['admin'],
  MANAGE_CAMPAIGNS: ['admin', 'campaign_lead'],
  VIEW_ALL_TIMESHEETS: ['admin', 'executive', 'campaign_lead'],
  EDIT_ALL_TIMESHEETS: ['admin'],
  VIEW_REPORTS: ['admin', 'executive', 'campaign_lead'],
  MANAGE_HOLIDAYS: ['admin'],
  VIEW_USER_STATUS: ['admin', 'executive', 'campaign_lead']
}

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

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
        setProfileError(null)
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

  // Convert Supabase user to our user format with ROBUST profile fetching
  const setUserFromSupabaseUser = async (supabaseUser) => {
    try {
      console.log('🔐 AUTH: Converting Supabase user to app user format')
      console.log('🔐 AUTH: User ID:', supabaseUser.id)
      console.log('🔐 AUTH: User email:', supabaseUser.email)
      
      setProfileError(null)
      
      // Try to get user profile from database with timeout and retry
      let userProfile = null
      let profileFetchError = null
      
      try {
        console.log('🔐 AUTH: Attempting to fetch user profile from database...')
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000) // 10 second timeout
        })
        
        // CORRECTED: Use consistent variable names
        const queryPromise = supabase
          .from('users')
          .select(`
            id,
            email,
            full_name,
            role,
            company,
            employee_type,
            pay_rate_per_hour,
            is_active,
            campaign_id,
            created_at,
            updated_at
          `)
          .eq('id', supabaseUser.id)
          .limit(1)  // Use limit instead of single()
        
        // Race between query and timeout - CORRECTED variable name
        const { data: profiles, error: profileError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ])

        if (profileError) {
          console.warn('🔐 AUTH: Database profile query failed:', profileError.message)
          profileFetchError = profileError
        } else if (profiles && profiles.length > 0) {
          userProfile = profiles[0]  // Take the first result from the array
          console.log('🔐 AUTH: Successfully fetched user profile:', {
            full_name: userProfile.full_name,
            role: userProfile.role,
            employee_type: userProfile.employee_type,
            is_active: userProfile.is_active
          })
        } else {
          console.warn('🔐 AUTH: No profile found in database for user:', supabaseUser.email)
          profileFetchError = new Error('No profile found')
        }
        
      } catch (profileError) {
        console.warn('🔐 AUTH: Profile fetch failed, using fallback data:', profileError.message)
        profileFetchError = profileError
        setProfileError(profileError.message)
      }

      // Create user object with fallback logic for security
      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        
        // Basic info with fallbacks
        name: userProfile?.full_name || 
              supabaseUser.user_metadata?.full_name || 
              supabaseUser.email?.split('@')[0] || 
              'User',
              
        // CRITICAL: Role assignment with security fallbacks
        role: userProfile?.role || 
              supabaseUser.user_metadata?.role || 
              'team_member', // Default to most restrictive role
              
        company: userProfile?.company || 
                 supabaseUser.user_metadata?.company || 
                 'Invictus',
        
        // Extended profile data (RBAC-critical)
        employee_type: userProfile?.employee_type || null,
        pay_rate_per_hour: userProfile?.pay_rate_per_hour || null,
        is_active: userProfile?.is_active !== undefined ? userProfile.is_active : true,
        campaign_id: userProfile?.campaign_id || null,
        
        // Metadata
        profile_loaded: !!userProfile,
        profile_error: profileFetchError?.message || null,
        last_updated: userProfile?.updated_at || null,
        
        // Include Supabase data for advanced usage
        supabase_user: supabaseUser,
        profile: userProfile
      }

      // Security validation
      if (!userData.role || !['admin', 'executive', 'campaign_lead', 'team_member'].includes(userData.role)) {
        console.error('🔐 AUTH SECURITY: Invalid or missing role, defaulting to team_member')
        userData.role = 'team_member'
      }

      console.log('🔐 AUTH: User data prepared with RBAC info:', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        employee_type: userData.employee_type,
        is_active: userData.is_active,
        profile_loaded: userData.profile_loaded
      })

      setUser(userData)
      return userData
      
    } catch (error) {
      console.error('🔐 AUTH ERROR: Failed to set user from Supabase user:', error)
      setUser(null)
      setProfileError(error.message)
      return null
    }
  }

  // RBAC Permission checking functions
  const hasPermission = (permission) => {
    if (!user || !user.role) return false
    return PERMISSIONS[permission]?.includes(user.role) || false
  }

  const canViewPayRates = () => hasPermission('VIEW_PAY_RATES')
  const canViewBillRates = () => hasPermission('VIEW_BILL_RATES')
  const canManageUsers = () => hasPermission('MANAGE_USERS')
  const canManageCampaigns = () => hasPermission('MANAGE_CAMPAIGNS')
  const canViewAllTimesheets = () => hasPermission('VIEW_ALL_TIMESHEETS')
  const canEditAllTimesheets = () => hasPermission('EDIT_ALL_TIMESHEETS')
  const canViewReports = () => hasPermission('VIEW_REPORTS')
  const canManageHolidays = () => hasPermission('MANAGE_HOLIDAYS')
  const canViewUserStatus = () => hasPermission('VIEW_USER_STATUS')

  // Check if user is admin or executive (for sensitive data)
  const isPrivilegedUser = () => {
    return user && ['admin', 'executive'].includes(user.role)
  }

  // Supabase-based login function
  const login = async (email, password) => {
    console.log('🔐 AUTH LOGIN: Attempting login with:', { email })
    
    try {
      setLoading(true)
      setProfileError(null)

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
      
      // Convert to our user format with profile fetching
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
      setProfileError(null)
      
    } catch (error) {
      console.error('🔐 AUTH LOGOUT ERROR:', error)
      // Force local logout even if Supabase logout fails
      setUser(null)
      setProfileError(null)
      throw error
    }
  }

  // Refresh user profile data
  const refreshUserProfile = async () => {
    if (!user?.supabase_user) return null
    
    console.log('🔐 AUTH: Refreshing user profile...')
    return await setUserFromSupabaseUser(user.supabase_user)
  }

  // Get current session
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

  // Context value with RBAC functions
  const value = {
    // Core auth state
    user,
    loading,
    isAuthenticated: !!user,
    profileError,
    
    // Auth functions
    login,
    logout,
    refreshUserProfile,
    getCurrentSession,
    
    // RBAC permission functions
    hasPermission,
    canViewPayRates,
    canViewBillRates,
    canManageUsers,
    canManageCampaigns,
    canViewAllTimesheets,
    canEditAllTimesheets,
    canViewReports,
    canManageHolidays,
    canViewUserStatus,
    isPrivilegedUser,
    
    // Utilities
    supabase // Expose supabase client for advanced usage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Default export
export default useAuth

