// Enhanced Supabase Client with Authentication and Error Handling
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Enhanced API with authentication checks and fallbacks
export const supabaseApi = {
  // Authentication helpers
  isAuthenticated: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Authentication methods
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { user: data.user, session: data.session }
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  },

  // Users API with fallback
  getUsers: async () => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('Not authenticated - using fallback users')
        return [
          { id: '1', full_name: 'John Doe', email: 'john@example.com', role: 'team_member' },
          { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
        ]
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type, is_exempt')
        .order('full_name', { ascending: true })
      
      if (error) {
        console.error('Error fetching users:', error)
        return [
          { id: '1', full_name: 'John Doe', email: 'john@example.com', role: 'team_member' },
          { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
        ]
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      return [
        { id: '1', full_name: 'John Doe', email: 'john@example.com', role: 'team_member' },
        { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
      ]
    }
  },

  getMembers: async () => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('Not authenticated - using fallback members')
        return [
          { id: '1', full_name: 'John Doe', email: 'john@example.com', role: 'team_member' },
          { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
        ]
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type')
        .order('full_name', { ascending: true })
      
      if (error) {
        console.error('Error fetching members:', error)
        return [
          { id: '1', full_name: 'John Doe', email: 'john@example.com', role: 'team_member' },
          { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
        ]
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching members:', error)
      return [
        { id: '1', full_name: 'John Doe', email: 'john@example.com', role: 'team_member' },
        { id: '2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'admin' }
      ]
    }
  },

  // FIXED: Employee Info API with proper error handling
  getEmployeeInfo: async (userId) => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('Not authenticated - using fallback employee info')
        return {
          id: userId || '1',
          full_name: 'Sample Employee',
          email: 'employee@example.com',
          role: 'team_member',
          employment_type: 'full_time'
        }
      }

      // Don't use .single() - use regular query and handle the result
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, role, employment_type, is_exempt')
        .eq('id', userId)
      
      if (error) {
        console.error('Error fetching employee info:', error)
        return {
          id: userId || '1',
          full_name: 'Sample Employee',
          email: 'employee@example.com',
          role: 'team_member',
          employment_type: 'full_time'
        }
      }

      // Handle the case where no user is found or multiple users are found
      if (!data || data.length === 0) {
        console.warn(`No employee found with ID: ${userId}`)
        return {
          id: userId || '1',
          full_name: 'Unknown Employee',
          email: 'unknown@example.com',
          role: 'team_member',
          employment_type: 'full_time'
        }
      }

      if (data.length > 1) {
        console.warn(`Multiple employees found with ID: ${userId}, using first one`)
      }

      // Return the first (and hopefully only) result
      return data[0]
    } catch (error) {
      console.error('Error fetching employee info:', error)
      return {
        id: userId || '1',
        full_name: 'Sample Employee',
        email: 'employee@example.com',
        role: 'team_member',
        employment_type: 'full_time'
      }
    }
  },

  // Campaigns API with fallback
  getCampaigns: async (params = {}) => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('Not authenticated - using fallback campaigns')
        return [
          { id: '1', name: 'Sample Campaign', description: 'Sample campaign for demo', is_active: true },
          { id: '2', name: 'Development Project', description: 'Software development project', is_active: true }
        ]
      }

      let query = supabase
        .from('campaigns')
        .select('id, name, description, is_active')
        .order('name', { ascending: true })
      
      if (params.is_active !== undefined) {
        query = query.eq('is_active', params.is_active)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching campaigns:', error)
        return [
          { id: '1', name: 'Sample Campaign', description: 'Sample campaign for demo', is_active: true },
          { id: '2', name: 'Development Project', description: 'Software development project', is_active: true }
        ]
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      return [
        { id: '1', name: 'Sample Campaign', description: 'Sample campaign for demo', is_active: true },
        { id: '2', name: 'Development Project', description: 'Software development project', is_active: true }
      ]
    }
  },

  // Timesheets API with fallback
  getTimesheets: async (params = {}) => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('Not authenticated - using fallback timesheet data')
        return [
          { id: '1', user_id: '1', campaign_id: '1', regular_hours: 8, overtime_hours: 0 },
          { id: '2', user_id: '2', campaign_id: '1', regular_hours: 7.5, overtime_hours: 0 }
        ]
      }

      let query = supabase
        .from('timesheet_entries')
        .select('*')
        .order('date', { ascending: false })
      
      if (params.user_id) {
        query = query.eq('user_id', params.user_id)
      }
      
      if (params.start_date) {
        query = query.gte('date', params.start_date)
      }
      
      if (params.end_date) {
        query = query.lte('date', params.end_date)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching timesheets:', error)
        return [
          { id: '1', user_id: '1', campaign_id: '1', regular_hours: 8, overtime_hours: 0 },
          { id: '2', user_id: '2', campaign_id: '1', regular_hours: 7.5, overtime_hours: 0 }
        ]
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching timesheets:', error)
      return [
        { id: '1', user_id: '1', campaign_id: '1', regular_hours: 8, overtime_hours: 0 },
        { id: '2', user_id: '2', campaign_id: '1', regular_hours: 7.5, overtime_hours: 0 }
      ]
    }
  },

  // FIXED: Create timesheet with proper validation
  createTimesheet: async (timesheetData) => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        throw new Error('Authentication required to create timesheet entries')
      }

      // Validate required fields
      if (!timesheetData.user_id) {
        throw new Error('User ID is required')
      }
      if (!timesheetData.date) {
        throw new Error('Date is required')
      }

      // Map common field names to database column names
      const dbData = {
        user_id: timesheetData.user_id,
        campaign_id: timesheetData.campaign_id || null,
        activity_id: timesheetData.activity_id || null,
        date: timesheetData.date,
        clock_in_time: timesheetData.clock_in_time || timesheetData.time_in || null,
        clock_out_time: timesheetData.clock_out_time || timesheetData.time_out || null,
        break_duration: timesheetData.break_duration || 0,
        lunch_duration: timesheetData.lunch_duration || 0,
        hours_worked: timesheetData.hours_worked || timesheetData.total_hours || 0,
        regular_hours: timesheetData.regular_hours || 0,
        daily_overtime_hours: timesheetData.daily_overtime_hours || timesheetData.overtime_hours || 0,
        weekly_overtime_hours: timesheetData.weekly_overtime_hours || 0,
        description: timesheetData.description || timesheetData.notes || '',
        is_manual_override: timesheetData.is_manual_override || false,
        override_reason: timesheetData.override_reason || null,
        calculation_method: timesheetData.calculation_method || 'automatic'
      }

      const { data, error } = await supabase
        .from('timesheet_entries')
        .insert([dbData])
        .select()
      
      if (error) {
        console.error('Error creating timesheet:', error)
        throw error
      }
      
      return data[0]
    } catch (error) {
      console.error('Error creating timesheet:', error)
      throw error
    }
  },

  // Update timesheet entry
  updateTimesheet: async (entryId, timesheetData) => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        throw new Error('Authentication required to update timesheet entries')
      }

      // Map common field names to database column names
      const dbData = {
        campaign_id: timesheetData.campaign_id,
        activity_id: timesheetData.activity_id,
        date: timesheetData.date,
        clock_in_time: timesheetData.clock_in_time || timesheetData.time_in,
        clock_out_time: timesheetData.clock_out_time || timesheetData.time_out,
        break_duration: timesheetData.break_duration,
        lunch_duration: timesheetData.lunch_duration,
        hours_worked: timesheetData.hours_worked || timesheetData.total_hours,
        regular_hours: timesheetData.regular_hours,
        daily_overtime_hours: timesheetData.daily_overtime_hours || timesheetData.overtime_hours,
        weekly_overtime_hours: timesheetData.weekly_overtime_hours,
        description: timesheetData.description || timesheetData.notes,
        is_manual_override: timesheetData.is_manual_override,
        override_reason: timesheetData.override_reason,
        calculation_method: timesheetData.calculation_method
      }

      // Remove undefined values
      Object.keys(dbData).forEach(key => {
        if (dbData[key] === undefined) {
          delete dbData[key]
        }
      })

      const { data, error } = await supabase
        .from('timesheet_entries')
        .update(dbData)
        .eq('id', entryId)
        .select()
      
      if (error) {
        console.error('Error updating timesheet:', error)
        throw error
      }
      
      return data[0]
    } catch (error) {
      console.error('Error updating timesheet:', error)
      throw error
    }
  },

  // Delete timesheet entry
  deleteTimesheet: async (entryId) => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        throw new Error('Authentication required to delete timesheet entries')
      }

      const { error } = await supabase
        .from('timesheet_entries')
        .delete()
        .eq('id', entryId)
      
      if (error) {
        console.error('Error deleting timesheet:', error)
        throw error
      }
      
      return true
    } catch (error) {
      console.error('Error deleting timesheet:', error)
      throw error
    }
  },

  // Get pending approvals
  getPendingApprovals: async () => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        console.warn('Not authenticated - using fallback approvals')
        return []
      }

      const { data, error } = await supabase
        .from('timesheet_entries')
        .select(`
          *,
          users!inner(id, full_name, email)
        `)
        .eq('status', 'pending')
        .order('date', { ascending: false })
      
      if (error) {
        console.error('Error fetching pending approvals:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
      return []
    }
  },

  // Approve timesheet
  approveTimesheet: async (entryId) => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        throw new Error('Authentication required to approve timesheet entries')
      }

      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({ status: 'approved' })
        .eq('id', entryId)
        .select()
      
      if (error) {
        console.error('Error approving timesheet:', error)
        throw error
      }
      
      return data[0]
    } catch (error) {
      console.error('Error approving timesheet:', error)
      throw error
    }
  },

  // Reject timesheet
  rejectTimesheet: async (entryId, reason) => {
    try {
      const isAuth = await supabaseApi.isAuthenticated()
      if (!isAuth) {
        throw new Error('Authentication required to reject timesheet entries')
      }

      const { data, error } = await supabase
        .from('timesheet_entries')
        .update({ 
          status: 'rejected',
          rejection_reason: reason 
        })
        .eq('id', entryId)
        .select()
      
      if (error) {
        console.error('Error rejecting timesheet:', error)
        throw error
      }
      
      return data[0]
    } catch (error) {
      console.error('Error rejecting timesheet:', error)
      throw error
    }
  }
}

export default supabaseApi

