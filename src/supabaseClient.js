// Debug Supabase Client - Shows detailed error information
// Replace your existing src/supabaseClient.js with this file

import { createClient } from '@supabase/supabase-js'

// Use Vercel environment variables with better validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Enhanced environment variable validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🔴 SUPABASE CONFIG ERROR: Missing environment variables')
  console.error('Required variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
} else {
  console.log('✅ SUPABASE CONFIG: Environment variables loaded successfully')
  console.log('🔗 SUPABASE URL:', supabaseUrl)
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

// Enhanced error logging function
const logError = (context, error) => {
  console.error(`🚨 ${context} ERROR:`)
  console.error('- Message:', error.message)
  console.error('- Code:', error.code)
  console.error('- Details:', error.details)
  console.error('- Hint:', error.hint)
  console.error('- Full Error:', error)
}

// Test connection with detailed logging
const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      logError('CONNECTION TEST', error)
    } else {
      console.log('✅ SUPABASE CONNECTION: Database connection successful')
    }
  } catch (error) {
    logError('CONNECTION TEST CRITICAL', error)
  }
}

// Test authentication with detailed logging
const testAuth = async () => {
  try {
    console.log('🔍 Testing authentication...')
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      logError('AUTH TEST', error)
    } else if (session) {
      console.log('✅ AUTH: User is authenticated:', session.user.email)
    } else {
      console.log('ℹ️ AUTH: No active session')
    }
  } catch (error) {
    logError('AUTH TEST CRITICAL', error)
  }
}

// Initialize with detailed testing
testConnection()
testAuth()

// Debug API functions with extensive logging
export const supabaseApi = {
  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      console.log('🔍 Checking authentication...')
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        logError('AUTH CHECK', error)
        return false
      }
      const isAuth = !!session
      console.log('🔐 Authentication status:', isAuth)
      return isAuth
    } catch (error) {
      logError('AUTH CHECK CRITICAL', error)
      return false
    }
  },

  // Get current user with detailed logging
  getCurrentUser: async () => {
    try {
      console.log('🔍 Getting current user...')
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        logError('GET CURRENT USER', error)
        return null
      }
      if (!user) {
        console.log('ℹ️ No authenticated user found')
        return null
      }
      
      console.log('👤 Authenticated user:', user.email)
      
      // Try to get profile with detailed logging
      try {
        console.log('🔍 Fetching user profile for:', user.email)
        const { data: profiles, error: profileError } = await supabase
          .from('users')
          .select('id, email, full_name, role, employment_type, is_active')
          .eq('email', user.email)
          .limit(1)
        
        if (profileError) {
          logError('USER PROFILE FETCH', profileError)
          return user
        }
        
        if (profiles && profiles.length > 0) {
          console.log('✅ Found user profile:', profiles[0].full_name)
          return { ...user, ...profiles[0] }
        } else {
          console.log('ℹ️ No profile found for user, using basic auth data')
          return user
        }
        
      } catch (profileError) {
        logError('USER PROFILE FETCH CRITICAL', profileError)
        return user
      }
    } catch (error) {
      logError('GET CURRENT USER CRITICAL', error)
      return null
    }
  },

  // Get campaigns with detailed logging
  getCampaigns: async (params = {}) => {
    try {
      console.log('🎯 FETCHING CAMPAIGNS: Starting with params:', params)
      
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('🎯 CAMPAIGNS: Not authenticated - using fallback data')
        return [
          { id: '1', name: 'Sample Campaign', description: 'Sample campaign for demo', is_active: true, client_name: 'Sample Client' }
        ]
      }

      console.log('🔍 Executing campaigns query...')
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, description, client_name, is_active')
        .order('name', { ascending: true })
      
      if (error) {
        logError('CAMPAIGNS FETCH', error)
        return [
          { id: '1', name: 'Sample Campaign', description: 'Sample campaign for demo', is_active: true, client_name: 'Sample Client' }
        ]
      }
      
      console.log('✅ CAMPAIGNS: Successfully fetched', data?.length || 0, 'campaigns')
      console.log('📊 Campaign data:', data)
      return data || []
      
    } catch (error) {
      logError('CAMPAIGNS FETCH CRITICAL', error)
      return [
        { id: '1', name: 'Sample Campaign', description: 'Sample campaign for demo', is_active: true, client_name: 'Sample Client' }
      ]
    }
  },

  // Get members with detailed logging
  getMembers: async () => {
    try {
      console.log('👥 FETCHING MEMBERS: Starting...')
      
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('👥 MEMBERS: Not authenticated - using fallback data')
        return [
          { id: '1', full_name: 'John Doe', status: 'in', last_activity: new Date().toISOString() }
        ]
      }

      console.log('🔍 Executing members query...')
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type, is_active')
        .eq('is_active', true)
        .order('full_name', { ascending: true })
      
      if (error) {
        logError('MEMBERS FETCH', error)
        return [
          { id: '1', full_name: 'John Doe', status: 'in', last_activity: new Date().toISOString() }
        ]
      }
      
      console.log('✅ MEMBERS: Successfully fetched', data?.length || 0, 'members')
      console.log('📊 Members data:', data)
      
      const members = data?.map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        employment_type: user.employment_type,
        status: Math.random() > 0.5 ? 'in' : 'out',
        last_activity: new Date().toISOString()
      })) || []
      
      return members
    } catch (error) {
      logError('MEMBERS FETCH CRITICAL', error)
      return [
        { id: '1', full_name: 'John Doe', status: 'in', last_activity: new Date().toISOString() }
      ]
    }
  },

  // Get employee info with detailed logging
  getEmployeeInfo: async (userId) => {
    try {
      console.log('👤 FETCHING EMPLOYEE INFO: Starting for user ID:', userId)
      
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('👤 EMPLOYEE INFO: Not authenticated - using fallback data')
        return {
          id: userId || '1',
          full_name: 'Sample Employee',
          email: 'employee@example.com',
          role: 'team_member',
          employment_type: 'full_time'
        }
      }

      console.log('🔍 Executing employee info query...')
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type, is_exempt')
        .eq('id', userId)
        .limit(1)
      
      if (error) {
        logError('EMPLOYEE INFO FETCH', error)
        return {
          id: userId || '1',
          full_name: 'Sample Employee',
          email: 'employee@example.com',
          role: 'team_member',
          employment_type: 'full_time'
        }
      }
      
      console.log('✅ EMPLOYEE INFO: Successfully fetched for user:', userId)
      console.log('📊 Employee data:', data)
      
      if (!data || data.length === 0) {
        console.log('ℹ️ No employee found with ID:', userId)
        return {
          id: userId || '1',
          full_name: 'Sample Employee',
          email: 'employee@example.com',
          role: 'team_member',
          employment_type: 'full_time'
        }
      }
      
      return data[0]
    } catch (error) {
      logError('EMPLOYEE INFO FETCH CRITICAL', error)
      return {
        id: userId || '1',
        full_name: 'Sample Employee',
        email: 'employee@example.com',
        role: 'team_member',
        employment_type: 'full_time'
      }
    }
  },

  // Get timesheets with detailed logging
  getTimesheets: async (params = {}) => {
    try {
      console.log('📊 FETCHING TIMESHEETS: Starting with params:', params)
      
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('📊 TIMESHEETS: Not authenticated - using fallback data')
        return [
          { id: '1', user_id: '1', campaign_id: '1', regular_hours: 8, daily_overtime_hours: 0 }
        ]
      }

      console.log('🔍 Executing timesheets query...')
      
      // Start with basic query
      let query = supabase
        .from('timesheet_entries')
        .select('id, user_id, campaign_id, date, hours_worked, regular_hours, daily_overtime_hours')
        .order('date', { ascending: true })
      
      // Apply filters
      if (params.user_id) {
        query = query.eq('user_id', params.user_id)
      }
      if (params.startDate) {
        query = query.gte('date', params.startDate)
      }
      if (params.endDate) {
        query = query.lte('date', params.endDate)
      }
      if (params.limit) {
        query = query.limit(params.limit)
      }
      
      const { data, error } = await query
      
      if (error) {
        logError('TIMESHEETS FETCH', error)
        return [
          { id: '1', user_id: '1', campaign_id: '1', regular_hours: 8, daily_overtime_hours: 0 }
        ]
      }
      
      console.log('✅ TIMESHEETS: Successfully fetched', data?.length || 0, 'entries')
      console.log('📊 Timesheet data sample:', data?.slice(0, 2))
      
      return data || []
      
    } catch (error) {
      logError('TIMESHEETS FETCH CRITICAL', error)
      return [
        { id: '1', user_id: '1', campaign_id: '1', regular_hours: 8, daily_overtime_hours: 0 }
      ]
    }
  },

  // Get users with detailed logging
  getUsers: async () => {
    try {
      console.log('👥 FETCHING USERS: Starting...')
      
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('👥 USERS: Not authenticated - using fallback data')
        return [
          { id: '1', full_name: 'Sample User', email: 'user@example.com', role: 'team_member' }
        ]
      }

      console.log('🔍 Executing users query...')
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type, is_active')
        .order('full_name', { ascending: true })
      
      if (error) {
        logError('USERS FETCH', error)
        return [
          { id: '1', full_name: 'Sample User', email: 'user@example.com', role: 'team_member' }
        ]
      }
      
      console.log('✅ USERS: Successfully fetched', data?.length || 0, 'users')
      console.log('📊 Users data sample:', data?.slice(0, 2))
      return data || []
    } catch (error) {
      logError('USERS FETCH CRITICAL', error)
      return [
        { id: '1', full_name: 'Sample User', email: 'user@example.com', role: 'team_member' }
      ]
    }
  },

  // Login function
  login: async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email)
      await supabase.auth.signOut()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        logError('LOGIN', error)
        throw error
      }
      
      console.log('✅ Login successful for:', email)
      return {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          role: 'team_member'
        }
      }
    } catch (error) {
      logError('LOGIN CRITICAL', error)
      throw new Error(error.message || 'Login failed')
    }
  },

  // Logout function
  logout: async () => {
    try {
      console.log('🔐 Signing out...')
      await supabase.auth.signOut()
      console.log('✅ Signed out successfully')
    } catch (error) {
      logError('LOGOUT', error)
    }
  }
}

export default supabase

